// components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LogOut,
  User,
  Settings,
  Menu,
  X,
  Home,
  Stethoscope,
  Users,
  Calendar,
  FileText,
  Building2,
  ChevronDown
} from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      ADMIN: 'Administrateur',
      DOCTOR: 'Médecin',
      RECEPTIONIST: 'Réceptionniste',
      PATIENT: 'Patient',
    }
    return labels[role] || role
  }

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      ADMIN: 'bg-gray-600',
      DOCTOR: 'bg-green-600',
      RECEPTIONIST: 'bg-blue-600',
      PATIENT: 'bg-purple-600',
    }
    return colors[role] || 'bg-gray-600'
  }

  const getDashboardPath = (role: string) => {
    const paths: { [key: string]: string } = {
      ADMIN: '/admin',
      DOCTOR: '/doctor',
      RECEPTIONIST: '/receptionist',
      PATIENT: '/patient',
    }
    return paths[role] || '/'
  }

  const navigationItems = [
    {
      name: 'Tableau de bord',
      href: getDashboardPath(session?.user?.role || ''),
      icon: Home,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
    },
    {
      name: 'Patients',
      href: '/admin/patients',
      icon: Users,
      roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
      name: 'Médecins',
      href: '/admin/doctors',
      icon: Stethoscope,
      roles: ['ADMIN'],
    },
    {
      name: 'Rendez-vous',
      href: '/admin/appointments',
      icon: Calendar,
      roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
      name: 'Factures',
      href: '/admin/invoices',
      icon: FileText,
      roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
      name: 'Services',
      href: '/admin/services',
      icon: Building2,
      roles: ['ADMIN'],
    },
  ]

  const filteredNavItems = navigationItems.filter((item) =>
    session?.user?.role ? item.roles.includes(session.user.role) : false
  )

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/doctor' || href === '/receptionist' || href === '/patient') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <Link
              href={getDashboardPath(session?.user?.role || '')}
              className="flex items-center gap-2 group"
            >
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                MedFlow
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 ml-8">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* User Menu */}
            {session?.user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full ${getRoleColor(
                        session.user.role || ''
                      )} flex items-center justify-center text-white text-xs font-semibold`}
                    >
                      {session.user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRoleLabel(session.user.role || '')}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {session.user.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getRoleLabel(session.user.role || '')}
                        </p>
                      </div>
                      <Link
                        href="/admin/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link
                href="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Paramètres
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
