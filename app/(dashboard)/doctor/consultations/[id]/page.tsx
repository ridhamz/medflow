'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ClipboardList,
  User,
  Calendar,
  FileText,
  Plus,
  Loader2,
  AlertCircle
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
      phone: string
    }
  }
  prescriptions: Array<{
    id: string
    medications: string
    instructions?: string
    createdAt: string
  }>
}

export default function ConsultationDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || !params.id) return

    const fetchConsultation = async () => {
      try {
        const res = await fetch(`/api/consultations/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setConsultation(data)
        } else {
          router.push('/doctor/consultations')
        }
      } catch (error) {
        console.error('Error fetching consultation:', error)
        router.push('/doctor/consultations')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultation()
  }, [session, params.id, router])

  if (!session) {
    return <div>Redirecting...</div>
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 text-purple-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Consultation non trouvée</p>
          <Link
            href='/doctor/consultations'
            className='text-purple-600 hover:text-purple-700'
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
              href='/doctor/consultations'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour à la liste
            </Link>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                <ClipboardList className='w-10 h-10 text-purple-600' />
                Détails de la Consultation
              </h1>
              <p className='text-gray-600'>Informations complètes de la consultation</p>
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
                    {consultation.appointment.patient.firstName}{' '}
                    {consultation.appointment.patient.lastName}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-1 block'>Téléphone</label>
                  <p className='text-gray-900'>{consultation.appointment.patient.phone}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                    <Calendar className='w-4 h-4' />
                    Date du rendez-vous
                  </label>
                  <p className='text-gray-900'>
                    {new Date(consultation.appointment.scheduledAt).toLocaleDateString('fr-FR', {
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

            {/* Consultation Details */}
            <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>Détails de la Consultation</h2>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-2 block'>Diagnostic</label>
                  <p className='text-gray-900 whitespace-pre-wrap'>{consultation.diagnosis}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-2 block'>Traitement</label>
                  <p className='text-gray-900 whitespace-pre-wrap'>{consultation.treatment}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-2 block'>Date de création</label>
                  <p className='text-gray-900'>
                    {new Date(consultation.createdAt).toLocaleDateString('fr-FR', {
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

            {/* Prescriptions */}
            <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
                  <FileText className='w-6 h-6 text-indigo-600' />
                  Ordonnances ({consultation.prescriptions.length})
                </h2>
                <Link
                  href={`/doctor/prescriptions/new?consultationId=${consultation.id}`}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md'
                >
                  <Plus className='w-4 h-4' />
                  Nouvelle ordonnance
                </Link>
              </div>
              {consultation.prescriptions.length > 0 ? (
                <div className='space-y-4'>
                  {consultation.prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className='p-4 bg-gray-50 rounded-lg border border-gray-200'
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <h3 className='font-medium text-gray-900 mb-2'>Médicaments</h3>
                          <p className='text-gray-700 whitespace-pre-wrap'>{prescription.medications}</p>
                        </div>
                        <Link
                          href={`/doctor/prescriptions/${prescription.id}`}
                          className='text-indigo-600 hover:text-indigo-700 text-sm font-medium'
                        >
                          Voir détails
                        </Link>
                      </div>
                      {prescription.instructions && (
                        <div className='mt-3 pt-3 border-t border-gray-200'>
                          <h4 className='text-sm font-medium text-gray-700 mb-1'>Instructions</h4>
                          <p className='text-sm text-gray-600 whitespace-pre-wrap'>
                            {prescription.instructions}
                          </p>
                        </div>
                      )}
                      <p className='text-xs text-gray-500 mt-3'>
                        Créée le{' '}
                        {new Date(prescription.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                  <p className='text-gray-500 mb-4'>Aucune ordonnance créée pour cette consultation</p>
                  <Link
                    href={`/doctor/prescriptions/new?consultationId=${consultation.id}`}
                    className='inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium'
                  >
                    <Plus className='w-4 h-4' />
                    Créer une ordonnance
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

