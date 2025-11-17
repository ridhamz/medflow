'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  FileText,
  Download,
  Calendar,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface Prescription {
  id: string
  medications: string
  instructions?: string
  pdfUrl?: string
  createdAt: string
  consultation: {
    appointment: {
      scheduledAt: string
      doctor: {
        specialization: string
        user: {
          email: string
        }
      }
    }
  }
}

export default function PatientPrescriptionsPage() {
  const { data: session } = useSession()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

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

  const handleDownload = async (prescription: Prescription) => {
    if (prescription.pdfUrl) {
      window.open(prescription.pdfUrl, '_blank')
      return
    }

    setDownloading(prescription.id)
    try {
      // Generate PDF if not exists
      const res = await fetch(`/api/prescriptions/${prescription.id}/pdf`, {
        method: 'POST',
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ordonnance-${prescription.id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading prescription:', error)
      alert('Erreur lors du téléchargement de l\'ordonnance')
    } finally {
      setDownloading(null)
    }
  }

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
              <FileText className='w-10 h-10 text-green-600' />
              Mes Ordonnances
            </h1>
            <p className='text-gray-600'>
              Téléchargez vos ordonnances médicales en PDF
            </p>
          </div>

          {/* Prescriptions List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
              <p className='mt-4 text-gray-600'>Chargement des ordonnances...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 text-lg'>
                Aucune ordonnance disponible
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {prescriptions
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
                            Dr. {prescription.consultation?.appointment?.doctor?.user?.email?.split('@')[0] || 'Médecin'}
                          </span>
                          <span className='text-gray-500 text-sm'>
                            - {prescription.consultation?.appointment?.doctor?.specialization || 'N/A'}
                          </span>
                          <div className='flex items-center gap-2 text-sm text-gray-500'>
                            <Calendar className='w-4 h-4' />
                            <span>
                              {prescription.consultation?.appointment?.scheduledAt
                                ? new Date(prescription.consultation.appointment.scheduledAt).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })
                                : 'N/A'}
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
                        <button
                          onClick={() => handleDownload(prescription)}
                          disabled={downloading === prescription.id}
                          className='inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          {downloading === prescription.id ? (
                            <>
                              <Loader2 className='w-4 h-4 animate-spin' />
                              Téléchargement...
                            </>
                          ) : (
                            <>
                              <Download className='w-4 h-4' />
                              Télécharger PDF
                            </>
                          )}
                        </button>
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

