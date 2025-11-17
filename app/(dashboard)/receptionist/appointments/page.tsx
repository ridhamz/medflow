'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Stethoscope,
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
  }
}

export default function ReceptionistAppointmentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!session) return

    const fetchAppointments = async () => {
      try {
        const res = await fetch('/api/appoitments')
        if (!res.ok) throw new Error('Failed to fetch appointments')
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

  if (!session) {
    return <div>Redirecting...</div>
  }

  // Filter appointments
  let filteredAppointments = appointments

  // Apply date filter
  if (filter === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    filteredAppointments = filteredAppointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledAt)
      return aptDate >= today && aptDate < tomorrow
    })
  }

  // Apply status filter
  if (statusFilter !== 'all') {
    filteredAppointments = filteredAppointments.filter(
      (apt) => apt.status === statusFilter
    )
  }

  // Apply search filter
  if (searchTerm) {
    const search = searchTerm.toLowerCase()
    filteredAppointments = filteredAppointments.filter(
      (apt) =>
        apt.patient.firstName.toLowerCase().includes(search) ||
        apt.patient.lastName.toLowerCase().includes(search) ||
        apt.patient.phone.includes(search) ||
        apt.doctor.user.email.toLowerCase().includes(search) ||
        apt.doctor.specialization.toLowerCase().includes(search)
    )
  }

  // Sort by date
  filteredAppointments.sort((a, b) => {
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  })

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
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        <Icon className='w-3 h-3' />
        {config.label}
      </span>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                Gestion des Rendez-vous
              </h1>
              <p className='text-gray-600'>
                Créez et gérez les rendez-vous des patients
              </p>
            </div>
            <Link
              href='/receptionist/appointments/new'
              className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium'
            >
              <Plus className='w-5 h-5' />
              Nouveau rendez-vous
            </Link>
          </div>

          {/* Filters */}
          <div className='bg-white rounded-xl shadow-sm p-6 mb-6'>
            <div className='flex flex-col sm:flex-row gap-4'>
              {/* Search */}
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Rechercher par patient, médecin...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>Tous les statuts</option>
                <option value='SCHEDULED'>Planifié</option>
                <option value='CONFIRMED'>Confirmé</option>
                <option value='COMPLETED'>Terminé</option>
                <option value='CANCELLED'>Annulé</option>
              </select>
            </div>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
              <p className='mt-4 text-gray-600'>Chargement des rendez-vous...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <Calendar className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Aucun rendez-vous trouvé
              </h3>
              <p className='text-gray-600 mb-6'>
                {searchTerm || statusFilter !== 'all'
                  ? 'Aucun rendez-vous ne correspond à vos critères'
                  : 'Commencez par créer un nouveau rendez-vous'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  href='/receptionist/appointments/new'
                  className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <Plus className='w-5 h-5' />
                  Créer un rendez-vous
                </Link>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100'
                >
                  <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                    <div className='flex-1'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                            {appointment.patient.firstName}{' '}
                            {appointment.patient.lastName}
                          </h3>
                          <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                            <div className='flex items-center gap-1.5'>
                              <Calendar className='w-4 h-4' />
                              <span>
                                {new Date(appointment.scheduledAt).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className='flex items-center gap-1.5'>
                              <Stethoscope className='w-4 h-4' />
                              <span>
                                Dr. {appointment.doctor.user.email.split('@')[0]} - {appointment.doctor.specialization}
                              </span>
                            </div>
                            <div className='flex items-center gap-1.5'>
                              <User className='w-4 h-4' />
                              <span>{appointment.patient.phone}</span>
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      {appointment.notes && (
                        <p className='text-sm text-gray-600 mt-2'>
                          <span className='font-medium'>Notes:</span> {appointment.notes}
                        </p>
                      )}
                    </div>

                    <div className='flex items-center gap-2'>
                      <Link
                        href={`/receptionist/appointments/${appointment.id}`}
                        className='inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
                      >
                        <Eye className='w-4 h-4' />
                        Voir
                      </Link>
                      <Link
                        href={`/receptionist/appointments/${appointment.id}/edit`}
                        className='inline-flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium'
                      >
                        <Edit className='w-4 h-4' />
                        Modifier
                      </Link>
                    </div>
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

