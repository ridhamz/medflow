'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  User,
  Search,
  Plus,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  CreditCard
} from 'lucide-react'

interface Appointment {
  id: string
  scheduledAt: string
  status: string
  notes?: string
  doctor: {
    id: string
    specialization: string
    user: {
      email: string
    }
  }
}

export default function PatientAppointmentsPage() {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    if (!session) return

    const fetchAppointments = async () => {
      try {
        const res = await fetch('/api/appoitments')
        const data = await res.json()
        setAppointments(data)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [session])

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: { bg: string; text: string; icon: any } } = {
      SCHEDULED: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: Clock,
      },
      CONFIRMED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
      },
      COMPLETED: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: CheckCircle,
      },
      CANCELLED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: X,
      },
    }
    const style = styles[status] || styles.SCHEDULED
    const Icon = style.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className='w-3 h-3' />
        {status === 'SCHEDULED' ? 'Planifié' : status === 'CONFIRMED' ? 'Confirmé' : status === 'COMPLETED' ? 'Terminé' : 'Annulé'}
      </span>
    )
  }

  const groupByDate = (appointments: Appointment[]) => {
    const grouped: { [key: string]: Appointment[] } = {}
    appointments.forEach(apt => {
      const date = new Date(apt.scheduledAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(apt)
    })
    return grouped
  }

  const groupedAppointments = groupByDate(
    appointments.sort((a, b) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
  )

  if (!session) {
    return <div>Redirecting...</div>
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                <Calendar className='w-10 h-10 text-blue-600' />
                Mes Rendez-vous
              </h1>
              <p className='text-gray-600'>
                Gérez vos rendez-vous médicaux
              </p>
            </div>
            <Link
              href='/patient/appointments/new'
              className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md'
            >
              <Plus className='w-5 h-5' />
              Nouveau rendez-vous
            </Link>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
              <p className='mt-4 text-gray-600'>Chargement des rendez-vous...</p>
            </div>
          ) : Object.keys(groupedAppointments).length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 text-lg mb-4'>
                Aucun rendez-vous enregistré
              </p>
              <Link
                href='/patient/appointments/new'
                className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Plus className='w-5 h-5' />
                Réserver un rendez-vous
              </Link>
            </div>
          ) : (
            <div className='space-y-6'>
              {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
                <div key={date} className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  <div className='bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900'>{date}</h3>
                  </div>
                  <div className='divide-y divide-gray-100'>
                    {dateAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className='p-6 hover:bg-gray-50 transition-colors'
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-3 mb-2'>
                              <Clock className='w-5 h-5 text-gray-400' />
                              <span className='text-lg font-semibold text-gray-900'>
                                {new Date(appointment.scheduledAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className='flex items-center gap-2 mb-2'>
                              <Stethoscope className='w-4 h-4 text-gray-400' />
                              <span className='text-gray-900 font-medium'>
                                Dr. {appointment.doctor.user.email.split('@')[0]}
                              </span>
                              <span className='text-gray-500 text-sm'>
                                - {appointment.doctor.specialization}
                              </span>
                            </div>
                            {appointment.notes && (
                              <p className='text-sm text-gray-600 mt-2'>{appointment.notes}</p>
                            )}
                          </div>
                          <div className='flex items-center gap-2 ml-4'>
                            {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
                              <Link
                                href={`/patient/appointments/${appointment.id}/edit`}
                                className='inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium'
                              >
                                <Edit className='w-4 h-4' />
                                Modifier
                              </Link>
                            )}
                            {appointment.status === 'COMPLETED' && (
                              <Link
                                href='/patient/invoices'
                                className='inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md'
                              >
                                <CreditCard className='w-4 h-4' />
                                Payer la facture
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

