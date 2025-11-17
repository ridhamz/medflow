'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const patientSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est obligatoire'),
  lastName: z.string().min(2, 'Le nom est obligatoire'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro invalide'),
  dateOfBirth: z.string(),
  address: z.string().optional(),
})

type PatientInput = z.infer<typeof patientSchema>

export default function NewPatientPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
  })

  const onSubmit = async (data: PatientInput) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la création du patient')
      }

  router.push('/admin/patients')
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='py-6'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>
          Ajouter un patient
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className='bg-white p-6 rounded-lg shadow space-y-6'>
          {error && (
            <div className='bg-red-50 p-4 rounded-lg'>
              <p className='text-sm text-red-800'>{error}</p>
            </div>
          )}

          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Prénom
              </label>
              <input
                {...register('firstName')}
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              />
              {errors.firstName && (
                <p className='mt-1 text-sm text-red-600'>{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nom
              </label>
              <input
                {...register('lastName')}
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              />
              {errors.lastName && (
                <p className='mt-1 text-sm text-red-600'>{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <input
                {...register('email')}
                type='email'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              />
              {errors.email && (
                <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Téléphone
              </label>
              <input
                {...register('phone')}
                type='tel'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              />
              {errors.phone && (
                <p className='mt-1 text-sm text-red-600'>{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Date de naissance
              </label>
              <input
                {...register('dateOfBirth')}
                type='date'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              />
              {errors.dateOfBirth && (
                <p className='mt-1 text-sm text-red-600'>{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Adresse (optionnel)
              </label>
              <input
                {...register('address')}
                type='text'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          <div className='flex gap-4'>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? 'Création...' : 'Créer le patient'}
            </button>
            <button
              type='button'
              onClick={() => router.back()}
              className='px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400'
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
