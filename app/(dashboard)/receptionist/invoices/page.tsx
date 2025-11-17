'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
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

export default function ReceptionistInvoicesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status')
  
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(statusParam || 'all')

  useEffect(() => {
    if (!session) return

    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices')
        if (!res.ok) throw new Error('Failed to fetch invoices')
        const data = await res.json()
        setInvoices(data)
      } catch (error) {
        console.error('Error fetching invoices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [session])

  // Filter invoices
  let filteredInvoices = invoices

  // Apply status filter
  if (statusFilter !== 'all') {
    filteredInvoices = filteredInvoices.filter(
      (inv) => inv.status === statusFilter
    )
  }

  // Apply search filter
  if (searchTerm) {
    const search = searchTerm.toLowerCase()
    filteredInvoices = filteredInvoices.filter(
      (inv) =>
        inv.patient.firstName.toLowerCase().includes(search) ||
        inv.patient.lastName.toLowerCase().includes(search) ||
        inv.patient.phone.includes(search) ||
        inv.id.toLowerCase().includes(search)
    )
  }

  // Sort by date (newest first)
  filteredInvoices.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

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
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        <Icon className='w-3 h-3' />
        {config.label}
      </span>
    )
  }

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0)
  const pendingAmount = filteredInvoices
    .filter((inv) => inv.status === 'PENDING')
    .reduce((sum, inv) => sum + Number(inv.amount), 0)
  const paidAmount = filteredInvoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + Number(inv.amount), 0)

  if (!session) {
    return <div>Redirecting...</div>
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                Facturation
              </h1>
              <p className='text-gray-600'>
                Créez et gérez les factures des patients
              </p>
            </div>
            <Link
              href='/receptionist/invoices/new'
              className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-lg font-medium'
            >
              <Plus className='w-5 h-5' />
              Nouvelle facture
            </Link>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6'>
            <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Total factures</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {filteredInvoices.length}
                  </p>
                </div>
                <FileText className='w-8 h-8 text-gray-400' />
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>En attente</p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {pendingAmount.toFixed(2)} TND
                  </p>
                </div>
                <Clock className='w-8 h-8 text-orange-400' />
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>Payées</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {paidAmount.toFixed(2)} TND
                  </p>
                </div>
                <CheckCircle className='w-8 h-8 text-green-400' />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className='bg-white rounded-xl shadow-sm p-6 mb-6'>
            <div className='flex flex-col sm:flex-row gap-4'>
              {/* Search */}
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Rechercher par patient, ID facture...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              >
                <option value='all'>Tous les statuts</option>
                <option value='PENDING'>En attente</option>
                <option value='PAID'>Payée</option>
                <option value='CANCELLED'>Annulée</option>
              </select>
            </div>
          </div>

          {/* Invoices List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600'></div>
              <p className='mt-4 text-gray-600'>Chargement des factures...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <FileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Aucune facture trouvée
              </h3>
              <p className='text-gray-600 mb-6'>
                {searchTerm || statusFilter !== 'all'
                  ? 'Aucune facture ne correspond à vos critères'
                  : 'Commencez par créer une nouvelle facture'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  href='/receptionist/invoices/new'
                  className='inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors'
                >
                  <Plus className='w-5 h-5' />
                  Créer une facture
                </Link>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100'
                >
                  <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                    <div className='flex-1'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                            {invoice.patient.firstName} {invoice.patient.lastName}
                          </h3>
                          <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                            <div className='flex items-center gap-1.5'>
                              <DollarSign className='w-4 h-4' />
                              <span className='font-semibold text-gray-900'>
                                {Number(invoice.amount).toFixed(2)} TND
                              </span>
                            </div>
                            <div className='flex items-center gap-1.5'>
                              <User className='w-4 h-4' />
                              <span>{invoice.patient.phone}</span>
                            </div>
                            <div className='flex items-center gap-1.5'>
                              <Calendar className='w-4 h-4' />
                              <span>
                                {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className='text-xs text-gray-500'>
                              ID: {invoice.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(invoice.status)}
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Link
                        href={`/receptionist/invoices/${invoice.id}`}
                        className='inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
                      >
                        <Eye className='w-4 h-4' />
                        Voir
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

