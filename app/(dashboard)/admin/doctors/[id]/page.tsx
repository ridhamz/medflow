'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Stethoscope,
  Mail,
  Award,
  Calendar,
  User,
  Loader2
} from 'lucide-react'

interface Doctor {
  id: string
  specialization: string
  licenseNumber?: string
  user?: {
    email: string
  }
  appointments?: Array<{
    id: string
    scheduledAt: string
    status: string
    patient?: {
      firstName: string
      lastName: string
    }
  }>
}

export default function DoctorViewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || !params.id) return

    const fetchDoctor = async () => {
      try {
        const res = await fetch(`/api/doctors/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setDoctor(data)
        } else {
          router.push('/admin/doctors')
        }
      } catch (error) {
        console.error('Error fetching doctor:', error)
        router.push('/admin/doctors')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
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

  if (!doctor) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Médecin non trouvé</p>
          <Link
            href='/admin/doctors'
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
              href='/admin/doctors'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour à la liste
            </Link>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                  <Stethoscope className='w-10 h-10 text-green-600' />
                  {doctor.specialization}
                </h1>
                <p className='text-gray-600'>Détails du médecin</p>
              </div>
              <Link
                href={`/admin/doctors/${doctor.id}/edit`}
                className='inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium'
              >
                <Edit className='w-5 h-5' />
                Modifier
              </Link>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Doctor Info Card */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Personal Information */}
              <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <User className='w-6 h-6 text-green-600' />
                  Informations professionnelles
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                      <Stethoscope className='w-4 h-4' />
                      Spécialisation
                    </label>
                    <p className='text-gray-900 font-medium'>{doctor.specialization}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                      <Mail className='w-4 h-4' />
                      Email
                    </label>
                    <p className='text-gray-900'>{doctor.user?.email || 'N/A'}</p>
                  </div>
                  {doctor.licenseNumber && (
                    <div>
                      <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                        <Award className='w-4 h-4' />
                        Numéro de licence
                      </label>
                      <p className='text-gray-900'>{doctor.licenseNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointments */}
              <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <Calendar className='w-6 h-6 text-purple-600' />
                  Rendez-vous ({doctor.appointments?.length || 0})
                </h2>
                {doctor.appointments && doctor.appointments.length > 0 ? (
                  <div className='space-y-4'>
                    {doctor.appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className='p-4 bg-gray-50 rounded-lg border border-gray-200'
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {new Date(appointment.scheduledAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {appointment.patient && (
                              <p className='text-sm text-gray-600 mt-1'>
                                Patient: {appointment.patient.firstName} {appointment.patient.lastName}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-500 text-center py-8'>
                    Aucun rendez-vous enregistré
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Quick Stats */}
              <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Statistiques
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                    <span className='text-sm text-gray-600 flex items-center gap-2'>
                      <Calendar className='w-4 h-4' />
                      Rendez-vous
                    </span>
                    <span className='font-semibold text-gray-900'>
                      {doctor.appointments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

