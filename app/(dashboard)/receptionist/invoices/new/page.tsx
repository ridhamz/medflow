'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  phone: string
}

export default function NewInvoicePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    patientId: '',
    amount: '',
  })

  useEffect(() => {
    if (!session) return

    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/patients')
        if (res.ok) {
          const data = await res.json()
          setPatients(data)
        }
      } catch (error) {
        console.error('Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la création de la facture')
      }

      router.push('/receptionist/invoices')
    } catch (error: any) {
      console.error('Error creating invoice:', error)
      setError(error.message || 'Erreur lors de la création de la facture')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) {
    return <div>Redirecting...</div>
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <Link
              href='/receptionist/invoices'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4'
            >
              <ArrowLeft className='w-4 h-4' />
              Retour aux factures
            </Link>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              Nouvelle facture
            </h1>
            <p className='text-gray-600'>
              Créez une nouvelle facture pour un patient
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
              {/* Patient */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Patient <span className='text-red-500'>*</span>
                </label>
                {loading ? (
                  <div className='h-10 bg-gray-100 rounded-lg animate-pulse'></div>
                ) : (
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData({ ...formData, patientId: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  >
                    <option value=''>Sélectionner un patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} - {patient.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Montant (TND) <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  step='0.01'
                  min='0'
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  placeholder='0.00'
                />
              </div>

              {/* Actions */}
              <div className='flex items-center gap-4 pt-4'>
                <button
                  type='submit'
                  disabled={submitting}
                  className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Save className='w-5 h-5' />
                  {submitting ? 'Création...' : 'Créer la facture'}
                </button>
                <Link
                  href='/receptionist/invoices'
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

