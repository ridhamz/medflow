'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Download,
  Loader2,
  Printer
} from 'lucide-react'

interface Prescription {
  id: string
  medications: string
  instructions?: string
  pdfUrl?: string
  createdAt: string
  consultation: {
    id: string
    diagnosis: string
    treatment: string
    appointment: {
      scheduledAt: string
      patient: {
        firstName: string
        lastName: string
        phone: string
      }
    }
  }
}

export default function PrescriptionDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || !params.id) return

    const fetchPrescription = async () => {
      try {
        const res = await fetch(`/api/prescriptions/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setPrescription(data)
        } else {
          router.push('/doctor/prescriptions')
        }
      } catch (error) {
        console.error('Error fetching prescription:', error)
        router.push('/doctor/prescriptions')
      } finally {
        setLoading(false)
      }
    }

    fetchPrescription()
  }, [session, params.id, router])

  if (!session) {
    return <div>Redirecting...</div>
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Ordonnance non trouvée</p>
          <Link
            href='/doctor/prescriptions'
            className='text-indigo-600 hover:text-indigo-700'
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <Link
              href='/doctor/prescriptions'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour à la liste
            </Link>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                <FileText className='w-10 h-10 text-indigo-600' />
                Détails de l'Ordonnance
              </h1>
              <p className='text-gray-600'>Informations complètes de l'ordonnance médicale</p>
            </div>
          </div>

          <div className='space-y-6'>
            {/* Patient Info */}
            <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <User className='w-6 h-6 text-green-600' />
                Informations Patient
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-1 block'>Nom complet</label>
                  <p className='text-gray-900'>
                    {prescription.consultation.appointment.patient.firstName}{' '}
                    {prescription.consultation.appointment.patient.lastName}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-1 block'>Téléphone</label>
                  <p className='text-gray-900'>{prescription.consultation.appointment.patient.phone}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                    <Calendar className='w-4 h-4' />
                    Date de consultation
                  </label>
                  <p className='text-gray-900'>
                    {new Date(prescription.consultation.appointment.scheduledAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Prescription Details */}
            <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>Détails de l'Ordonnance</h2>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-2 block'>Médicaments</label>
                  <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                    <p className='text-gray-900 whitespace-pre-wrap'>{prescription.medications}</p>
                  </div>
                </div>
                {prescription.instructions && (
                  <div>
                    <label className='text-sm font-medium text-gray-500 mb-2 block'>Instructions</label>
                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                      <p className='text-gray-900 whitespace-pre-wrap'>{prescription.instructions}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-2 block'>Date de création</label>
                  <p className='text-gray-900'>
                    {new Date(prescription.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-4'>
              {prescription.pdfUrl ? (
                <a
                  href={prescription.pdfUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md font-medium'
                >
                  <Download className='w-5 h-5' />
                  Télécharger PDF
                </a>
              ) : (
                <button
                  onClick={() => window.print()}
                  className='inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md font-medium'
                >
                  <Printer className='w-5 h-5' />
                  Imprimer
                </button>
              )}
              <Link
                href={`/doctor/consultations/${prescription.consultation.id}`}
                className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium'
              >
                Voir la consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

