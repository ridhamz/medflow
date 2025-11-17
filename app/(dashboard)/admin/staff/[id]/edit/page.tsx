'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  Save,
  Loader2,
  Users,
  AlertCircle
} from 'lucide-react'

const staffSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional().or(z.literal('')),
})

type StaffInput = z.infer<typeof staffSchema>

export default function EditStaffPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StaffInput>({
    resolver: zodResolver(staffSchema),
  })

  useEffect(() => {
    if (!session || !params.id) return

    const fetchStaff = async () => {
      try {
        const res = await fetch(`/api/staff/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          reset({
            email: data.email || '',
            password: '',
          })
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
  }, [session, params.id, router, reset])

  const onSubmit = async (data: StaffInput) => {
    setSaving(true)
    setError('')

    try {
      const updateData: any = {
        email: data.email,
      }

      // Only include password if it's provided
      if (data.password && data.password.length > 0) {
        updateData.password = data.password
      }

      const res = await fetch(`/api/staff/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erreur lors de la mise à jour')
      }

      router.push(`/admin/staff/${params.id}`)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour')
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <Link
              href={`/admin/staff/${params.id}`}
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              Retour aux détails
            </Link>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                <Users className='w-10 h-10 text-indigo-600' />
                Modifier le membre du staff
              </h1>
              <p className='text-gray-600'>Mettez à jour les informations du membre</p>
            </div>
          </div>

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

            <div className='grid grid-cols-1 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('email')}
                  type='email'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                />
                {errors.email && (
                  <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nouveau mot de passe (laisser vide pour ne pas changer)
                </label>
                <input
                  {...register('password')}
                  type='password'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                />
                {errors.password && (
                  <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>
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
                    Enregistrer les modifications
                  </>
                )}
              </button>
              <Link
                href={`/admin/staff/${params.id}`}
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

