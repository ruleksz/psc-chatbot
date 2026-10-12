import express from 'express'
import { googleLogin } from '../controllers/auth.controller.js'
import { firebaseLogin } from '../controllers/firebase-auth.controller.js'

const router = express.Router()

// POST /api/auth/google - Verify Google token (Google Cloud OAuth)
router.post('/google', googleLogin)

// POST /api/auth/firebase - Verify Firebase token (Recommended - No credit card needed)
router.post('/firebase', firebaseLogin)

export default router
