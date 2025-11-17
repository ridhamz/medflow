'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  phone: string
}

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
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    scheduledAt: '',
    notes: '',
  })

  useEffect(() => {
    if (!session) return

    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/doctors'),
        ])

        if (patientsRes.ok) {
          const patientsData = await patientsRes.json()
          setPatients(patientsData)
        }

        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json()
          setDoctors(doctorsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/appoitments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la création du rendez-vous')
      }

      router.push('/receptionist/appointments')
    } catch (error: any) {
      console.error('Error creating appointment:', error)
      setError(error.message || 'Erreur lors de la création du rendez-vous')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) {
    return <div>Redirecting...</div>
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <Link
              href='/receptionist/appointments'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4'
            >
              <ArrowLeft className='w-4 h-4' />
              Retour aux rendez-vous
            </Link>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              Nouveau rendez-vous
            </h1>
            <p className='text-gray-600'>
              Créez un nouveau rendez-vous pour un patient
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
              {/* Patient */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Patient <span className='text-red-500'>*</span>
                </label>
                {loading ? (
                  <div className='h-10 bg-gray-100 rounded-lg animate-pulse'></div>
                ) : (
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData({ ...formData, patientId: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value=''>Sélectionner un patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} - {patient.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Doctor */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Médecin <span className='text-red-500'>*</span>
                </label>
                {loading ? (
                  <div className='h-10 bg-gray-100 rounded-lg animate-pulse'></div>
                ) : (
                  <select
                    required
                    value={formData.doctorId}
                    onChange={(e) =>
                      setFormData({ ...formData, doctorId: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value=''>Sélectionner un médecin</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.user.email.split('@')[0]} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                )}
              </div>

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
                  {submitting ? 'Création...' : 'Créer le rendez-vous'}
                </button>
                <Link
                  href='/receptionist/appointments'
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

