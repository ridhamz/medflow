'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Stethoscope, UserPlus, Loader2, AlertCircle } from 'lucide-react'

const doctorSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  specialization: z.string().min(2, 'La spécialisation est obligatoire'),
  licenseNumber: z.string().optional(),
})

type DoctorInput = z.infer<typeof doctorSchema>

export default function NewDoctorPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorInput>({
    resolver: zodResolver(doctorSchema),
  })

  const onSubmit = async (data: DoctorInput) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erreur lors de la création du médecin')
      }

      router.push('/admin/doctors')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                  <Stethoscope className='w-10 h-10 text-green-600' />
                  Ajouter un médecin
                </h1>
                <p className='text-gray-600'>Créez un nouveau compte médecin pour votre clinique</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='bg-white rounded-xl shadow-sm p-8 border border-gray-100'
          >
            {error && (
              <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3'>
                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            )}

            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div className='sm:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('email')}
                  type='email'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                />
                {errors.email && (
                  <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
                )}
              </div>

              <div className='sm:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Mot de passe <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('password')}
                  type='password'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                />
                {errors.password && (
                  <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>
                )}
                <p className='mt-1 text-xs text-gray-500'>Minimum 6 caractères</p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Spécialisation <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('specialization')}
                  type='text'
                  placeholder='Ex: Cardiologie, Dermatologie...'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                />
                {errors.specialization && (
                  <p className='mt-1 text-sm text-red-600'>{errors.specialization.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Numéro de licence
                </label>
                <input
                  {...register('licenseNumber')}
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                />
              </div>
            </div>

            <div className='flex gap-4 mt-8 pt-6 border-t border-gray-200'>
              <button
                type='submit'
                disabled={loading}
                className='inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className='w-5 h-5' />
                    Créer le médecin
                  </>
                )}
              </button>
              <button
                type='button'
                onClick={() => router.back()}
                className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium'
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

