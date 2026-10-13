import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

function FirebaseLoginPage({ onLoginSuccess }) {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleDemoLogin() {
    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch('http://localhost:5000/api/auth/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Demo login gagal')
      }

      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLoginSuccess(data.user)
    } catch (err) {
      console.error('Demo login error:', err)
      setError(err.message || 'Terjadi kesalahan saat demo login')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    try {
      setError(null)
      setIsLoading(true)

      // Sign in dengan Firebase Google provider
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      const token = await user.getIdToken()

      // Send ke backend untuk verify
      const response = await fetch('http://localhost:5000/api/auth/firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          firebaseUid: user.uid,
          email: user.email,
          name: user.displayName,
          picture: user.photoURL,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal')
      }

      // Save token to localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Call success callback
      onLoginSuccess(data.user)
    } catch (err) {
      console.error('Firebase login error:', err)
      setError(err.message || 'Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl font-bold text-sky-700">
            P
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white">PSC Chatbot</h1>
          <p className="mt-2 text-slate-400">
            Chat dengan AI tentang esports & gaming
          </p>
        </div>

        {/* Login Card */}
        <div className="space-y-6 rounded-2xl bg-white p-8 shadow-xl">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              <p className="font-semibold">❌ Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg bg-white border-2 border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="inline-block size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
                Memproses...
              </>
            ) : (
              <>
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Masuk dengan Google
              </>
            )}
          </button>

          {/* Demo Login Button */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg bg-sky-50 border-2 border-sky-300 px-4 py-3 font-medium text-sky-700 transition hover:bg-sky-100 hover:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="inline-block size-4 animate-spin rounded-full border-2 border-sky-300 border-t-sky-700"></div>
                Memproses...
              </>
            ) : (
              <>
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"></circle>
                  <path d="M12 1v6m0 6v6"></path>
                  <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24"></path>
                  <path d="M1 12h6m6 0h6"></path>
                  <path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
                </svg>
                Demo Login
              </>
            )}
          </button>

          {/* Info */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              ℹ️ Firebase Authentication
            </p>
            <p className="mt-2 text-sm text-blue-700">
              Login menggunakan akun Google Anda. Gratis, aman, dan tidak perlu password.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          © 2026 PSC Chatbot. Powered by Groq AI + Firebase
        </p>
      </div>
    </div>
  )
}

export default FirebaseLoginPage
