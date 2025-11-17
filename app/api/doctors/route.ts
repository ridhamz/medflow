import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

// GET all doctors
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clinicId = session.user?.clinicId
    const search = searchParams.get('search')

    let where: any = {
      user: {
        role: 'DOCTOR',
        ...(clinicId ? { clinicId } : {}),
      },
    }

    // Add search filter that works with clinic filter
    if (search) {
      where.AND = [
        {
          user: {
            role: 'DOCTOR',
            ...(clinicId ? { clinicId } : {}),
          },
        },
        {
          OR: [
            { specialization: { contains: search, mode: 'insensitive' } },
            { licenseNumber: { contains: search, mode: 'insensitive' } },
            {
              user: {
                email: { contains: search, mode: 'insensitive' },
                role: 'DOCTOR',
                ...(clinicId ? { clinicId } : {}),
              },
            },
          ],
        },
      ]
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: true,
        appointments: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { message: 'Error fetching doctors' },
      { status: 500 }
    )
  }
}

// POST create doctor
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'RECEPTIONIST')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const {
      email,
      password,
      specialization,
      licenseNumber,
    } = body

    if (!email || !password || !specialization) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user for doctor
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'DOCTOR',
        clinicId: session.user?.clinicId,
      },
    })

    // Create doctor
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization,
        ...(licenseNumber && { licenseNumber }),
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(doctor, { status: 201 })
  } catch (error) {
    console.error('Error creating doctor:', error)
    return NextResponse.json(
      { message: 'Error creating doctor' },
      { status: 500 }
    )
  }
}

