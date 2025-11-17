import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET current patient's information
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'PATIENT') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user?.id },
      include: {
        user: true,
      },
    })

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { message: 'Error fetching patient' },
      { status: 500 }
    )
  }
}

