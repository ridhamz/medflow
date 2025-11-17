'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react'

interface Appointment {
  id: string
  scheduledAt: string
  status: string
  notes?: string
  patient: {
    id: string
    firstName: string
    lastName: string
  }
  doctor: {
    id: string
    specialization: string
    user: {
      email: string
    }
  }
}

export default function EditAppointmentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    scheduledAt: '',
    status: '',
    notes: '',
  })

  useEffect(() => {
    if (!session || !params.id) return

    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appoitments/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setAppointment(data)
          setFormData({
            scheduledAt: new Date(data.scheduledAt).toISOString().slice(0, 16),
            status: data.status,
            notes: data.notes || '',
          })
        } else {
          router.push('/receptionist/appointments')
        }
      } catch (error) {
        console.error('Error fetching appointment:', error)
        router.push('/receptionist/appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [session, params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/appoitments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour')
      }

      router.push(`/receptionist/appointments/${params.id}`)
    } catch (error: any) {
      console.error('Error updating appointment:', error)
      setError(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
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
            href='/receptionist/appointments'
            className='text-blue-600 hover:text-blue-700'
          >
            Retour aux rendez-vous
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <Link
              href={`/receptionist/appointments/${params.id}`}
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4'
            >
              <ArrowLeft className='w-4 h-4' />
              Retour au rendez-vous
            </Link>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              Modifier le rendez-vous
            </h1>
            <p className='text-gray-600'>
              Patient: {appointment.patient.firstName} {appointment.patient.lastName}
            </p>
          </div>

          {/* Form */}
          <div className='bg-white rounded-xl shadow-sm p-6'>
            {error && (
              <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Date & Time */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Date et heure <span className='text-red-500'>*</span>
                </label>
                <input
                  type='datetime-local'
                  required
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledAt: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* Status */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Statut <span className='text-red-500'>*</span>
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='SCHEDULED'>Planifié</option>
                  <option value='CONFIRMED'>Confirmé</option>
                  <option value='COMPLETED'>Terminé</option>
                  <option value='CANCELLED'>Annulé</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Notes supplémentaires sur le rendez-vous...'
                />
              </div>

              {/* Actions */}
              <div className='flex items-center gap-4 pt-4'>
                <button
                  type='submit'
                  disabled={submitting}
                  className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Save className='w-5 h-5' />
                  {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
                <Link
                  href={`/receptionist/appointments/${params.id}`}
                  className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium'
                >
                  Annuler
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

