'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Settings,
  Save,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Users,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react'

const clinicSchema = z.object({
  name: z.string().min(2, 'Le nom de la clinique est obligatoire'),
  address: z.string().min(5, 'L\'adresse est obligatoire'),
  phone: z.string().min(8, 'Le numéro de téléphone est obligatoire'),
})

type ClinicInput = z.infer<typeof clinicSchema>

interface Clinic {
  id: string
  name: string
  address: string
  phone: string
  createdAt: string
  _count?: {
    users: number
    services: number
    appointments: number
  }
}

export default function ClinicSettingsPage() {
  const { data: session } = useSession()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClinicInput>({
    resolver: zodResolver(clinicSchema),
  })

  useEffect(() => {
    if (!session) return

    const fetchClinic = async () => {
      try {
        const res = await fetch('/api/clinic')
        if (res.ok) {
          const data = await res.json()
          setClinic(data)
          reset({
            name: data.name || '',
            address: data.address || '',
            phone: data.phone || '',
          })
        }
      } catch (error) {
        console.error('Error fetching clinic:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClinic()
  }, [session, reset])

  const onSubmit = async (data: ClinicInput) => {
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/clinic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erreur lors de la mise à jour')
      }

      const updatedClinic = await res.json()
      setClinic(updatedClinic)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
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
          <Loader2 className='w-12 h-12 text-gray-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
              <Settings className='w-10 h-10 text-gray-600' />
              Paramètres de la Clinique
            </h1>
            <p className='text-gray-600'>
              Configurez les informations de votre clinique
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Settings Form */}
            <div className='lg:col-span-2'>
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

                {success && (
                  <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3'>
                    <AlertCircle className='w-5 h-5 text-green-600 flex-shrink-0' />
                    <p className='text-sm text-green-800'>
                      Les paramètres ont été mis à jour avec succès
                    </p>
                  </div>
                )}

                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                      <Building2 className='w-4 h-4' />
                      Nom de la clinique <span className='text-red-500'>*</span>
                    </label>
                    <input
                      {...register('name')}
                      type='text'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all'
                    />
                    {errors.name && (
                      <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                      <MapPin className='w-4 h-4' />
                      Adresse <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                      {...register('address')}
                      rows={3}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none'
                    />
                    {errors.address && (
                      <p className='mt-1 text-sm text-red-600'>{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                      <Phone className='w-4 h-4' />
                      Téléphone <span className='text-red-500'>*</span>
                    </label>
                    <input
                      {...register('phone')}
                      type='tel'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all'
                    />
                    {errors.phone && (
                      <p className='mt-1 text-sm text-red-600'>{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className='flex gap-4 mt-8 pt-6 border-t border-gray-200'>
                  <button
                    type='submit'
                    disabled={saving}
                    className='inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed'
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
                </div>
              </form>
            </div>

            {/* Statistics Sidebar */}
            <div className='space-y-6'>
              <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Statistiques
                </h3>
                <div className='space-y-4'>
                  {clinic?._count && (
                    <>
                      <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                        <span className='text-sm text-gray-600 flex items-center gap-2'>
                          <Users className='w-4 h-4' />
                          Utilisateurs
                        </span>
                        <span className='font-semibold text-gray-900'>
                          {clinic._count.users}
                        </span>
                      </div>
                      <div className='flex items-center justify-between p-3 bg-purple-50 rounded-lg'>
                        <span className='text-sm text-gray-600 flex items-center gap-2'>
                          <DollarSign className='w-4 h-4' />
                          Services
                        </span>
                        <span className='font-semibold text-gray-900'>
                          {clinic._count.services}
                        </span>
                      </div>
                      <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                        <span className='text-sm text-gray-600 flex items-center gap-2'>
                          <Calendar className='w-4 h-4' />
                          Rendez-vous
                        </span>
                        <span className='font-semibold text-gray-900'>
                          {clinic._count.appointments}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {clinic && (
                <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Informations
                  </h3>
                  <div className='space-y-3 text-sm'>
                    <div>
                      <span className='text-gray-500'>Créée le</span>
                      <p className='text-gray-900 font-medium'>
                        {new Date(clinic.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <span className='text-gray-500'>ID Clinique</span>
                      <p className='text-gray-900 font-mono text-xs break-all'>
                        {clinic.id}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

