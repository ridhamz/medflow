'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  AlertCircle
} from 'lucide-react'

const patientSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est obligatoire'),
  lastName: z.string().min(2, 'Le nom est obligatoire'),
  phone: z.string().min(8, 'Numéro invalide'),
  dateOfBirth: z.string(),
  address: z.string().optional(),
})

type PatientInput = z.infer<typeof patientSchema>

export default function EditPatientPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
  })

  useEffect(() => {
    if (!session || !params.id) return

    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          reset({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth).toISOString().split('T')[0]
              : '',
            address: data.address || '',
          })
        } else {
          router.push('/admin/patients')
        }
      } catch (error) {
        console.error('Error fetching patient:', error)
        router.push('/admin/patients')
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [session, params.id, router, reset])

  const onSubmit = async (data: PatientInput) => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/patients/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      router.push(`/admin/patients/${params.id}`)
    } catch (err) {
      setError('Une erreur est survenue lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return <div>Redirecting...</div>
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 text-blue-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <Link
              href={`/admin/patients/${params.id}`}
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour aux détails
            </Link>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                  <User className='w-10 h-10 text-blue-600' />
                  Modifier le patient
                </h1>
                <p className='text-gray-600'>Mettez à jour les informations du patient</p>
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
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Prénom <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('firstName')}
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                />
                {errors.firstName && (
                  <p className='mt-1 text-sm text-red-600'>{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nom <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('lastName')}
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                />
                {errors.lastName && (
                  <p className='mt-1 text-sm text-red-600'>{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Téléphone <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('phone')}
                  type='tel'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                />
                {errors.phone && (
                  <p className='mt-1 text-sm text-red-600'>{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Date de naissance <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('dateOfBirth')}
                  type='date'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                />
                {errors.dateOfBirth && (
                  <p className='mt-1 text-sm text-red-600'>{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className='sm:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Adresse
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none'
                />
              </div>
            </div>

            <div className='flex gap-4 mt-8 pt-6 border-t border-gray-200'>
              <button
                type='submit'
                disabled={saving}
                className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {saving ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className='w-5 h-5' />
                    Enregistrer les modifications
                  </>
                )}
              </button>
              <Link
                href={`/admin/patients/${params.id}`}
                className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium'
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

