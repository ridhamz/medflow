'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  phone: string
  dateOfBirth: string
  address?: string
}

export default function EditPatientPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  })

  useEffect(() => {
    if (!session || !params.id) return

    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setPatient(data)
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth).toISOString().split('T')[0]
              : '',
            address: data.address || '',
          })
        } else {
          router.push('/receptionist/patients')
        }
      } catch (error) {
        console.error('Error fetching patient:', error)
        router.push('/receptionist/patients')
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [session, params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/patients/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour')
      }

      router.push(`/receptionist/patients/${params.id}`)
    } catch (error: any) {
      console.error('Error updating patient:', error)
      setError(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) {
    return <div>Redirecting...</div>
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 text-green-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Patient non trouvé</p>
          <Link
            href='/receptionist/patients'
            className='text-green-600 hover:text-green-700'
          >
            Retour aux patients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <Link
              href={`/receptionist/patients/${params.id}`}
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4'
            >
              <ArrowLeft className='w-4 h-4' />
              Retour au patient
            </Link>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              Modifier le patient
            </h1>
            <p className='text-gray-600'>
              Mettez à jour les informations du patient
            </p>
          </div>

          {/* Form */}
          <div className='bg-white rounded-xl shadow-sm p-6'>
            {error && (
              <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* First Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Prénom <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nom <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Téléphone <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Date of Birth */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Date de naissance
                  </label>
                  <input
                    type='date'
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                </div>

                {/* Address */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Adresse
                  </label>
                  <input
                    type='text'
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                </div>
              </div>

              {/* Actions */}
              <div className='flex items-center gap-4 pt-4'>
                <button
                  type='submit'
                  disabled={submitting}
                  className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Save className='w-5 h-5' />
                  {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
                <Link
                  href={`/receptionist/patients/${params.id}`}
                  className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium'
                >
                  Annuler
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

