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
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react'

const appointmentSchema = z.object({
  scheduledAt: z.string().min(1, 'Veuillez sélectionner une date et heure'),
  notes: z.string().optional(),
})

type AppointmentInput = z.infer<typeof appointmentSchema>

export default function EditAppointmentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
  })

  useEffect(() => {
    if (!session || !params.id) return

    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appoitments/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setAppointment(data)
          // Set form values
          const dateTime = new Date(data.scheduledAt).toISOString().slice(0, 16)
          setValue('scheduledAt', dateTime)
          setValue('notes', data.notes || '')
        } else {
          router.push('/patient/appointments')
        }
      } catch (error) {
        console.error('Error fetching appointment:', error)
        router.push('/patient/appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [session, params.id, router, setValue])

  const onSubmit = async (data: AppointmentInput) => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/appoitments/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledAt: data.scheduledAt,
          notes: data.notes,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erreur lors de la modification')
      }

      router.push('/patient/appointments')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
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

  if (!appointment) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Rendez-vous non trouvé</p>
          <Link
            href='/patient/appointments'
            className='text-blue-600 hover:text-blue-700'
          >
            Retour à la liste
          </Link>
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
              href='/patient/appointments'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour à la liste
            </Link>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                <Calendar className='w-10 h-10 text-blue-600' />
                Modifier le Rendez-vous
              </h1>
              <p className='text-gray-600'>Modifiez les détails de votre rendez-vous</p>
            </div>
          </div>

          {/* Appointment Info */}
          <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Informations du Rendez-vous</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4 text-gray-400' />
                <span className='text-gray-900'>
                  Médecin: Dr. {appointment.doctor?.user?.email?.split('@')[0]} - {appointment.doctor?.specialization}
                </span>
              </div>
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

            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Date et heure <span className='text-red-500'>*</span>
                </label>
                <input
                  type='datetime-local'
                  {...register('scheduledAt')}
                  min={new Date().toISOString().slice(0, 16)}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                />
                {errors.scheduledAt && (
                  <p className='mt-1 text-sm text-red-600'>{errors.scheduledAt.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Notes (optionnel)
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  placeholder='Ajoutez des notes ou informations supplémentaires...'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none'
                />
                {errors.notes && (
                  <p className='mt-1 text-sm text-red-600'>{errors.notes.message}</p>
                )}
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
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className='w-5 h-5' />
                    Enregistrer
                  </>
                )}
              </button>
              <Link
                href='/patient/appointments'
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

