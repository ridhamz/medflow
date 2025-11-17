import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET all prescriptions
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const consultationId = searchParams.get('consultationId')
    const clinicId = session.user?.clinicId

    let where: any = {}
    
    if (consultationId) {
      where.consultationId = consultationId
    }

    // Filter by clinic through consultation -> appointment
    if (clinicId) {
      where.consultation = {
        appointment: {
          clinicId,
        },
      }
    }

    // If patient, filter by their prescriptions
    if (session.user?.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id },
      })
      if (patient) {
        where.consultation = {
          ...where.consultation,
          appointment: {
            ...where.consultation?.appointment,
            patientId: patient.id,
            ...(clinicId ? { clinicId } : {}),
          },
        }
      } else {
        return NextResponse.json([])
      }
    } else if (session.user?.role === 'DOCTOR') {
      // If doctor, filter by their consultations
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user.id },
      })
      if (doctor) {
        where.consultation = {
          ...where.consultation,
          appointment: {
            ...where.consultation?.appointment,
            doctorId: doctor.id,
            ...(clinicId ? { clinicId } : {}),
          },
        }
      }
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json(
      { message: 'Error fetching prescriptions' },
      { status: 500 }
    )
  }
}

// POST create prescription
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'DOCTOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const {
      consultationId,
      medications,
      instructions,
    } = body

    if (!consultationId || !medications) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify consultation exists and belongs to this doctor
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        appointment: {
          include: {
            doctor: true,
          },
        },
      },
    })

    if (!consultation) {
      return NextResponse.json(
        { message: 'Consultation not found' },
        { status: 404 }
      )
    }

    // Verify doctor access
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user?.id },
    })

    if (!doctor || consultation.appointment.doctorId !== doctor.id) {
      return NextResponse.json(
        { message: 'Unauthorized access to this consultation' },
        { status: 403 }
      )
    }

    const prescription = await prisma.prescription.create({
      data: {
        consultationId,
        medications,
        ...(instructions && { instructions }),
      },
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

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      { message: 'Error creating prescription' },
      { status: 500 }
    )
  }
}

