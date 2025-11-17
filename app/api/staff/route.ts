import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

// GET all staff (receptionists)
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
      role: 'RECEPTIONIST',
      ...(clinicId ? { clinicId } : {}),
    }

    if (search) {
      where.email = { contains: search, mode: 'insensitive' }
    }

    const staff = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { message: 'Error fetching staff' },
      { status: 500 }
    )
  }
}

// POST create staff member (receptionist)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const {
      email,
      password,
    } = body

    if (!email || !password) {
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

    // Create receptionist user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'RECEPTIONIST',
        clinicId: session.user?.clinicId,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { message: 'Error creating staff' },
      { status: 500 }
    )
  }
}

