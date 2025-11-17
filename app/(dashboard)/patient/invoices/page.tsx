'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface Invoice {
  id: string
  amount: number
  status: string
  createdAt: string
  paidAt?: string
  stripePaymentId?: string
}

export default function PatientInvoicesPage() {
  const { data: session } = useSession()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return

    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices')
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

  useEffect(() => {
    // Check for payment success/cancellation in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment')
    const sessionId = urlParams.get('session_id')
    
    if (paymentStatus === 'success' && sessionId) {
      // Verify payment with Stripe and update invoice if needed
      const verifyPayment = async () => {
        try {
          const res = await fetch('/api/invoices/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          })
          
          if (res.ok) {
            const data = await res.json()
            console.log('Payment verification:', data)
          }
        } catch (error) {
          console.error('Error verifying payment:', error)
        }
      }

      verifyPayment()

      // Refresh invoices list after a short delay to allow webhook to process
      setTimeout(() => {
        const fetchInvoices = async () => {
          try {
            const res = await fetch('/api/invoices')
            const data = await res.json()
            setInvoices(data)
          } catch (error) {
            console.error('Error fetching invoices:', error)
          }
        }
        fetchInvoices()
      }, 2000) // Wait 2 seconds for webhook to process

      // Clean URL
      window.history.replaceState({}, '', '/patient/invoices')
    } else if (paymentStatus === 'success') {
      // If success but no session_id, just refresh
      const fetchInvoices = async () => {
        try {
          const res = await fetch('/api/invoices')
          const data = await res.json()
          setInvoices(data)
        } catch (error) {
          console.error('Error fetching invoices:', error)
        }
      }
      fetchInvoices()
      window.history.replaceState({}, '', '/patient/invoices')
    }
  }, [])

  const handlePayment = async (invoiceId: string) => {
    setProcessing(invoiceId)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url
        } else {
          alert('Erreur lors de l\'initialisation du paiement')
          setProcessing(null)
        }
      } else {
        const error = await res.json()
        alert(error.message || 'Erreur lors du paiement')
        setProcessing(null)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Erreur lors du traitement du paiement')
      setProcessing(null)
    }
  }

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
              <CreditCard className='w-10 h-10 text-orange-600' />
              Mes Factures
            </h1>
            <p className='text-gray-600'>
              Consultez et payez vos factures en ligne
            </p>
          </div>

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
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
          </div>

          {/* Payment Info Banner */}
          {invoices.some(inv => inv.status === 'PENDING') && (
            <div className='bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 mb-6'>
              <div className='flex items-start gap-4'>
                <div className='p-2 bg-orange-500 rounded-lg'>
                  <CreditCard className='w-6 h-6 text-white' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Paiement en ligne sécurisé
                  </h3>
                  <p className='text-sm text-gray-700 mb-3'>
                    Vous avez des factures en attente de paiement. Cliquez sur le bouton <strong>"Payer"</strong> à côté de chaque facture pour effectuer le paiement en ligne de manière sécurisée via Stripe.
                  </p>
                  <div className='flex flex-wrap gap-2 text-xs text-gray-600'>
                    <span className='flex items-center gap-1'>
                      <CheckCircle className='w-4 h-4 text-green-600' />
                      Paiement sécurisé
                    </span>
                    <span className='flex items-center gap-1'>
                      <CheckCircle className='w-4 h-4 text-green-600' />
                      Confirmation immédiate
                    </span>
                    <span className='flex items-center gap-1'>
                      <CheckCircle className='w-4 h-4 text-green-600' />
                      Reçu par email
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices List */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600'></div>
              <p className='mt-4 text-gray-600'>Chargement des factures...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 text-lg'>
                Aucune facture disponible
              </p>
            </div>
          ) : (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-200'>
                    <tr>
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
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {invoices
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((invoice) => (
                        <tr key={invoice.id} className='hover:bg-gray-50 transition-colors'>
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
                          <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                            {invoice.status === 'PENDING' && (
                              <button
                                onClick={() => handlePayment(invoice.id)}
                                disabled={processing === invoice.id}
                                className='inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none'
                              >
                                {processing === invoice.id ? (
                                  <>
                                    <Loader2 className='w-4 h-4 animate-spin' />
                                    Redirection...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className='w-5 h-5' />
                                    Payer maintenant
                                  </>
                                )}
                              </button>
                            )}
                            {invoice.status === 'PAID' && (
                              <div className='inline-flex items-center gap-2 text-green-600 text-sm font-medium'>
                                <CheckCircle className='w-5 h-5' />
                                Payée
                              </div>
                            )}
                            {invoice.status === 'CANCELLED' && (
                              <span className='text-red-600 text-sm font-medium'>Annulée</span>
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

