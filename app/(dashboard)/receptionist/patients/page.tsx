'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UserPlus,
  Eye,
  Edit,
  Search,
  Users,
  Phone,
  Mail,
  Calendar,
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
  appointments?: any[]
  invoices?: any[]
}

export default function ReceptionistPatientsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!session) return

    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/patients')
        const data = await res.json()
        setPatients(data)
      } catch (error) {
        console.error('Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [session])

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      (patient.firstName?.toLowerCase() || '').includes(search) ||
      (patient.lastName?.toLowerCase() || '').includes(search) ||
      (patient.user?.email?.toLowerCase() || '').includes(search) ||
      (patient.phone || '').includes(search)
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
          <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                Enregistrement Patients
              </h1>
              <p className='text-gray-600'>
                Enregistrez et gérez les dossiers patients
              </p>
            </div>
            <Link
              href='/receptionist/patients/new'
              className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg font-medium'
            >
              <UserPlus className='w-5 h-5' />
              Nouveau patient
            </Link>
          </div>

          {/* Search */}
          <div className='bg-white rounded-xl shadow-sm p-6 mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Rechercher par nom, email, téléphone...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
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
              <Users className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Aucun patient trouvé
              </h3>
              <p className='text-gray-600 mb-6'>
                {searchTerm
                  ? 'Aucun patient ne correspond à votre recherche'
                  : 'Commencez par enregistrer un nouveau patient'}
              </p>
              {!searchTerm && (
                <Link
                  href='/receptionist/patients/new'
                  className='inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                >
                  <UserPlus className='w-5 h-5' />
                  Enregistrer un patient
                </Link>
              )}
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <div className='space-y-1.5 text-sm text-gray-600'>
                        {patient.user?.email && (
                          <div className='flex items-center gap-2'>
                            <Mail className='w-4 h-4' />
                            <span className='truncate'>{patient.user.email}</span>
                          </div>
                        )}
                        {patient.phone && (
                          <div className='flex items-center gap-2'>
                            <Phone className='w-4 h-4' />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                        {patient.dateOfBirth && (
                          <div className='flex items-center gap-2'>
                            <Calendar className='w-4 h-4' />
                            <span>
                              {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 pt-4 border-t border-gray-100'>
                    <Link
                      href={`/receptionist/patients/${patient.id}`}
                      className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
                    >
                      <Eye className='w-4 h-4' />
                      Voir
                    </Link>
                    <Link
                      href={`/receptionist/patients/${patient.id}/edit`}
                      className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium'
                    >
                      <Edit className='w-4 h-4' />
                      Modifier
                    </Link>
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

