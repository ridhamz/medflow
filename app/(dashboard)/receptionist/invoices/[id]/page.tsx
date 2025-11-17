'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react'

interface Invoice {
  id: string
  amount: number
  status: string
  createdAt: string
  patient: {
    id: string
    firstName: string
    lastName: string
    phone: string
  }
}

export default function InvoiceViewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || !params.id) return

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setInvoice(data)
        } else {
          router.push('/receptionist/invoices')
        }
      } catch (error) {
        console.error('Error fetching invoice:', error)
        router.push('/receptionist/invoices')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [session, params.id, router])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        label: 'En attente',
        className: 'bg-orange-100 text-orange-800',
        icon: Clock,
      },
      PAID: {
        label: 'Payée',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      CANCELLED: {
        label: 'Annulée',
        className: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
      icon: FileText,
    }

    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.className}`}
      >
        <Icon className='w-4 h-4' />
        {config.label}
      </span>
    )
  }

  if (!session) {
    return <div>Redirecting...</div>
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 text-orange-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>Facture non trouvée</p>
          <Link
            href='/receptionist/invoices'
            className='text-orange-600 hover:text-orange-700'
          >
            Retour aux factures
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <Link
              href='/receptionist/invoices'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4'
            >
              <ArrowLeft className='w-4 h-4' />
              Retour aux factures
            </Link>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                  Détails de la facture
                </h1>
                <p className='text-gray-600'>
                  ID: {invoice.id.slice(0, 8)}
                </p>
              </div>
              {getStatusBadge(invoice.status)}
            </div>
          </div>

          {/* Content */}
          <div className='space-y-6'>
            {/* Invoice Info */}
            <div className='bg-white rounded-xl shadow-sm p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <FileText className='w-5 h-5' />
                Informations Facture
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Montant</p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {Number(invoice.amount).toFixed(2)} TND
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Date de création</p>
                  <p className='text-lg font-medium text-gray-900 flex items-center gap-2'>
                    <Calendar className='w-4 h-4' />
                    {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className='bg-white rounded-xl shadow-sm p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <User className='w-5 h-5' />
                Informations Patient
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Nom complet</p>
                  <p className='text-lg font-medium text-gray-900'>
                    {invoice.patient.firstName} {invoice.patient.lastName}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Téléphone</p>
                  <p className='text-lg font-medium text-gray-900'>
                    {invoice.patient.phone}
                  </p>
                </div>
              </div>
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <Link
                  href={`/receptionist/patients/${invoice.patient.id}`}
                  className='text-orange-600 hover:text-orange-700 text-sm font-medium'
                >
                  Voir le dossier patient →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

