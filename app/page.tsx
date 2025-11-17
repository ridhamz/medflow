import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const role = session.user?.role
  if (role === 'ADMIN') {
    redirect('/admin')
  } else if (role === 'DOCTOR') {
    redirect('/doctor')
  } else if (role === 'RECEPTIONIST') {
    redirect('/receptionist')
  } else if (role === 'PATIENT') {
    redirect('/patient')
  }

  return null
}
