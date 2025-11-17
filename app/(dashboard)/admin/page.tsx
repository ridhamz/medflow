'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  UserPlus, 
  Settings, 
  DollarSign,
  ArrowRight,
  Activity,
  UserCog
} from 'lucide-react'

interface Stats {
  patients: number
  doctors: number
  appointments: number
  invoices: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    patients: 0,
    doctors: 0,
    appointments: 0,
    invoices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [session])

  const statCards = [
    {
      title: 'Patients',
      value: stats.patients,
      href: '/admin/patients',
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Médecins',
      value: stats.doctors,
      href: '/admin/doctors',
      icon: Stethoscope,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Rendez-vous',
      value: stats.appointments,
      href: '/admin/appointments',
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
    },
    {
      title: 'Factures',
      value: stats.invoices,
      href: '/admin/invoices',
      icon: FileText,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
    },
  ]

  const menuCards = [
    {
      title: 'Gestion des Patients',
      description: 'Voir, créer et gérer les dossiers patients',
      href: '/admin/patients',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Gestion des Médecins',
      description: 'Ajouter et gérer les médecins',
      href: '/admin/doctors',
      icon: Stethoscope,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Services & Tarifs',
      description: 'Configurer les services et leurs tarifs',
      href: '/admin/services',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Gestion du Staff',
      description: 'Gérer les membres du personnel (réceptionnistes)',
      href: '/admin/staff',
      icon: UserCog,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Paramètres Clinique',
      description: 'Configurer les informations de la clinique',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              Tableau de bord Admin
            </h1>
            <p className='text-gray-600'>
              Vue d'ensemble de votre clinique
            </p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
            {statCards.map((card, index) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className='group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
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
                  style={{
                    animationDelay: `${(index + 4) * 100}ms`,
                  }}
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

          {/* Quick Actions */}
          <div className='mt-8 bg-white rounded-xl shadow-sm p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <Activity className='w-5 h-5 text-gray-600' />
              <h2 className='text-lg font-semibold text-gray-900'>
                Actions Rapides
              </h2>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Link
                href='/admin/patients/new'
                className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md'
              >
                <UserPlus className='w-4 h-4' />
                Nouveau Patient
              </Link>
              <Link
                href='/admin/appointments'
                className='inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md'
              >
                <Calendar className='w-4 h-4' />
                Nouveau Rendez-vous
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
