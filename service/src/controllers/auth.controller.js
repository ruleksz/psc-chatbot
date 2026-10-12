import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import pool from '../config/database.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function googleLogin(req, res) {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token tidak ditemukan',
      })
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { sub, email, name, picture } = payload

    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE google_id = ?',
      [sub]
    )

    let user
    if (existingUsers.length > 0) {
      // Update existing user
      user = existingUsers[0]
      await pool.query(
        'UPDATE users SET name = ?, email = ?, picture = ?, updated_at = NOW() WHERE google_id = ?',
        [name, email, picture, sub]
      )
    } else {
      // Create new user
      const [result] = await pool.query(
        'INSERT INTO users (google_id, email, name, picture, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [sub, email, name, picture]
      )
      user = {
        id: result.insertId,
        google_id: sub,
        email,
        name,
        picture,
      }
    }

    // Create JWT token
    const authToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        googleId: sub,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    return res.status(200).json({
      success: true,
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    })
  } catch (error) {
    console.error('Google login error:', error)

    if (error.message.includes('Token used too early')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid (digunakan terlalu awal)',
      })
    }

    if (error.message.includes('Invalid token')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal memproses login',
      error: error.message,
    })
  }
}

export function verifyAuthToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan',
      })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = decoded
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid',
    })
  }
}
