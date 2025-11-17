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
  DollarSign,
  AlertCircle
} from 'lucide-react'

const serviceSchema = z.object({
  name: z.string().min(2, 'Le nom est obligatoire'),
  description: z.string().optional(),
  price: z.string().min(1, 'Le prix est obligatoire').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Le prix doit être un nombre positif'
  ),
  isActive: z.boolean(),
})

type ServiceInput = z.infer<typeof serviceSchema>

export default function EditServicePage() {
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
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
  })

  useEffect(() => {
    if (!session || !params.id) return

    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          reset({
            name: data.name || '',
            description: data.description || '',
            price: String(data.price) || '',
            isActive: data.isActive !== undefined ? data.isActive : true,
          })
        } else {
          router.push('/admin/services')
        }
      } catch (error) {
        console.error('Error fetching service:', error)
        router.push('/admin/services')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [session, params.id, router, reset])

  const onSubmit = async (data: ServiceInput) => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/services/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erreur lors de la mise à jour')
      }

      router.push('/admin/services')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour')
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
          <Loader2 className='w-12 h-12 text-purple-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <Link
              href='/admin/services'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour à la liste
            </Link>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                <DollarSign className='w-10 h-10 text-purple-600' />
                Modifier le service
              </h1>
              <p className='text-gray-600'>Mettez à jour les informations du service</p>
            </div>
          </div>

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

            <div className='grid grid-cols-1 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nom du service <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('name')}
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
                />
                {errors.name && (
                  <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none'
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Prix (TND) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    {...register('price')}
                    type='number'
                    step='0.01'
                    min='0'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
                  />
                  {errors.price && (
                    <p className='mt-1 text-sm text-red-600'>{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Statut
                  </label>
                  <div className='flex items-center gap-4 mt-2'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        {...register('isActive')}
                        type='checkbox'
                        className='w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500'
                      />
                      <span className='text-sm text-gray-700'>Service actif</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex gap-4 mt-8 pt-6 border-t border-gray-200'>
              <button
                type='submit'
                disabled={saving}
                className='inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed'
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
                href='/admin/services'
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

