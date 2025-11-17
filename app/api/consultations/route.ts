import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET all consultations
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const appointmentId = searchParams.get('appointmentId')
    const clinicId = session.user?.clinicId
    const role = session.user?.role

    let where: any = {}
    if (appointmentId) {
      where.appointmentId = appointmentId
    }

    // Filter by clinic
    if (clinicId) {
      where.appointment = {
        ...where.appointment,
        clinicId,
      }
    }

    // If doctor, filter by their appointments
    if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user?.id },
      })
      if (doctor) {
        where.appointment = {
          ...where.appointment,
          doctorId: doctor.id,
          ...(clinicId ? { clinicId } : {}),
        }
      }
    }

    const consultations = await prisma.consultation.findMany({
      where,
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
        prescriptions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(consultations)
  } catch (error) {
    console.error('Error fetching consultations:', error)
    return NextResponse.json(
      { message: 'Error fetching consultations' },
      { status: 500 }
    )
  }
}

// POST create consultation
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'DOCTOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const {
      appointmentId,
      diagnosis,
      treatment,
    } = body

    if (!appointmentId || !diagnosis || !treatment) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify appointment exists and is not already consulted
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        consultation: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      )
    }

    if (appointment.consultation) {
      return NextResponse.json(
        { message: 'Appointment already has a consultation' },
        { status: 400 }
      )
    }

    const consultation = await prisma.consultation.create({
      data: {
        appointmentId,
        diagnosis,
        treatment,
      },
      include: {
        appointment: {
          include: {
            patient: true,
            clinic: true,
          },
        },
        prescriptions: true,
      },
    })

    // Update appointment status to COMPLETED
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
    })

    // Create invoice automatically after consultation
    try {
      // Get default service price or use a default amount
      const defaultService = await prisma.service.findFirst({
        where: {
          clinicId: consultation.appointment.clinicId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      const invoiceAmount = defaultService 
        ? Number(defaultService.price) 
        : 50.00 // Default consultation fee in TND

      // Check if invoice already exists for this consultation (using appointment ID in notes or checking recent invoices)
      const recentInvoices = await prisma.invoice.findMany({
        where: {
          patientId: consultation.appointment.patientId,
          status: 'PENDING',
          createdAt: {
            gte: new Date(Date.now() - 300000), // Created in the last 5 minutes
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      })

      // Only create if no recent pending invoice exists
      if (recentInvoices.length === 0) {
        const newInvoice = await prisma.invoice.create({
          data: {
            patientId: consultation.appointment.patientId,
            amount: invoiceAmount,
            status: 'PENDING',
          },
        })
        console.log(`Invoice created for patient ${consultation.appointment.patientId} with amount ${invoiceAmount} TND (Invoice ID: ${newInvoice.id})`)
      } else {
        console.log(`Invoice already exists for patient ${consultation.appointment.patientId}, skipping creation`)
      }
    } catch (invoiceError) {
      // Log error but don't fail the consultation creation
      console.error('Error creating invoice after consultation:', invoiceError)
    }

    return NextResponse.json(consultation, { status: 201 })
  } catch (error) {
    console.error('Error creating consultation:', error)
    return NextResponse.json(
      { message: 'Error creating consultation' },
      { status: 500 }
    )
  }
}
