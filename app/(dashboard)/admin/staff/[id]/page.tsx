'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Users,
  Mail,
  Calendar,
  Loader2
} from 'lucide-react'

interface Staff {
  id: string
  email: string
  role: string
  createdAt: string
  clinic?: {
    name: string
  }
}

export default function StaffViewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [staff, setStaff] = useState<Staff | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || !params.id) return

    const fetchStaff = async () => {
      try {
        const res = await fetch(`/api/staff/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setStaff(data)
        } else {
          router.push('/admin/staff')
        }
      } catch (error) {
        console.error('Error fetching staff:', error)
        router.push('/admin/staff')
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
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

  if (!staff) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Membre du staff non trouvé</p>
          <Link
            href='/admin/staff'
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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <Link
              href='/admin/staff'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour à la liste
            </Link>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                  <Users className='w-10 h-10 text-indigo-600' />
                  Réceptionniste
                </h1>
                <p className='text-gray-600'>Détails du membre du staff</p>
              </div>
              <Link
                href={`/admin/staff/${staff.id}/edit`}
                className='inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium'
              >
                <Edit className='w-5 h-5' />
                Modifier
              </Link>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
              <Users className='w-6 h-6 text-indigo-600' />
              Informations
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                  <Mail className='w-4 h-4' />
                  Email
                </label>
                <p className='text-gray-900 font-medium'>{staff.email}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                  <Users className='w-4 h-4' />
                  Rôle
                </label>
                <p className='text-gray-900'>{staff.role}</p>
              </div>
              {staff.clinic && (
                <div>
                  <label className='text-sm font-medium text-gray-500 mb-1 block'>
                    Clinique
                  </label>
                  <p className='text-gray-900'>{staff.clinic.name}</p>
                </div>
              )}
              <div>
                <label className='text-sm font-medium text-gray-500 mb-1 block flex items-center gap-2'>
                  <Calendar className='w-4 h-4' />
                  Date de création
                </label>
                <p className='text-gray-900'>
                  {new Date(staff.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

