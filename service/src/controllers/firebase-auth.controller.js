import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function firebaseLogin(req, res) {
  try {
    const { firebaseUid, email, name, picture } = req.body

    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID dan email diperlukan',
      })
    }

    // Check if user exists (using firebase UID as google_id)
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE google_id = ?',
      [firebaseUid]
    )

    let user
    if (existingUsers.length > 0) {
      // Update existing user
      user = existingUsers[0]
      await pool.query(
        'UPDATE users SET name = ?, email = ?, picture = ?, updated_at = NOW() WHERE google_id = ?',
        [name, email, picture, firebaseUid]
      )
    } else {
      // Create new user
      const [result] = await pool.query(
        'INSERT INTO users (google_id, email, name, picture, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [firebaseUid, email, name, picture]
      )
      user = {
        id: result.insertId,
        google_id: firebaseUid,
        email,
        name,
        picture,
      }
    }

    // Generate JWT token
    const authToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        firebaseUid: firebaseUid,
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
    console.error('Firebase login error:', error)

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
