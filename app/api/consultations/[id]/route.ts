import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET consultation by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true,
          },
        },
        prescriptions: true,
      },
    })

    if (!consultation) {
      return NextResponse.json(
        { message: 'Consultation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(consultation)
  } catch (error) {
    console.error('Error fetching consultation:', error)
    return NextResponse.json(
      { message: 'Error fetching consultation' },
      { status: 500 }
    )
  }
}

// PUT update consultation
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || session.user?.role !== 'DOCTOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const {
      diagnosis,
      treatment,
    } = body

    const consultation = await prisma.consultation.update({
      where: { id },
      data: {
        ...(diagnosis && { diagnosis }),
        ...(treatment && { treatment }),
      },
      include: {
        appointment: true,
        prescriptions: true,
      },
    })

    return NextResponse.json(consultation)
  } catch (error) {
    console.error('Error updating consultation:', error)
    return NextResponse.json(
      { message: 'Error updating consultation' },
      { status: 500 }
    )
  }
}
