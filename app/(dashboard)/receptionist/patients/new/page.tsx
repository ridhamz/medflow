'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'

export default function NewPatientPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la création du patient')
      }

      router.push('/receptionist/patients')
    } catch (error: any) {
      console.error('Error creating patient:', error)
      setError(error.message || 'Erreur lors de la création du patient')
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
              href='/receptionist/patients'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4'
            >
              <ArrowLeft className='w-4 h-4' />
              Retour aux patients
            </Link>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              Nouveau patient
            </h1>
            <p className='text-gray-600'>
              Enregistrez un nouveau patient dans le système
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

              {/* Email */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                />
              </div>

              {/* Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Mot de passe <span className='text-red-500'>*</span>
                </label>
                <input
                  type='password'
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                />
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
                  {submitting ? 'Enregistrement...' : 'Enregistrer le patient'}
                </button>
                <Link
                  href='/receptionist/patients'
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

