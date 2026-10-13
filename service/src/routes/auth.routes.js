import express from 'express'
import { googleLogin } from '../controllers/auth.controller.js'
import { firebaseLogin } from '../controllers/firebase-auth.controller.js'
import jwt from 'jsonwebtoken'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// POST /api/auth/google - Verify Google token (Google Cloud OAuth)
router.post('/google', googleLogin)

// POST /api/auth/firebase - Verify Firebase token (Recommended - No credit card needed)
router.post('/firebase', firebaseLogin)

// POST /api/auth/demo - Demo login for testing (development only)
router.post('/demo', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Demo login tidak tersedia di production'
    })
  }

  const demoUser = {
    id: 1,
    email: 'demo@psc-chatbot.local',
    name: 'Demo User',
    picture: 'https://i.pravatar.cc/150?img=1'
  }

  const authToken = jwt.sign(
    {
      userId: demoUser.id,
      email: demoUser.email,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  )

  return res.json({
    success: true,
    token: authToken,
    user: demoUser
  })
})

export default router
