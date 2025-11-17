'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  ArrowRight,
} from 'lucide-react'

interface ReceptionistStats {
  todayAppointments: number
  totalPatients: number
  pendingInvoices: number
  upcomingAppointments: number
}

export default function ReceptionistDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<ReceptionistStats>({
    todayAppointments: 0,
    totalPatients: 0,
    pendingInvoices: 0,
    upcomingAppointments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    const fetchStats = async () => {
      try {
        // Get appointments
        const appointmentsRes = await fetch('/api/appoitments')
        const appointments = appointmentsRes.ok ? await appointmentsRes.json() : []
        
        // Get patients
        const patientsRes = await fetch('/api/patients')
        const patients = patientsRes.ok ? await patientsRes.json() : []
        
        // Get invoices
        const invoicesRes = await fetch('/api/invoices')
        const invoices = invoicesRes.ok ? await invoicesRes.json() : []

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayAppts = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.scheduledAt)
          return aptDate >= today && aptDate < tomorrow && apt.status !== 'CANCELLED'
        })

        const upcomingAppts = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.scheduledAt)
          return aptDate >= now && apt.status !== 'CANCELLED'
        })

        setStats({
          todayAppointments: todayAppts.length,
          totalPatients: patients.length,
          pendingInvoices: invoices.filter((inv: any) => inv.status === 'PENDING').length,
          upcomingAppointments: upcomingAppts.length,
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
      title: 'Rendez-vous aujourd\'hui',
      value: stats.todayAppointments,
      href: '/receptionist/appointments?filter=today',
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Patients enregistrés',
      value: stats.totalPatients,
      href: '/receptionist/patients',
      icon: Users,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Factures en attente',
      value: stats.pendingInvoices,
      href: '/receptionist/invoices?status=PENDING',
      icon: FileText,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
    },
    {
      title: 'Rendez-vous à venir',
      value: stats.upcomingAppointments,
      href: '/receptionist/appointments',
      icon: Clock,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
    },
  ]

  const menuCards = [
    {
      title: 'Gestion des Rendez-vous',
      description: 'Créer, modifier et gérer les rendez-vous',
      href: '/receptionist/appointments',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Enregistrement Patients',
      description: 'Enregistrer et gérer les dossiers patients',
      href: '/receptionist/patients',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Facturation',
      description: 'Créer et gérer les factures',
      href: '/receptionist/invoices',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              Tableau de bord Réceptionniste
            </h1>
            <p className='text-gray-600'>
              Gérez les rendez-vous, les patients et la facturation
            </p>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='bg-white rounded-xl shadow-sm p-6 animate-pulse'
                >
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
                  <div className='h-8 bg-gray-200 rounded w-1/2'></div>
                </div>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
              {statCards.map((stat) => (
                <Link
                  key={stat.title}
                  href={stat.href}
                  className='group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className='relative p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient} text-white shadow-md`}>
                        <stat.icon className='w-6 h-6' />
                      </div>
                    </div>
                    <h3 className='text-sm font-medium text-gray-600 mb-1'>
                      {stat.title}
                    </h3>
                    <p className='text-3xl font-bold text-gray-900'>
                      {stat.value}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Menu Cards */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {menuCards.map((menu) => (
              <Link
                key={menu.title}
                href={menu.href}
                className='group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className={`p-3 rounded-lg ${menu.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <menu.icon className={`w-6 h-6 ${menu.color}`} />
                  </div>
                  <ArrowRight className={`w-5 h-5 ${menu.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`} />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  {menu.title}
                </h3>
                <p className='text-gray-600 text-sm'>
                  {menu.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
