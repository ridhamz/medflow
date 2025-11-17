'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Stethoscope,
  Clock
} from 'lucide-react'

const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Veuillez sélectionner un médecin'),
  scheduledAt: z.string().min(1, 'Veuillez sélectionner une date et heure'),
  notes: z.string().optional(),
})

type AppointmentInput = z.infer<typeof appointmentSchema>

interface Doctor {
  id: string
  specialization: string
  user: {
    email: string
  }
}

export default function NewAppointmentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
  })

  useEffect(() => {
    if (!session) return

    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctors')
        const data = await res.json()
        setDoctors(data)
      } catch (error) {
        console.error('Error fetching doctors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [session])

  const onSubmit = async (data: AppointmentInput) => {
    setSaving(true)
    setError('')

    try {
      // Get patient ID
      const patientRes = await fetch('/api/patients/me')
      if (!patientRes.ok) {
        throw new Error('Patient non trouvé')
      }
      const patient = await patientRes.json()

      const res = await fetch('/api/appoitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: data.doctorId,
          scheduledAt: data.scheduledAt,
          notes: data.notes,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        const errorMessage = errorData.message || 'Erreur lors de la réservation'
        console.error('Error creating appointment:', errorData)
        throw new Error(errorMessage)
      }

      const appointmentData = await res.json()
      console.log('Appointment created successfully:', appointmentData)
      router.push('/patient/appointments')
    } catch (err: any) {
      console.error('Error in onSubmit:', err)
      setError(err.message || 'Une erreur est survenue lors de la création du rendez-vous')
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return <div>Redirecting...</div>
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
                Réserver un Rendez-vous
              </h1>
              <p className='text-gray-600'>Réservez un rendez-vous avec un médecin</p>
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
                  Médecin <span className='text-red-500'>*</span>
                </label>
                {loading ? (
                  <div className='h-12 bg-gray-200 rounded-lg animate-pulse' />
                ) : (
                  <select
                    {...register('doctorId')}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  >
                    <option value=''>Sélectionnez un médecin</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.user.email.split('@')[0]} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                )}
                {errors.doctorId && (
                  <p className='mt-1 text-sm text-red-600'>{errors.doctorId.message}</p>
                )}
              </div>

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
                    Réservation...
                  </>
                ) : (
                  <>
                    <Save className='w-5 h-5' />
                    Réserver
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

