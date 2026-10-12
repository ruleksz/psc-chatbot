import { useState } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function LoginPage({ onLoginSuccess }) {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleLoginSuccess(credentialResponse) {
    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
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
      console.error('Login error:', err)
      setError(err.message || 'Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  function handleLoginError() {
    setError('Login dengan Google gagal')
  }

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-700">
            ❌ VITE_GOOGLE_CLIENT_ID tidak ditemukan di .env
          </p>
          <p className="mt-2 text-sm text-red-600">
            Setup Google OAuth terlebih dahulu. Lihat: GOOGLE_OAUTH_SETUP.md
          </p>
        </div>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
                text="signin_with"
                size="large"
                width="100%"
              />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="rounded-lg bg-blue-50 p-4 text-center text-sm text-blue-700">
                <div className="inline-block size-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700"></div>
                <p className="mt-2">Memproses login...</p>
              </div>
            )}

            {/* Info */}
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                ℹ️ Demo Account
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Gunakan akun Google Anda untuk login. Akun akan otomatis dibuat
                atau diupdate di database.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-400">
            © 2026 PSC Chatbot. Powered by Groq AI
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export default LoginPage
