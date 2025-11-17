import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET all patients
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clinicId = session.user?.clinicId
    const search = searchParams.get('search')

    let where: any = {}
    
    // Build clinic filter
    if (clinicId) {
      where.user = { clinicId }
    }
    
    // Add search filter that works with clinic filter
    if (search) {
      const searchConditions: any[] = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
      
      // Add email search with clinic filter if needed
      if (clinicId) {
        searchConditions.push({
          user: {
            email: { contains: search, mode: 'insensitive' },
            clinicId,
          },
        })
      } else {
        searchConditions.push({
          user: {
            email: { contains: search, mode: 'insensitive' },
          },
        })
      }
      
      // Combine clinic filter with search
      if (clinicId) {
        where.AND = [
          { user: { clinicId } },
          { OR: searchConditions },
        ]
      } else {
        where.OR = searchConditions
      }
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        user: true,
        appointments: true,
      },
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { message: 'Error fetching patients' },
      { status: 500 }
    )
  }
}

// POST create patient
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'RECEPTIONIST' && session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const {
      firstName,
      lastName,
      dateOfBirth,
      phone,
      address,
      email,
    } = body

    if (!firstName || !lastName || !email || !dateOfBirth) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    let userId: string
    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create user for patient
      const user = await prisma.user.create({
        data: {
          email,
          password: '', // Patient will set password on first login
          role: 'PATIENT',
          clinicId: session.user?.clinicId,
        },
      })
      userId = user.id
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        userId,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        phone,
        ...(address && { address }),
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { message: 'Error creating patient' },
      { status: 500 }
    )
  }
}
