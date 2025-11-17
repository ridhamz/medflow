import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET single prescription
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const clinicId = session.user?.clinicId

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        consultation: {
          include: {
            appointment: {
              include: {
                patient: true,
                doctor: true,
              },
            },
          },
        },
      },
    })

    if (!prescription) {
      return NextResponse.json(
        { message: 'Prescription not found' },
        { status: 404 }
      )
    }

    // Verify clinic access
    if (clinicId && prescription.consultation.appointment.clinicId !== clinicId) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    // If doctor, verify it's their prescription
    if (session.user?.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user.id },
      })
      if (doctor && prescription.consultation.appointment.doctorId !== doctor.id) {
        return NextResponse.json(
          { message: 'Unauthorized access' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Error fetching prescription:', error)
    return NextResponse.json(
      { message: 'Error fetching prescription' },
      { status: 500 }
    )
  }
}

