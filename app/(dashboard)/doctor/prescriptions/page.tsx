'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  FileText,
  Search,
  Eye,
  User,
  Calendar,
  AlertCircle,
  Plus,
  Download
} from 'lucide-react'

interface Prescription {
  id: string
  medications: string
  instructions?: string
  createdAt: string
  consultation: {
    id: string
    appointment: {
      scheduledAt: string
      patient: {
        firstName: string
        lastName: string
      }
    }
  }
}

export default function DoctorPrescriptionsPage() {
  const { data: session } = useSession()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!session) return

    const fetchPrescriptions = async () => {
      try {
        const res = await fetch('/api/prescriptions')
        const data = await res.json()
        setPrescriptions(data)
      } catch (error) {
        console.error('Error fetching prescriptions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [session])

  const filteredPrescriptions = prescriptions.filter(pres => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      pres.consultation.appointment.patient.firstName.toLowerCase().includes(search) ||
      pres.consultation.appointment.patient.lastName.toLowerCase().includes(search) ||
      pres.medications.toLowerCase().includes(search)
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
              <FileText className='w-10 h-10 text-indigo-600' />
              Ordonnances
            </h1>
            <p className='text-gray-600'>
              Gérez et exportez les ordonnances médicales
            </p>
          </div>

          {/* Search Bar */}
          <div className='mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Rechercher une ordonnance...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Prescriptions List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
              <p className='mt-4 text-gray-600'>Chargement des ordonnances...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 text-lg mb-4'>
                {searchTerm ? 'Aucune ordonnance trouvée' : 'Aucune ordonnance enregistrée'}
              </p>
              {!searchTerm && (
                <Link
                  href='/doctor/consultations'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'
                >
                  <Plus className='w-5 h-5' />
                  Créer une ordonnance
                </Link>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredPrescriptions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((prescription) => (
                  <div
                    key={prescription.id}
                    className='bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-6'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-3'>
                          <User className='w-5 h-5 text-gray-400' />
                          <span className='text-lg font-semibold text-gray-900'>
                            {prescription.consultation.appointment.patient.firstName}{' '}
                            {prescription.consultation.appointment.patient.lastName}
                          </span>
                          <div className='flex items-center gap-2 text-sm text-gray-500'>
                            <Calendar className='w-4 h-4' />
                            <span>
                              {new Date(prescription.consultation.appointment.scheduledAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className='mb-3'>
                          <span className='text-sm font-medium text-gray-700'>Médicaments:</span>
                          <p className='text-gray-900 mt-1 line-clamp-2'>{prescription.medications}</p>
                        </div>
                        {prescription.instructions && (
                          <div className='mb-3'>
                            <span className='text-sm font-medium text-gray-700'>Instructions:</span>
                            <p className='text-gray-900 mt-1 line-clamp-2'>{prescription.instructions}</p>
                          </div>
                        )}
                        <p className='text-sm text-gray-500'>
                          Créée le{' '}
                          {new Date(prescription.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className='flex flex-col gap-2 ml-4'>
                        <Link
                          href={`/doctor/prescriptions/${prescription.id}`}
                          className='inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium'
                        >
                          <Eye className='w-4 h-4' />
                          Voir détails
                        </Link>
                        {prescription.pdfUrl && (
                          <a
                            href={prescription.pdfUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium'
                          >
                            <Download className='w-4 h-4' />
                            Télécharger PDF
                          </a>
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

