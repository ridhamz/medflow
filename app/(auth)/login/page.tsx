'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  AlertCircle,
  Stethoscope,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [clientReady, setClientReady] = useState(false)

  useEffect(() => {
    setClientReady(true)
  }, [])

  useEffect(() => {
    const sendLog = async (payload: any) => {
      try {
        await fetch('/api/debug/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (e) {
        // ignore
      }
    }

    const onError = (event: any) => {
      sendLog({ type: 'error', message: event?.message || String(event) })
    }

    const onRejection = (event: any) => {
      sendLog({ type: 'unhandledrejection', reason: event?.reason })
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError(result.error || 'Email ou mot de passe incorrect')
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        // Wait a bit for session to be set, then redirect
        await new Promise(resolve => setTimeout(resolve, 100))
        window.location.href = callbackUrl
        return
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Une erreur est survenue')
    }
    
    setIsLoading(false)
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full'>
        {/* Logo & Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300'>
            <Stethoscope className='w-10 h-10 text-white' />
          </div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
            MedFlow
          </h1>
          <p className='text-gray-600 text-sm'>
            Système de gestion médicale
          </p>
        </div>

        {/* Login Card */}
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Connexion
            </h2>
            <p className='text-sm text-gray-600'>
              Connectez-vous à votre compte pour continuer
            </p>
          </div>

          <form className='space-y-5' onSubmit={handleSubmit}>
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                Email
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm'
                  placeholder='votre@email.com'
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                Mot de passe
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm'
                  placeholder='••••••••'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className='w-5 h-5' />
                  Se connecter
                </>
              )}
            </button>

            {/* Register Link */}
            <div className='text-center pt-2'>
              <p className='text-sm text-gray-600'>
                Pas de compte?{' '}
                <Link 
                  href='/register' 
                  className='font-semibold text-blue-600 hover:text-blue-700 transition-colors'
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className='mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100'>
          <div className='flex items-center gap-2 mb-3'>
            <Sparkles className='w-5 h-5 text-blue-600' />
            <p className='text-sm font-semibold text-blue-900'>Comptes de démonstration</p>
          </div>
          <div className='space-y-2 text-xs text-blue-800'>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>👨‍💼 Admin:</span>
              <span className='font-mono'>admin@medflow.tn / admin123</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>👨‍⚕️ Médecin:</span>
              <span className='font-mono'>doctor@medflow.tn / doctor123</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>👩‍💼 Réceptionniste:</span>
              <span className='font-mono'>receptionist@medflow.tn / receptionist123</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>🤖 Patient:</span>
              <span className='font-mono'>patient@medflow.tn / patient123</span>
            </div>
          </div>
        </div>

        {/* Client JS Status (Debug) */}
        {!clientReady && (
          <div className='mt-4 text-center'>
            <p className='text-xs text-gray-400'>Chargement...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
