'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  FileText,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react'

interface Invoice {
  id: string
  amount: number
  status: string
  createdAt: string
  paidAt?: string
  stripePaymentId?: string
  patient: {
    id: string
    firstName: string
    lastName: string
    phone: string
  }
}

export default function AdminInvoicesPage() {
  const { data: session } = useSession()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!session) return

    const fetchInvoices = async () => {
      try {
        const url = statusFilter !== 'all' 
          ? `/api/invoices?status=${statusFilter}`
          : '/api/invoices'
        const res = await fetch(url)
        const data = await res.json()
        setInvoices(data)
      } catch (error) {
        console.error('Error fetching invoices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [session, statusFilter])

  const filteredInvoices = invoices.filter(inv => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      inv.patient.firstName.toLowerCase().includes(search) ||
      inv.patient.lastName.toLowerCase().includes(search) ||
      inv.patient.phone.includes(search) ||
      inv.id.toLowerCase().includes(search)
    )
  })

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: { bg: string; text: string; icon: any } } = {
      PENDING: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        icon: Clock,
      },
      PAID: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
      },
      CANCELLED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
      },
    }
    const style = styles[status] || styles.PENDING
    const Icon = style.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className='w-3 h-3' />
        {status === 'PENDING' ? 'En attente' : status === 'PAID' ? 'Payée' : 'Annulée'}
      </span>
    )
  }

  const totalPending = invoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + Number(inv.amount), 0)
  const totalPaid = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + Number(inv.amount), 0)
  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0)

  if (!session) {
    return <div>Redirecting...</div>
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
              <FileText className='w-10 h-10 text-orange-600' />
              Gestion des Factures
            </h1>
            <p className='text-gray-600'>
              Consultez et gérez toutes les factures
            </p>
          </div>

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>Total en attente</p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {totalPending.toFixed(2)} TND
                  </p>
                </div>
                <Clock className='w-8 h-8 text-orange-400' />
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>Total payé</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {totalPaid.toFixed(2)} TND
                  </p>
                </div>
                <CheckCircle className='w-8 h-8 text-green-400' />
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>Total général</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {totalAmount.toFixed(2)} TND
                  </p>
                </div>
                <DollarSign className='w-8 h-8 text-gray-400' />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className='mb-6 flex flex-col sm:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Rechercher un patient...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              />
            </div>
            <div className='relative'>
              <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white'
              >
                <option value='all'>Tous les statuts</option>
                <option value='PENDING'>En attente</option>
                <option value='PAID'>Payées</option>
                <option value='CANCELLED'>Annulées</option>
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
              <AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 text-lg'>
                {searchTerm ? 'Aucune facture trouvée pour cette recherche' : 'Aucune facture enregistrée'}
              </p>
            </div>
          ) : (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Patient
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Date
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Montant
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Statut
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Date de paiement
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ID Paiement
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredInvoices
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((invoice) => (
                        <tr key={invoice.id} className='hover:bg-gray-50 transition-colors'>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center gap-2'>
                              <User className='w-4 h-4 text-gray-400' />
                              <span className='text-sm font-medium text-gray-900'>
                                {invoice.patient.firstName} {invoice.patient.lastName}
                              </span>
                            </div>
                            <div className='text-xs text-gray-500 mt-1'>
                              {invoice.patient.phone}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center gap-2'>
                              <Calendar className='w-4 h-4 text-gray-400' />
                              <span className='text-sm text-gray-900'>
                                {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center gap-2'>
                              <DollarSign className='w-4 h-4 text-gray-400' />
                              <span className='text-sm font-medium text-gray-900'>
                                {Number(invoice.amount).toFixed(2)} TND
                              </span>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            {getStatusBadge(invoice.status)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {invoice.paidAt
                              ? new Date(invoice.paidAt).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : '-'}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono'>
                            {invoice.stripePaymentId ? (
                              <span className='text-xs'>{invoice.stripePaymentId.slice(0, 20)}...</span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

