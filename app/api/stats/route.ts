import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const clinicId = session.user?.clinicId

    // Debug: Log clinicId
    console.log('Stats API - clinicId:', clinicId)

    // Build where clause for clinic filtering
    const clinicWhere = clinicId ? { clinicId } : {}

    // Get patient IDs for clinic - use both direct user clinicId and appointments
    let patientIds: string[] = []
    if (clinicId) {
      // Get patients from users with clinicId
      const clinicPatientsFromUsers = await prisma.patient.findMany({
        where: {
          user: {
            clinicId,
          },
        },
        select: {
          id: true,
        },
      })
      
      // Get patients from appointments with clinicId (in case patient user doesn't have clinicId)
      const clinicAppointments = await prisma.appointment.findMany({
        where: {
          clinicId,
        },
        select: {
          patientId: true,
        },
      })
      
      // Combine both sources
      const allPatientIds = new Set([
        ...clinicPatientsFromUsers.map((p) => p.id),
        ...clinicAppointments.map((a) => a.patientId),
      ])
      
      patientIds = Array.from(allPatientIds)
      console.log('Clinic patient IDs (combined):', patientIds)
    }

    // Fetch counts in parallel
    const [patientsCount, doctorsCount, appointmentsCount, invoicesCount] = await Promise.all([
      // Count patients
      prisma.patient.count({
        where: clinicId
          ? {
              user: {
                clinicId,
              },
            }
          : {},
      }),
      // Count doctors (users with DOCTOR role)
      prisma.user.count({
        where: {
          role: 'DOCTOR',
          ...(clinicId ? { clinicId } : {}),
        },
      }),
      // Count appointments
      prisma.appointment.count({
        where: clinicWhere,
      }),
      // Count invoices - using patient IDs array (from both sources)
      clinicId && patientIds.length > 0
        ? prisma.invoice.count({
            where: {
              patientId: {
                in: patientIds,
              },
            },
          })
        : clinicId
        ? 0 // No patients in clinic, so no invoices
        : prisma.invoice.count({}),
    ])

    console.log('Stats result:', {
      patients: patientsCount,
      doctors: doctorsCount,
      appointments: appointmentsCount,
      invoices: invoicesCount,
    })

    return NextResponse.json({
      patients: patientsCount,
      doctors: doctorsCount,
      appointments: appointmentsCount,
      invoices: invoicesCount,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { message: 'Error fetching stats' },
      { status: 500 }
    )
  }
}

