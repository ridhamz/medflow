import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET patient by ID
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

    const clinicId = session.user?.clinicId
    const role = session.user?.role

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: true,
        appointments: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
            consultation: {
              select: {
                id: true,
                diagnosis: true,
                treatment: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            scheduledAt: 'desc',
          },
        },
        invoices: true,
      },
    })

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found' },
        { status: 404 }
      )
    }

    // For doctors, check if they have appointments with this patient
    if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user?.id },
      })
      if (doctor) {
        const hasAppointment = patient.appointments.some(
          (apt: any) => apt.doctorId === doctor.id
        )
        if (!hasAppointment) {
          return NextResponse.json(
            { message: 'Unauthorized access to this patient' },
            { status: 403 }
          )
        }
        // Doctor has access, continue
      } else {
        return NextResponse.json(
          { message: 'Doctor not found' },
          { status: 404 }
        )
      }
    } else {
      // For other roles, verify clinic access
      if (clinicId && patient.user.clinicId !== clinicId) {
        return NextResponse.json(
          { message: 'Unauthorized access to this patient' },
          { status: 403 }
        )
      }
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

// PUT update patient
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || (session.user?.role !== 'RECEPTIONIST' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const clinicId = session.user?.clinicId

    const body = await req.json()
    const {
      firstName,
      lastName,
      dateOfBirth,
      phone,
      address,
    } = body

    // Verify clinic access before update
    if (clinicId) {
      const existingPatient = await prisma.patient.findUnique({
        where: { id },
        include: { user: true },
      })
      if (existingPatient && existingPatient.user.clinicId !== clinicId) {
        return NextResponse.json(
          { message: 'Unauthorized access to this patient' },
          { status: 403 }
        )
      }
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(phone && { phone }),
        ...(address && { address }),
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { message: 'Error updating patient' },
      { status: 500 }
    )
  }
}

// DELETE patient
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const clinicId = session.user?.clinicId

    // Verify clinic access before delete
    if (clinicId) {
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: { user: true },
      })
      if (patient && patient.user.clinicId !== clinicId) {
        return NextResponse.json(
          { message: 'Unauthorized access to this patient' },
          { status: 403 }
        )
      }
    }

    await prisma.patient.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Patient deleted successfully' })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { message: 'Error deleting patient' },
      { status: 500 }
    )
  }
}
