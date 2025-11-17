import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

// GET staff member by ID
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

    const staff = await prisma.user.findUnique({
      where: { id },
      include: {
        clinic: true,
      },
    })

    if (!staff || staff.role !== 'RECEPTIONIST') {
      return NextResponse.json(
        { message: 'Staff member not found' },
        { status: 404 }
      )
    }

    // Verify clinic access
    if (clinicId && staff.clinicId !== clinicId) {
      return NextResponse.json(
        { message: 'Unauthorized access to this staff member' },
        { status: 403 }
      )
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { message: 'Error fetching staff' },
      { status: 500 }
    )
  }
}

// PUT update staff member
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
      email,
      password,
    } = body

    const staff = await prisma.user.findUnique({
      where: { id },
    })

    if (!staff || staff.role !== 'RECEPTIONIST') {
      return NextResponse.json(
        { message: 'Staff member not found' },
        { status: 404 }
      )
    }

    // Verify clinic access
    if (clinicId && staff.clinicId !== clinicId) {
      return NextResponse.json(
        { message: 'Unauthorized access to this staff member' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (email && email !== staff.email) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })
      if (existingUser) {
        return NextResponse.json(
          { message: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }
      updateData.email = email
    }
    if (password) {
      updateData.password = await hash(password, 10)
    }

    const updatedStaff = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        clinic: true,
      },
    })

    return NextResponse.json(updatedStaff)
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json(
      { message: 'Error updating staff' },
      { status: 500 }
    )
  }
}

// DELETE staff member
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

    const staff = await prisma.user.findUnique({
      where: { id },
    })

    if (!staff || staff.role !== 'RECEPTIONIST') {
      return NextResponse.json(
        { message: 'Staff member not found' },
        { status: 404 }
      )
    }

    // Verify clinic access before delete
    if (clinicId && staff.clinicId !== clinicId) {
      return NextResponse.json(
        { message: 'Unauthorized access to this staff member' },
        { status: 403 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Staff member deleted successfully' })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json(
      { message: 'Error deleting staff' },
      { status: 500 }
    )
  }
}

