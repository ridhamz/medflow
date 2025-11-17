'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  FileText,
  CreditCard,
  User,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface PatientStats {
  upcomingAppointments: number
  prescriptions: number
  pendingInvoices: number
}

export default function PatientDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<PatientStats>({
    upcomingAppointments: 0,
    prescriptions: 0,
    pendingInvoices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    const fetchStats = async () => {
      try {
        // Get appointments
        const appointmentsRes = await fetch('/api/appoitments')
        const appointments = appointmentsRes.ok ? await appointmentsRes.json() : []
        
        // Get prescriptions
        const prescriptionsRes = await fetch('/api/prescriptions')
        const prescriptions = prescriptionsRes.ok ? await prescriptionsRes.json() : []
        
        // Get invoices
        const invoicesRes = await fetch('/api/invoices')
        const invoices = invoicesRes.ok ? await invoicesRes.json() : []

        const now = new Date()
        const upcomingAppts = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.scheduledAt)
          return aptDate >= now && apt.status !== 'CANCELLED'
        })

        setStats({
          upcomingAppointments: upcomingAppts.length,
          prescriptions: prescriptions.length,
          pendingInvoices: invoices.filter((inv: any) => inv.status === 'PENDING').length,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [session])

  if (!session) {
    return <div>Redirecting...</div>
  }

  const statCards = [
    {
      title: 'Prochains rendez-vous',
      value: stats.upcomingAppointments,
      href: '/patient/appointments',
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Ordonnances',
      value: stats.prescriptions,
      href: '/patient/prescriptions',
      icon: FileText,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Factures en attente',
      value: stats.pendingInvoices,
      href: '/patient/invoices',
      icon: CreditCard,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
    },
  ]

  const menuCards = [
    {
      title: 'Mes Rendez-vous',
      description: 'Réserver ou modifier un rendez-vous',
      href: '/patient/appointments',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Mes Ordonnances',
      description: 'Télécharger mes ordonnances PDF',
      href: '/patient/prescriptions',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Mes Factures',
      description: 'Consulter et payer mes factures',
      href: '/patient/invoices',
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Mon Profil',
      description: 'Voir et modifier mes informations',
      href: '/patient/profile',
      icon: User,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
              <User className='w-10 h-10 text-purple-600' />
              Mon Espace Patient
            </h1>
            <p className='text-gray-600'>
              Gérez vos rendez-vous, ordonnances et paiements
            </p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8'>
            {statCards.map((card, index) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className='group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className='relative p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} shadow-lg`}>
                        <Icon className='w-6 h-6 text-white' />
                      </div>
                      <ArrowRight className='w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300' />
                    </div>
                    <dt className='text-sm font-medium text-gray-600 mb-1'>
                      {card.title}
                    </dt>
                    {loading ? (
                      <div className='h-10 w-20 bg-gray-200 rounded animate-pulse' />
                    ) : (
                      <dd className='text-3xl font-bold text-gray-900'>
                        {card.value.toLocaleString()}
                      </dd>
                    )}
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                </Link>
              )
            })}
          </div>

          {/* Menu Cards */}
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            {menuCards.map((card, index) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className='group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'
                >
                  <div className='absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                  <div className='relative p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className={`p-3 rounded-lg ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${card.color}`} />
                      </div>
                      <ArrowRight className='w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300' />
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors'>
                      {card.title}
                    </h3>
                    <p className='text-sm text-gray-600 leading-relaxed'>
                      {card.description}
                    </p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${card.bgColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
