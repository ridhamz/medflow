'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Mail,
  Lock,
  Building2,
  MapPin,
  Phone,
  UserPlus,
  Loader2,
  AlertCircle,
  Stethoscope,
  Eye,
  EyeOff,
} from 'lucide-react'

const registerSchema = z
  .object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string(),
    clinicName: z.string().min(3, 'Le nom de la clinique est obligatoire'),
    clinicAddress: z.string().min(5, 'L\'adresse est obligatoire'),
    clinicPhone: z.string().min(8, 'Le numéro de téléphone est invalide'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type RegisterInput = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          clinicName: data.clinicName,
          clinicAddress: data.clinicAddress,
          clinicPhone: data.clinicPhone,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        setError(error.message || 'Erreur lors de l\'inscription')
        setIsLoading(false)
        return
      }

      router.push('/login?success=registered')
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription')
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-lg w-full'>
        {/* Logo & Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300'>
            <Stethoscope className='w-10 h-10 text-white' />
          </div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2'>
            MedFlow
          </h1>
          <p className='text-gray-600 text-sm'>
            Créez votre clinique en quelques minutes
          </p>
        </div>

        {/* Register Card */}
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Inscription
            </h2>
            <p className='text-sm text-gray-600'>
              Remplissez les informations ci-dessous pour créer votre compte
            </p>
          </div>

          <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                Email <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  {...register('email')}
                  id='email'
                  type='email'
                  className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm'
                  placeholder='admin@clinique.tn'
                />
              </div>
              {errors.email && (
                <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Clinic Name */}
            <div>
              <label htmlFor='clinicName' className='block text-sm font-medium text-gray-700 mb-2'>
                Nom de la clinique <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Building2 className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  {...register('clinicName')}
                  id='clinicName'
                  type='text'
                  className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm'
                  placeholder='Clinique Méditerranée'
                />
              </div>
              {errors.clinicName && (
                <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.clinicName.message}
                </p>
              )}
            </div>

            {/* Clinic Address */}
            <div>
              <label htmlFor='clinicAddress' className='block text-sm font-medium text-gray-700 mb-2'>
                Adresse <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <MapPin className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  {...register('clinicAddress')}
                  id='clinicAddress'
                  type='text'
                  className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm'
                  placeholder='Avenue Habib Bourguiba, Tunis'
                />
              </div>
              {errors.clinicAddress && (
                <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.clinicAddress.message}
                </p>
              )}
            </div>

            {/* Clinic Phone */}
            <div>
              <label htmlFor='clinicPhone' className='block text-sm font-medium text-gray-700 mb-2'>
                Téléphone <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Phone className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  {...register('clinicPhone')}
                  id='clinicPhone'
                  type='tel'
                  className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm'
                  placeholder='+216 71 123 456'
                />
              </div>
              {errors.clinicPhone && (
                <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.clinicPhone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                Mot de passe <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  {...register('password')}
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm'
                  placeholder='Minimum 8 caractères'
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
              {errors.password && (
                <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-2'>
                Confirmer le mot de passe <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  {...register('confirmPassword')}
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm'
                  placeholder='Répétez le mot de passe'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Inscription...
                </>
              ) : (
                <>
                  <UserPlus className='w-5 h-5' />
                  Créer mon compte
                </>
              )}
            </button>

            {/* Login Link */}
            <div className='text-center pt-2'>
              <p className='text-sm text-gray-600'>
                Déjà inscrit?{' '}
                <Link 
                  href='/login' 
                  className='font-semibold text-indigo-600 hover:text-indigo-700 transition-colors'
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
