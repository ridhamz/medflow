'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText
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
  consultation?: {
    id: string
  }
}

export default function DoctorAppointmentsPage() {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!session) return

    const fetchAppointments = async () => {
      try {
        const url = statusFilter !== 'all' 
          ? `/api/appoitments?doctorId=current&status=${statusFilter}`
          : '/api/appoitments?doctorId=current'
        const res = await fetch(url)
        const data = await res.json()
        setAppointments(data)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [session, statusFilter])

  const filteredAppointments = appointments.filter(apt => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      apt.patient.firstName.toLowerCase().includes(search) ||
      apt.patient.lastName.toLowerCase().includes(search) ||
      apt.patient.phone.includes(search)
    )
  })

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
        icon: XCircle,
      },
    }
    const style = styles[status] || styles.SCHEDULED
    const Icon = style.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className='w-3 h-3' />
        {status}
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
    filteredAppointments.sort((a, b) => 
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
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
              <Calendar className='w-10 h-10 text-blue-600' />
              Mon Agenda
            </h1>
            <p className='text-gray-600'>
              Gérez vos rendez-vous et consultations
            </p>
          </div>

          {/* Filters */}
          <div className='mb-6 flex flex-col sm:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Rechercher un patient...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div className='relative'>
              <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white'
              >
                <option value='all'>Tous les statuts</option>
                <option value='SCHEDULED'>Planifiés</option>
                <option value='CONFIRMED'>Confirmés</option>
                <option value='COMPLETED'>Terminés</option>
                <option value='CANCELLED'>Annulés</option>
              </select>
            </div>
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
              <p className='text-gray-600 text-lg'>
                Aucun rendez-vous trouvé
              </p>
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
                              <User className='w-4 h-4 text-gray-400' />
                              <span className='text-gray-900 font-medium'>
                                {appointment.patient.firstName} {appointment.patient.lastName}
                              </span>
                            </div>
                            {appointment.notes && (
                              <p className='text-sm text-gray-600 mt-2'>{appointment.notes}</p>
                            )}
                          </div>
                          <div className='flex items-center gap-2'>
                            {appointment.status === 'CONFIRMED' || appointment.status === 'SCHEDULED' ? (
                              <Link
                                href={`/doctor/appointments/${appointment.id}/consultation`}
                                className='inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium'
                              >
                                <FileText className='w-4 h-4' />
                                Consulter
                              </Link>
                            ) : appointment.consultation ? (
                              <Link
                                href={`/doctor/consultations/${appointment.consultation.id}`}
                                className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
                              >
                                <Eye className='w-4 h-4' />
                                Voir consultation
                              </Link>
                            ) : null}
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

