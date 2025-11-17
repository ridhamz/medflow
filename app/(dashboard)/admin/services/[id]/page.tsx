'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description?: string
  price: number
  isActive: boolean
  createdAt: string
  clinic?: {
    name: string
  }
}

export default function ServiceViewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || !params.id) return

    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setService(data)
        } else {
          router.push('/admin/services')
        }
      } catch (error) {
        console.error('Error fetching service:', error)
        router.push('/admin/services')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
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

  if (!service) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Service non trouvé</p>
          <Link
            href='/admin/services'
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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <Link
              href='/admin/services'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour à la liste
            </Link>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                  <DollarSign className='w-10 h-10 text-purple-600' />
                  {service.name}
                </h1>
                <p className='text-gray-600'>Détails du service</p>
              </div>
              <Link
                href={`/admin/services/${service.id}/edit`}
                className='inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium'
              >
                <Edit className='w-5 h-5' />
                Modifier
              </Link>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
              <DollarSign className='w-6 h-6 text-purple-600' />
              Informations du service
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='text-sm font-medium text-gray-500 mb-1 block'>
                  Nom du service
                </label>
                <p className='text-gray-900 font-medium'>{service.name}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                  Statut
                </label>
                {service.isActive ? (
                  <span className='inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'>
                    <CheckCircle className='w-4 h-4' />
                    Actif
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium'>
                    <XCircle className='w-4 h-4' />
                    Inactif
                  </span>
                )}
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500 mb-1 block'>
                  Prix
                </label>
                <p className='text-2xl font-bold text-gray-900'>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'TND',
                  }).format(Number(service.price))}
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                  <Calendar className='w-4 h-4' />
                  Date de création
                </label>
                <p className='text-gray-900'>
                  {new Date(service.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {service.description && (
                <div className='md:col-span-2'>
                  <label className='text-sm font-medium text-gray-500 mb-1 block'>
                    Description
                  </label>
                  <p className='text-gray-900'>{service.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

