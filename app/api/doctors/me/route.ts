import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET current doctor's information
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'DOCTOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user?.id },
      include: {
        user: true,
        appointments: {
          include: {
            patient: true,
            consultation: true,
          },
        },
      },
    })

    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error fetching doctor:', error)
    return NextResponse.json(
      { message: 'Error fetching doctor' },
      { status: 500 }
    )
  }
}

