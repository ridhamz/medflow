import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET service by ID
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

    const clinicId = session.user?.clinicId

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        clinic: true,
      },
    })

    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      )
    }

    // Verify clinic access
    if (clinicId && service.clinicId !== clinicId) {
      return NextResponse.json(
        { message: 'Unauthorized access to this service' },
        { status: 403 }
      )
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { message: 'Error fetching service' },
      { status: 500 }
    )
  }
}

// PUT update service
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const clinicId = session.user?.clinicId

    const body = await req.json()
    const {
      name,
      description,
      price,
      isActive,
    } = body

    // Verify clinic access before update
    if (clinicId) {
      const existingService = await prisma.service.findUnique({
        where: { id },
      })
      if (existingService && existingService.clinicId !== clinicId) {
        return NextResponse.json(
          { message: 'Unauthorized access to this service' },
          { status: 403 }
        )
      }
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (isActive !== undefined) updateData.isActive = isActive

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        clinic: true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { message: 'Error updating service' },
      { status: 500 }
    )
  }
}

// DELETE service
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const clinicId = session.user?.clinicId

    // Verify clinic access before delete
    if (clinicId) {
      const service = await prisma.service.findUnique({
        where: { id },
      })
      if (service && service.clinicId !== clinicId) {
        return NextResponse.json(
          { message: 'Unauthorized access to this service' },
          { status: 403 }
        )
      }
    }

    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { message: 'Error deleting service' },
      { status: 500 }
    )
  }
}

