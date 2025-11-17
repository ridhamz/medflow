'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Users,
  Phone,
  Mail,
  Calendar,
  AlertCircle
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

export default function PatientsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      setPatients(patients.filter(p => p.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting patient:', error)
      alert('Erreur lors de la suppression du patient')
    } finally {
      setDeleting(false)
    }
  }

  const filteredPatients = patients.filter(patient => {
    const search = searchTerm.toLowerCase()
    return (
      patient.firstName.toLowerCase().includes(search) ||
      patient.lastName.toLowerCase().includes(search) ||
      patient.user?.email.toLowerCase().includes(search) ||
      patient.phone.includes(search)
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
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                  <Users className='w-10 h-10 text-blue-600' />
                  Patients
                </h1>
                <p className='text-gray-600'>
                  Gérez les dossiers de vos patients
                </p>
              </div>
              <Link
                href='/admin/patients/new'
                className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium'
              >
                <UserPlus className='w-5 h-5' />
                Ajouter un patient
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className='mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Rechercher un patient...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Patients List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
              <p className='mt-4 text-gray-600'>Chargement des patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 text-lg'>
                {searchTerm ? 'Aucun patient trouvé pour cette recherche' : 'Aucun patient enregistré'}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className='bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100'
                >
                  <div className='p-6'>
                    {/* Patient Header */}
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-1'>
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                          <Mail className='w-4 h-4' />
                          <span>{patient.user?.email || 'N/A'}</span>
                        </div>
                      </div>
                      <div className='p-2 bg-blue-50 rounded-lg'>
                        <Users className='w-5 h-5 text-blue-600' />
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className='space-y-2 mb-6'>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Phone className='w-4 h-4 text-gray-400' />
                        <span>{patient.phone}</span>
                      </div>
                      {patient.dateOfBirth && (
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <Calendar className='w-4 h-4 text-gray-400' />
                          <span>
                            {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 pt-4 border-t border-gray-100'>
                      <Link
                        href={`/admin/patients/${patient.id}`}
                        className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium'
                      >
                        <Eye className='w-4 h-4' />
                        Voir
                      </Link>
                      <Link
                        href={`/admin/patients/${patient.id}/edit`}
                        className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm font-medium'
                      >
                        <Edit className='w-4 h-4' />
                        Modifier
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(patient.id)}
                        className='inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
              <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-3 bg-red-100 rounded-lg'>
                    <AlertCircle className='w-6 h-6 text-red-600' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Confirmer la suppression
                  </h3>
                </div>
                <p className='text-gray-600 mb-6'>
                  Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.
                </p>
                <div className='flex gap-3'>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className='flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium'
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleting}
                    className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium disabled:opacity-50'
                  >
                    {deleting ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
