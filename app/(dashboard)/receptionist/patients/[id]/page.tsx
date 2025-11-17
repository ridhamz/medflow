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
  Loader2,
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
          router.push('/receptionist/patients')
        }
      } catch (error) {
        console.error('Error fetching patient:', error)
        router.push('/receptionist/patients')
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
            href='/receptionist/patients'
            className='text-green-600 hover:text-green-700'
          >
            Retour aux patients
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
              href='/receptionist/patients'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4'
            >
              <ArrowLeft className='w-4 h-4' />
              Retour aux patients
            </Link>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                  Dossier Patient
                </h1>
                <p className='text-gray-600'>
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <Link
                href={`/receptionist/patients/${patient.id}/edit`}
                className='inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                <Edit className='w-4 h-4' />
                Modifier
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Patient Info */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-xl shadow-sm p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <User className='w-5 h-5' />
                  Informations Personnelles
                </h2>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Nom complet</p>
                    <p className='text-lg font-medium text-gray-900'>
                      {patient.firstName} {patient.lastName}
                    </p>
                  </div>
                  {patient.user?.email && (
                    <div className='flex items-center gap-2'>
                      <Mail className='w-4 h-4 text-gray-400' />
                      <p className='text-gray-900'>{patient.user.email}</p>
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <Phone className='w-4 h-4 text-gray-400' />
                    <p className='text-gray-900'>{patient.phone}</p>
                  </div>
                  {patient.dateOfBirth && (
                    <div className='flex items-center gap-2'>
                      <Calendar className='w-4 h-4 text-gray-400' />
                      <p className='text-gray-900'>
                        {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {patient.address && (
                    <div className='flex items-start gap-2'>
                      <MapPin className='w-4 h-4 text-gray-400 mt-1' />
                      <p className='text-gray-900'>{patient.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Appointments & Invoices */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Appointments */}
              <div className='bg-white rounded-xl shadow-sm p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <CalendarIcon className='w-5 h-5' />
                  Rendez-vous ({patient.appointments?.length || 0})
                </h2>
                {patient.appointments && patient.appointments.length > 0 ? (
                  <div className='space-y-3'>
                    {patient.appointments.slice(0, 5).map((appointment) => (
                      <div
                        key={appointment.id}
                        className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <Stethoscope className='w-4 h-4 text-gray-400' />
                            <span className='font-medium text-gray-900'>
                              {appointment.doctor?.user?.email?.split('@')[0] || 'Médecin'}
                            </span>
                            <span className='text-sm text-gray-500'>
                              - {appointment.doctor?.specialization || 'N/A'}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                        <p className='text-sm text-gray-600'>
                          {new Date(appointment.scheduledAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <Link
                          href={`/receptionist/appointments/${appointment.id}`}
                          className='text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block'
                        >
                          Voir les détails →
                        </Link>
                      </div>
                    ))}
                    {patient.appointments.length > 5 && (
                      <p className='text-sm text-gray-500 text-center pt-2'>
                        Et {patient.appointments.length - 5} autres rendez-vous
                      </p>
                    )}
                  </div>
                ) : (
                  <p className='text-gray-500 text-center py-8'>
                    Aucun rendez-vous enregistré
                  </p>
                )}
              </div>

              {/* Invoices */}
              <div className='bg-white rounded-xl shadow-sm p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <DollarSign className='w-5 h-5' />
                  Factures ({patient.invoices?.length || 0})
                </h2>
                {patient.invoices && patient.invoices.length > 0 ? (
                  <div className='space-y-3'>
                    {patient.invoices.slice(0, 5).map((invoice) => (
                      <div
                        key={invoice.id}
                        className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <FileText className='w-4 h-4 text-gray-400' />
                            <span className='font-medium text-gray-900'>
                              {Number(invoice.amount).toFixed(2)} TND
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600'>
                          {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <Link
                          href={`/receptionist/invoices/${invoice.id}`}
                          className='text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block'
                        >
                          Voir les détails →
                        </Link>
                      </div>
                    ))}
                    {patient.invoices.length > 5 && (
                      <p className='text-sm text-gray-500 text-center pt-2'>
                        Et {patient.invoices.length - 5} autres factures
                      </p>
                    )}
                  </div>
                ) : (
                  <p className='text-gray-500 text-center py-8'>
                    Aucune facture enregistrée
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

