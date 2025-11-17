'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Users,
  Mail,
  AlertCircle
} from 'lucide-react'

interface Staff {
  id: string
  email: string
  role: string
  createdAt: string
}

export default function StaffPage() {
  const { data: session } = useSession()
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!session) return

    const fetchStaff = async () => {
      try {
        const res = await fetch('/api/staff')
        const data = await res.json()
        setStaff(data)
      } catch (error) {
        console.error('Error fetching staff:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [session])

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      setStaff(staff.filter(s => s.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting staff:', error)
      alert('Erreur lors de la suppression du membre du staff')
    } finally {
      setDeleting(false)
    }
  }

  const filteredStaff = staff.filter(member => {
    const search = searchTerm.toLowerCase()
    return member.email.toLowerCase().includes(search)
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
                  <Users className='w-10 h-10 text-indigo-600' />
                  Gestion du Staff
                </h1>
                <p className='text-gray-600'>
                  Gérez les membres du personnel (réceptionnistes)
                </p>
              </div>
              <Link
                href='/admin/staff/new'
                className='inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium'
              >
                <UserPlus className='w-5 h-5' />
                Ajouter un membre
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className='mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Rechercher un membre du staff...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Staff List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
              <p className='mt-4 text-gray-600'>Chargement du staff...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 text-lg'>
                {searchTerm ? 'Aucun membre trouvé pour cette recherche' : 'Aucun membre du staff enregistré'}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className='bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100'
                >
                  <div className='p-6'>
                    {/* Staff Header */}
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-1'>
                          Réceptionniste
                        </h3>
                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                          <Mail className='w-4 h-4' />
                          <span>{member.email}</span>
                        </div>
                      </div>
                      <div className='p-2 bg-indigo-50 rounded-lg'>
                        <Users className='w-5 h-5 text-indigo-600' />
                      </div>
                    </div>

                    {/* Staff Info */}
                    <div className='space-y-2 mb-6'>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <span className='px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium'>
                          {member.role}
                        </span>
                      </div>
                      <p className='text-xs text-gray-500'>
                        Créé le {new Date(member.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 pt-4 border-t border-gray-100'>
                      <Link
                        href={`/admin/staff/${member.id}`}
                        className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors duration-200 text-sm font-medium'
                      >
                        <Eye className='w-4 h-4' />
                        Voir
                      </Link>
                      <Link
                        href={`/admin/staff/${member.id}/edit`}
                        className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium'
                      >
                        <Edit className='w-4 h-4' />
                        Modifier
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(member.id)}
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
                  Êtes-vous sûr de vouloir supprimer ce membre du staff ? Cette action est irréversible.
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

