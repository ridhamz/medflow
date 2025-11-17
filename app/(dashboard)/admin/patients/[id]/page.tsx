'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Calendar as CalendarIcon,
  Stethoscope,
  DollarSign,
  Loader2
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
    doctor?: {
      specialization: string
      user?: {
        email: string
      }
    }
  }>
  invoices?: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
  }>
}

export default function PatientViewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || !params.id) return

    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setPatient(data)
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
  }, [session, params.id, router])

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

  if (!patient) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Patient non trouvé</p>
          <Link
            href='/admin/patients'
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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <Link
              href='/admin/patients'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour à la liste
            </Link>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                  {patient.firstName} {patient.lastName}
                </h1>
                <p className='text-gray-600'>Détails du patient</p>
              </div>
              <Link
                href={`/admin/patients/${patient.id}/edit`}
                className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium'
              >
                <Edit className='w-5 h-5' />
                Modifier
              </Link>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Patient Info Card */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Personal Information */}
              <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <User className='w-6 h-6 text-blue-600' />
                  Informations personnelles
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='text-sm font-medium text-gray-500 mb-1 block'>
                      Prénom
                    </label>
                    <p className='text-gray-900 font-medium'>{patient.firstName}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-500 mb-1 block'>
                      Nom
                    </label>
                    <p className='text-gray-900 font-medium'>{patient.lastName}</p>
                  </div>
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
                  {patient.address && (
                    <div className='md:col-span-2'>
                      <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                        <MapPin className='w-4 h-4' />
                        Adresse
                      </label>
                      <p className='text-gray-900'>{patient.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointments */}
              <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <CalendarIcon className='w-6 h-6 text-purple-600' />
                  Rendez-vous ({patient.appointments?.length || 0})
                </h2>
                {patient.appointments && patient.appointments.length > 0 ? (
                  <div className='space-y-4'>
                    {patient.appointments.map((appointment) => (
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
                            {appointment.doctor && (
                              <p className='text-sm text-gray-600 mt-1 flex items-center gap-2'>
                                <Stethoscope className='w-4 h-4' />
                                {appointment.doctor.specialization}
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
                  <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                    <span className='text-sm text-gray-600 flex items-center gap-2'>
                      <CalendarIcon className='w-4 h-4' />
                      Rendez-vous
                    </span>
                    <span className='font-semibold text-gray-900'>
                      {patient.appointments?.length || 0}
                    </span>
                  </div>
                  <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                    <span className='text-sm text-gray-600 flex items-center gap-2'>
                      <DollarSign className='w-4 h-4' />
                      Factures
                    </span>
                    <span className='font-semibold text-gray-900'>
                      {patient.invoices?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoices */}
              {patient.invoices && patient.invoices.length > 0 && (
                <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <FileText className='w-5 h-5 text-orange-600' />
                    Factures récentes
                  </h3>
                  <div className='space-y-3'>
                    {patient.invoices.slice(0, 5).map((invoice) => (
                      <div
                        key={invoice.id}
                        className='p-3 bg-gray-50 rounded-lg border border-gray-200'
                      >
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-sm font-medium text-gray-900'>
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'TND',
                            }).format(Number(invoice.amount))}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              invoice.status === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                        <p className='text-xs text-gray-500'>
                          {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
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

