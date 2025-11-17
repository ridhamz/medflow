'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ClipboardList,
  Search,
  Eye,
  FileText,
  User,
  Calendar,
  AlertCircle,
  Plus
} from 'lucide-react'

interface Consultation {
  id: string
  diagnosis: string
  treatment: string
  createdAt: string
  appointment: {
    id: string
    scheduledAt: string
    patient: {
      id: string
      firstName: string
      lastName: string
    }
  }
  prescriptions?: Array<{
    id: string
  }>
}

export default function DoctorConsultationsPage() {
  const { data: session } = useSession()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!session) return

    const fetchConsultations = async () => {
      try {
        const res = await fetch('/api/consultations')
        const data = await res.json()
        // API already filters by doctor, so we can use data directly
        setConsultations(data)
      } catch (error) {
        console.error('Error fetching consultations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConsultations()
  }, [session])

  const filteredConsultations = consultations.filter(cons => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      cons.appointment.patient.firstName.toLowerCase().includes(search) ||
      cons.appointment.patient.lastName.toLowerCase().includes(search) ||
      cons.diagnosis.toLowerCase().includes(search) ||
      cons.treatment.toLowerCase().includes(search)
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
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                <ClipboardList className='w-10 h-10 text-purple-600' />
                Consultations
              </h1>
              <p className='text-gray-600'>
                Gérez vos consultations et dossiers médicaux
              </p>
            </div>
            <Link
              href='/doctor/appointments'
              className='inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm hover:shadow-md'
            >
              <Plus className='w-5 h-5' />
              Nouvelle consultation
            </Link>
          </div>

          {/* Search Bar */}
          <div className='mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Rechercher une consultation...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Consultations List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
              <p className='mt-4 text-gray-600'>Chargement des consultations...</p>
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 text-lg mb-4'>
                {searchTerm ? 'Aucune consultation trouvée' : 'Aucune consultation enregistrée'}
              </p>
              {!searchTerm && (
                <Link
                  href='/doctor/appointments'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
                >
                  <Plus className='w-5 h-5' />
                  Créer une consultation
                </Link>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredConsultations
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((consultation) => (
                  <div
                    key={consultation.id}
                    className='bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-6'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-3'>
                          <User className='w-5 h-5 text-gray-400' />
                          <span className='text-lg font-semibold text-gray-900'>
                            {consultation.appointment.patient.firstName}{' '}
                            {consultation.appointment.patient.lastName}
                          </span>
                          <div className='flex items-center gap-2 text-sm text-gray-500'>
                            <Calendar className='w-4 h-4' />
                            <span>
                              {new Date(consultation.appointment.scheduledAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className='space-y-2 mb-4'>
                          <div>
                            <span className='text-sm font-medium text-gray-700'>Diagnostic:</span>
                            <p className='text-gray-900 mt-1'>{consultation.diagnosis}</p>
                          </div>
                          <div>
                            <span className='text-sm font-medium text-gray-700'>Traitement:</span>
                            <p className='text-gray-900 mt-1'>{consultation.treatment}</p>
                          </div>
                        </div>
                        <div className='flex items-center gap-4 text-sm text-gray-500'>
                          <span>
                            Créée le{' '}
                            {new Date(consultation.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          {consultation.prescriptions && consultation.prescriptions.length > 0 && (
                            <span className='flex items-center gap-1'>
                              <FileText className='w-4 h-4' />
                              {consultation.prescriptions.length} ordonnance(s)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='flex flex-col gap-2 ml-4'>
                        <Link
                          href={`/doctor/consultations/${consultation.id}`}
                          className='inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium'
                        >
                          <Eye className='w-4 h-4' />
                          Voir détails
                        </Link>
                        {(!consultation.prescriptions || consultation.prescriptions.length === 0) && (
                          <Link
                            href={`/doctor/prescriptions/new?consultationId=${consultation.id}`}
                            className='inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium'
                          >
                            <FileText className='w-4 h-4' />
                            Créer ordonnance
                          </Link>
                        )}
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

