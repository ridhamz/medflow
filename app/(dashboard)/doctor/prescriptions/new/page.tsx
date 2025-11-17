'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react'

const prescriptionSchema = z.object({
  medications: z.string().min(10, 'Les médicaments doivent contenir au moins 10 caractères'),
  instructions: z.string().optional(),
})

type PrescriptionInput = z.infer<typeof prescriptionSchema>

export default function CreatePrescriptionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const consultationId = searchParams.get('consultationId')
  const [consultation, setConsultation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrescriptionInput>({
    resolver: zodResolver(prescriptionSchema),
  })

  useEffect(() => {
    if (!session || !consultationId) {
      if (!consultationId) {
        router.push('/doctor/consultations')
      }
      return
    }

    const fetchConsultation = async () => {
      try {
        const res = await fetch(`/api/consultations/${consultationId}`)
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
  }, [session, consultationId, router])

  const onSubmit = async (data: PrescriptionInput) => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          medications: data.medications,
          instructions: data.instructions,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erreur lors de la création de l\'ordonnance')
      }

      router.push(`/doctor/consultations/${consultationId}`)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

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

  if (!consultation) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Consultation non trouvée</p>
          <Link
            href='/doctor/consultations'
            className='text-indigo-600 hover:text-indigo-700'
          >
            Retour aux consultations
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
              href={`/doctor/consultations/${consultationId}`}
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour à la consultation
            </Link>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                <FileText className='w-10 h-10 text-indigo-600' />
                Créer une Ordonnance
              </h1>
              <p className='text-gray-600'>Générez une ordonnance médicale pour cette consultation</p>
            </div>
          </div>

          {/* Consultation Info */}
          <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Informations de la Consultation</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-center gap-2'>
                <User className='w-4 h-4 text-gray-400' />
                <span className='text-gray-900'>
                  {consultation.appointment?.patient?.firstName}{' '}
                  {consultation.appointment?.patient?.lastName}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-gray-400' />
                <span className='text-gray-900'>
                  {consultation.appointment?.scheduledAt &&
                    new Date(consultation.appointment.scheduledAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </span>
              </div>
            </div>
          </div>

          {/* Prescription Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='bg-white rounded-xl shadow-sm p-8 border border-gray-100'
          >
            {error && (
              <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3'>
                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            )}

            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Médicaments <span className='text-red-500'>*</span>
                </label>
                <textarea
                  {...register('medications')}
                  rows={8}
                  placeholder='Listez les médicaments prescrits avec leurs dosages et quantités...'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none'
                />
                {errors.medications && (
                  <p className='mt-1 text-sm text-red-600'>{errors.medications.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Instructions (optionnel)
                </label>
                <textarea
                  {...register('instructions')}
                  rows={6}
                  placeholder='Ajoutez des instructions spécifiques pour la prise des médicaments...'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none'
                />
                {errors.instructions && (
                  <p className='mt-1 text-sm text-red-600'>{errors.instructions.message}</p>
                )}
              </div>
            </div>

            <div className='flex gap-4 mt-8 pt-6 border-t border-gray-200'>
              <button
                type='submit'
                disabled={saving}
                className='inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {saving ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className='w-5 h-5' />
                    Enregistrer l'ordonnance
                  </>
                )}
              </button>
              <Link
                href={`/doctor/consultations/${consultationId}`}
                className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium'
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

