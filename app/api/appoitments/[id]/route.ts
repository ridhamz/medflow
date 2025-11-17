import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET appointment by ID
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

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        consultation: {
          include: {
            prescriptions: true,
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { message: 'Error fetching appointment' },
      { status: 500 }
    )
  }
}

// PUT update appointment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      scheduledAt,
      status,
      notes,
    } = body

    // Verify access
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update
    if (session.user?.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id },
      })
      if (!patient || existingAppointment.patientId !== patient.id) {
        return NextResponse.json(
          { message: 'Unauthorized access to this appointment' },
          { status: 403 }
        )
      }
      // Patients can only update scheduledAt and notes, not status
      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          patient: true,
          doctor: true,
        },
      })
      return NextResponse.json(appointment)
    }

    // For other roles (ADMIN, RECEPTIONIST, DOCTOR)
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        patient: true,
        doctor: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { message: 'Error updating appointment' },
      { status: 500 }
    )
  }
}

// DELETE appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await prisma.appointment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { message: 'Error deleting appointment' },
      { status: 500 }
    )
  }
}
