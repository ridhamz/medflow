'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Users,
  Search,
  FileText,
  Calendar,
  Phone,
  Mail,
  Eye,
  AlertCircle
} from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  phone: string
  dateOfBirth: string
  user?: {
    email: string
  }
  appointments?: Array<{
    id: string
    scheduledAt: string
    status: string
    consultation?: {
      id: string
    }
  }>
}

export default function DoctorPatientsPage() {
  const { data: session } = useSession()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!session) return

    const fetchPatients = async () => {
      try {
        // Get doctor's appointments to find unique patients
        const appointmentsRes = await fetch('/api/appoitments?doctorId=current')
        const appointments = appointmentsRes.ok ? await appointmentsRes.json() : []
        
        // Get unique patient IDs
        const patientIds = [...new Set(appointments.map((apt: any) => apt.patientId))]
        
        // Fetch patient details
        const patientPromises = patientIds.map((id: string) =>
          fetch(`/api/patients/${id}`)
            .then(res => {
              if (!res.ok) {
                console.error(`Failed to fetch patient ${id}:`, res.status)
                return null
              }
              return res.json()
            })
            .catch(error => {
              console.error(`Error fetching patient ${id}:`, error)
              return null
            })
        )
        const patientsData = await Promise.all(patientPromises)
        
        // Filter out null values and add appointments to each patient
        const patientsWithAppointments = patientsData
          .filter((patient): patient is Patient => patient !== null && patient.id !== undefined)
          .map((patient: Patient) => ({
            ...patient,
            appointments: appointments.filter((apt: any) => apt.patientId === patient.id),
          }))
        
        setPatients(patientsWithAppointments)
      } catch (error) {
        console.error('Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [session])

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      (patient.firstName?.toLowerCase() || '').includes(search) ||
      (patient.lastName?.toLowerCase() || '').includes(search) ||
      (patient.phone || '').includes(search) ||
      (patient.user?.email?.toLowerCase() || '').includes(search)
    )
  })

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
              <Users className='w-10 h-10 text-green-600' />
              Dossiers Médicaux
            </h1>
            <p className='text-gray-600'>
              Accédez aux dossiers de vos patients
            </p>
          </div>

          {/* Search Bar */}
          <div className='mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Rechercher un patient...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Patients List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
              <p className='mt-4 text-gray-600'>Chargement des patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 text-lg'>
                {searchTerm ? 'Aucun patient trouvé pour cette recherche' : 'Aucun patient enregistré'}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredPatients.map((patient, index) => (
                <div
                  key={patient.id || `patient-${index}`}
                  className='bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100'
                >
                  <div className='p-6'>
                    {/* Patient Header */}
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-1'>
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                          <Mail className='w-4 h-4' />
                          <span>{patient.user?.email || 'N/A'}</span>
                        </div>
                      </div>
                      <div className='p-2 bg-green-50 rounded-lg'>
                        <Users className='w-5 h-5 text-green-600' />
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className='space-y-2 mb-4'>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Phone className='w-4 h-4 text-gray-400' />
                        <span>{patient.phone}</span>
                      </div>
                      {patient.dateOfBirth && (
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <Calendar className='w-4 h-4 text-gray-400' />
                          <span>
                            {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <FileText className='w-4 h-4 text-gray-400' />
                        <span>{patient.appointments?.length || 0} rendez-vous</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 pt-4 border-t border-gray-100'>
                      <Link
                        href={`/doctor/patients/${patient.id}`}
                        className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm font-medium'
                      >
                        <Eye className='w-4 h-4' />
                        Voir le dossier
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

