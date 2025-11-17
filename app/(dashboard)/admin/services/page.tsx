'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description?: string
  price: number
  isActive: boolean
  createdAt: string
}

export default function ServicesPage() {
  const { data: session } = useSession()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!session) return

    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services')
        const data = await res.json()
        setServices(data)
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [session])

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      setServices(services.filter(s => s.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Erreur lors de la suppression du service')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (res.ok) {
        setServices(services.map(s => 
          s.id === id ? { ...s, isActive: !currentStatus } : s
        ))
      }
    } catch (error) {
      console.error('Error toggling service status:', error)
    }
  }

  const filteredServices = services.filter(service => {
    const search = searchTerm.toLowerCase()
    return (
      service.name.toLowerCase().includes(search) ||
      (service.description && service.description.toLowerCase().includes(search))
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
                  <DollarSign className='w-10 h-10 text-purple-600' />
                  Services & Tarifs
                </h1>
                <p className='text-gray-600'>
                  Configurez les services et leurs tarifs
                </p>
              </div>
              <Link
                href='/admin/services/new'
                className='inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium'
              >
                <Plus className='w-5 h-5' />
                Ajouter un service
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className='mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Rechercher un service...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Services List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
              <p className='mt-4 text-gray-600'>Chargement des services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 text-lg'>
                {searchTerm ? 'Aucun service trouvé pour cette recherche' : 'Aucun service enregistré'}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className='bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100'
                >
                  <div className='p-6'>
                    {/* Service Header */}
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-1'>
                          {service.name}
                        </h3>
                        <div className='flex items-center gap-2'>
                          {service.isActive ? (
                            <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'>
                              <CheckCircle className='w-3 h-3' />
                              Actif
                            </span>
                          ) : (
                            <span className='inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium'>
                              <XCircle className='w-3 h-3' />
                              Inactif
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='p-2 bg-purple-50 rounded-lg'>
                        <DollarSign className='w-5 h-5 text-purple-600' />
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className='space-y-2 mb-6'>
                      {service.description && (
                        <p className='text-sm text-gray-600 line-clamp-2'>
                          {service.description}
                        </p>
                      )}
                      <div className='flex items-center gap-2'>
                        <span className='text-2xl font-bold text-gray-900'>
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'TND',
                          }).format(Number(service.price))}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 pt-4 border-t border-gray-100'>
                      <Link
                        href={`/admin/services/${service.id}`}
                        className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm font-medium'
                      >
                        <Eye className='w-4 h-4' />
                        Voir
                      </Link>
                      <Link
                        href={`/admin/services/${service.id}/edit`}
                        className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium'
                      >
                        <Edit className='w-4 h-4' />
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleToggleActive(service.id, service.isActive)}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                          service.isActive
                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        title={service.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {service.isActive ? (
                          <XCircle className='w-4 h-4' />
                        ) : (
                          <CheckCircle className='w-4 h-4' />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(service.id)}
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
                  Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.
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

