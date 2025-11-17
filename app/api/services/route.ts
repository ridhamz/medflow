import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET all services
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clinicId = session.user?.clinicId
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    let where: any = {}
    
    // Build base clinic filter
    if (clinicId) {
      where.clinicId = clinicId
    }

    // Add search filter that works with clinic filter
    if (search) {
      where.AND = [
        ...(clinicId ? [{ clinicId }] : []),
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ]
    }

    // Add active status filter
    if (isActive !== null && isActive !== undefined) {
      if (where.AND) {
        where.AND.push({ isActive: isActive === 'true' })
      } else {
        where.isActive = isActive === 'true'
      }
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        clinic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { message: 'Error fetching services' },
      { status: 500 }
    )
  }
}

// POST create service
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const {
      name,
      description,
      price,
      isActive = true,
    } = body

    if (!name || !price) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const clinicId = session.user?.clinicId
    if (!clinicId) {
      return NextResponse.json(
        { message: 'Clinic ID is required' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        clinicId,
        name,
        description: description || null,
        price: parseFloat(price),
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        clinic: true,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { message: 'Error creating service' },
      { status: 500 }
    )
  }
}

