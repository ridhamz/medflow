import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET clinic information
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const clinicId = session.user?.clinicId
    if (!clinicId) {
      return NextResponse.json(
        { message: 'No clinic associated with this user' },
        { status: 404 }
      )
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            users: true,
            services: true,
            appointments: true,
          },
        },
      },
    })

    if (!clinic) {
      return NextResponse.json(
        { message: 'Clinic not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(clinic)
  } catch (error) {
    console.error('Error fetching clinic:', error)
    return NextResponse.json(
      { message: 'Error fetching clinic' },
      { status: 500 }
    )
  }
}

// PUT update clinic
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const clinicId = session.user?.clinicId
    if (!clinicId) {
      return NextResponse.json(
        { message: 'No clinic associated with this user' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { name, address, phone } = body

    if (!name || !address || !phone) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        name,
        address,
        phone,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            users: true,
            services: true,
            appointments: true,
          },
        },
      },
    })

    return NextResponse.json(clinic)
  } catch (error) {
    console.error('Error updating clinic:', error)
    return NextResponse.json(
      { message: 'Error updating clinic' },
      { status: 500 }
    )
  }
}

