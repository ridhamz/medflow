'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  User,
  Calendar,
  Stethoscope,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react'

interface Appointment {
  id: string
  scheduledAt: string
  status: string
  notes?: string
  patient: {
    id: string
    firstName: string
    lastName: string
    phone: string
    dateOfBirth?: string
    address?: string
  }
  doctor: {
    id: string
    specialization: string
    user: {
      email: string
    }
  }
  consultation?: {
    id: string
    diagnosis?: string
    treatment?: string
  }
}

export default function AppointmentViewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || !params.id) return

    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appoitments/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setAppointment(data)
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: {
        label: 'Planifié',
        className: 'bg-blue-100 text-blue-800',
        icon: Clock,
      },
      CONFIRMED: {
        label: 'Confirmé',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      COMPLETED: {
        label: 'Terminé',
        className: 'bg-purple-100 text-purple-800',
        icon: CheckCircle,
      },
      CANCELLED: {
        label: 'Annulé',
        className: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
      icon: AlertCircle,
    }

    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.className}`}
      >
        <Icon className='w-4 h-4' />
        {config.label}
      </span>
    )
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
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <Link
              href='/receptionist/appointments'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4'
            >
              <ArrowLeft className='w-4 h-4' />
              Retour aux rendez-vous
            </Link>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                  Détails du rendez-vous
                </h1>
                <p className='text-gray-600'>
                  {new Date(appointment.scheduledAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className='flex items-center gap-3'>
                {getStatusBadge(appointment.status)}
                <Link
                  href={`/receptionist/appointments/${appointment.id}/edit`}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <Edit className='w-4 h-4' />
                  Modifier
                </Link>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='space-y-6'>
            {/* Patient Info */}
            <div className='bg-white rounded-xl shadow-sm p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <User className='w-5 h-5' />
                Informations Patient
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Nom complet</p>
                  <p className='text-lg font-medium text-gray-900'>
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Téléphone</p>
                  <p className='text-lg font-medium text-gray-900'>
                    {appointment.patient.phone}
                  </p>
                </div>
                {appointment.patient.dateOfBirth && (
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Date de naissance</p>
                    <p className='text-lg font-medium text-gray-900'>
                      {new Date(appointment.patient.dateOfBirth).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {appointment.patient.address && (
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Adresse</p>
                    <p className='text-lg font-medium text-gray-900'>
                      {appointment.patient.address}
                    </p>
                  </div>
                )}
              </div>
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <Link
                  href={`/receptionist/patients/${appointment.patient.id}`}
                  className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                >
                  Voir le dossier patient →
                </Link>
              </div>
            </div>

            {/* Doctor Info */}
            <div className='bg-white rounded-xl shadow-sm p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <Stethoscope className='w-5 h-5' />
                Informations Médecin
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Médecin</p>
                  <p className='text-lg font-medium text-gray-900'>
                    Dr. {appointment.doctor.user.email.split('@')[0]}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Spécialité</p>
                  <p className='text-lg font-medium text-gray-900'>
                    {appointment.doctor.specialization}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className='bg-white rounded-xl shadow-sm p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <Calendar className='w-5 h-5' />
                Détails du rendez-vous
              </h2>
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Date et heure</p>
                  <p className='text-lg font-medium text-gray-900'>
                    {new Date(appointment.scheduledAt).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {appointment.notes && (
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Notes</p>
                    <p className='text-gray-900'>{appointment.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Consultation */}
            {appointment.consultation && (
              <div className='bg-white rounded-xl shadow-sm p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <FileText className='w-5 h-5' />
                  Consultation
                </h2>
                <div className='space-y-3'>
                  {appointment.consultation.diagnosis && (
                    <div>
                      <p className='text-sm text-gray-600 mb-1'>Diagnostic</p>
                      <p className='text-gray-900'>{appointment.consultation.diagnosis}</p>
                    </div>
                  )}
                  {appointment.consultation.treatment && (
                    <div>
                      <p className='text-sm text-gray-600 mb-1'>Traitement</p>
                      <p className='text-gray-900'>{appointment.consultation.treatment}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

