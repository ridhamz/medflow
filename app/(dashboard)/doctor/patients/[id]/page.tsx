'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  ClipboardList,
  Loader2,
  Clock
} from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  phone: string
  dateOfBirth: string
  address?: string
  user?: {
    email: string
  }
  appointments?: Array<{
    id: string
    scheduledAt: string
    status: string
    notes?: string
    consultation?: {
      id: string
      diagnosis: string
      treatment: string
      createdAt: string
    }
  }>
}

export default function PatientMedicalRecordPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || !params.id) return

    const fetchPatient = async () => {
      try {
        // Get patient data
        const patientRes = await fetch(`/api/patients/${params.id}`)
        if (!patientRes.ok) {
          console.error('Failed to fetch patient:', patientRes.status)
          router.push('/doctor/patients')
          return
        }
        const patientData = await patientRes.json()
        
        // Get doctor's ID to filter appointments
        const doctorRes = await fetch('/api/doctors/me')
        if (!doctorRes.ok) {
          console.error('Failed to fetch doctor:', doctorRes.status)
          router.push('/doctor/patients')
          return
        }
        const doctor = await doctorRes.json()
        
        // Filter appointments to only show this doctor's appointments
        const doctorAppointments = (patientData.appointments || []).filter(
          (apt: any) => apt.doctorId === doctor.id
        )
        
        setPatient({
          ...patientData,
          appointments: doctorAppointments,
        })
      } catch (error) {
        console.error('Error fetching patient:', error)
        router.push('/doctor/patients')
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [session, params.id, router])

  if (!session) {
    return <div>Redirecting...</div>
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 text-green-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Patient non trouvé</p>
          <Link
            href='/doctor/patients'
            className='text-green-600 hover:text-green-700'
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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <Link
              href='/doctor/patients'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour à la liste
            </Link>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                <User className='w-10 h-10 text-green-600' />
                Dossier Médical - {patient.firstName} {patient.lastName}
              </h1>
              <p className='text-gray-600'>Historique médical et consultations</p>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Patient Info */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <User className='w-6 h-6 text-green-600' />
                  Informations Patient
                </h2>
                <div className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                      <Mail className='w-4 h-4' />
                      Email
                    </label>
                    <p className='text-gray-900'>{patient.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                      <Phone className='w-4 h-4' />
                      Téléphone
                    </label>
                    <p className='text-gray-900'>{patient.phone}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                      <Calendar className='w-4 h-4' />
                      Date de naissance
                    </label>
                    <p className='text-gray-900'>
                      {patient.dateOfBirth
                        ? new Date(patient.dateOfBirth).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Appointments & Consultations */}
              <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <ClipboardList className='w-6 h-6 text-purple-600' />
                  Historique des Consultations
                </h2>
                {patient.appointments && patient.appointments.length > 0 ? (
                  <div className='space-y-4'>
                    {patient.appointments
                      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className='p-4 bg-gray-50 rounded-lg border border-gray-200'
                        >
                          <div className='flex items-start justify-between mb-3'>
                            <div>
                              <div className='flex items-center gap-2 mb-2'>
                                <Clock className='w-4 h-4 text-gray-400' />
                                <span className='font-medium text-gray-900'>
                                  {new Date(appointment.scheduledAt).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    appointment.status === 'COMPLETED'
                                      ? 'bg-green-100 text-green-800'
                                      : appointment.status === 'CANCELLED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {appointment.status}
                                </span>
                              </div>
                              {appointment.notes && (
                                <p className='text-sm text-gray-600 mb-2'>{appointment.notes}</p>
                              )}
                            </div>
                          </div>
                          {appointment.consultation ? (
                            <div className='mt-3 pt-3 border-t border-gray-200'>
                              <div className='mb-2'>
                                <span className='text-sm font-medium text-gray-700'>Diagnostic:</span>
                                <p className='text-sm text-gray-900 mt-1'>{appointment.consultation.diagnosis}</p>
                              </div>
                              <div>
                                <span className='text-sm font-medium text-gray-700'>Traitement:</span>
                                <p className='text-sm text-gray-900 mt-1'>{appointment.consultation.treatment}</p>
                              </div>
                              <Link
                                href={`/doctor/consultations/${appointment.consultation.id}`}
                                className='inline-flex items-center gap-2 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium'
                              >
                                <FileText className='w-4 h-4' />
                                Voir la consultation complète
                              </Link>
                            </div>
                          ) : appointment.status === 'CONFIRMED' || appointment.status === 'SCHEDULED' ? (
                            <Link
                              href={`/doctor/appointments/${appointment.id}/consultation`}
                              className='inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium'
                            >
                              <FileText className='w-4 h-4' />
                              Créer une consultation
                            </Link>
                          ) : null}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className='text-gray-500 text-center py-8'>
                    Aucune consultation enregistrée
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

