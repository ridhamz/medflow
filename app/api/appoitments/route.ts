import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET all appointments
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clinicId = session.user?.clinicId
    const role = session.user?.role
    const patientId = searchParams.get('patientId')
    const doctorIdParam = searchParams.get('doctorId')
    const status = searchParams.get('status')

    let where: any = {}
    
    if (clinicId) {
      where.clinicId = clinicId
    }
    if (patientId) {
      where.patientId = patientId
    } else if (role === 'PATIENT') {
      // Patient can only see their own appointments
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user?.id || '' },
      })
      if (patient) {
        where.patientId = patient.id
      } else {
        return NextResponse.json([])
      }
    }
    
    // Handle doctor filtering
    if (doctorIdParam === 'current' && role === 'DOCTOR') {
      // Get current doctor's ID
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user?.id },
      })
      if (doctor) {
        where.doctorId = doctor.id
      }
    } else if (doctorIdParam) {
      where.doctorId = doctorIdParam
    } else if (role === 'DOCTOR') {
      // If doctor and no doctorId param, filter by their own appointments
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user?.id },
      })
      if (doctor) {
        where.doctorId = doctor.id
      }
    }
    
    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
        consultation: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { message: 'Error fetching appointments' },
      { status: 500 }
    )
  }
}

// POST create appointment
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      patientId,
      doctorId,
      scheduledAt,
      notes,
    } = body

    if (!patientId || !doctorId || !scheduledAt) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify patient and doctor exist
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
      },
    })
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: true,
      },
    })

    if (!patient || !doctor) {
      return NextResponse.json(
        { message: 'Patient or doctor not found' },
        { status: 404 }
      )
    }

    // Get clinicId from patient, doctor, or session
    let clinicId = session.user?.clinicId
    if (!clinicId) {
      clinicId = patient.user.clinicId || doctor.user.clinicId
    }

    if (!clinicId) {
      return NextResponse.json(
        { message: 'Clinic ID is required. Patient or doctor must be associated with a clinic.' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        clinicId,
        scheduledAt: new Date(scheduledAt),
        status: 'SCHEDULED',
        ...(notes && { notes }),
      },
      include: {
        patient: true,
        doctor: true,
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { message: error.message || 'Error creating appointment' },
      { status: 500 }
    )
  }
}
