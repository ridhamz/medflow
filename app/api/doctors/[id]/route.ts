import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

// GET doctor by ID
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

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: true,
        appointments: {
          include: {
            patient: true,
            consultation: true,
          },
          orderBy: {
            scheduledAt: 'desc',
          },
        },
      },
    })

    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Verify clinic access
    if (clinicId && doctor.user.clinicId !== clinicId) {
      return NextResponse.json(
        { message: 'Unauthorized access to this doctor' },
        { status: 403 }
      )
    }

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error fetching doctor:', error)
    return NextResponse.json(
      { message: 'Error fetching doctor' },
      { status: 500 }
    )
  }
}

// PUT update doctor
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'RECEPTIONIST')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const clinicId = session.user?.clinicId

    const body = await req.json()
    const {
      specialization,
      licenseNumber,
      email,
      password,
    } = body

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Verify clinic access
    if (clinicId && doctor.user.clinicId !== clinicId) {
      return NextResponse.json(
        { message: 'Unauthorized access to this doctor' },
        { status: 403 }
      )
    }

    // Update doctor info
    const updateData: any = {}
    if (specialization) updateData.specialization = specialization
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber

    // Update user info if provided
    const userUpdateData: any = {}
    if (email && email !== doctor.user.email) {
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
      userUpdateData.email = email
    }
    if (password) {
      userUpdateData.password = await hash(password, 10)
    }

    // Update user if needed
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: doctor.userId },
        data: userUpdateData,
      })
    }

    // Update doctor
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    })

    return NextResponse.json(updatedDoctor)
  } catch (error) {
    console.error('Error updating doctor:', error)
    return NextResponse.json(
      { message: 'Error updating doctor' },
      { status: 500 }
    )
  }
}

// DELETE doctor
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
      const doctor = await prisma.doctor.findUnique({
        where: { id },
        include: { user: true },
      })
      if (doctor && doctor.user.clinicId !== clinicId) {
        return NextResponse.json(
          { message: 'Unauthorized access to this doctor' },
          { status: 403 }
        )
      }
    }

    await prisma.doctor.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Doctor deleted successfully' })
  } catch (error) {
    console.error('Error deleting doctor:', error)
    return NextResponse.json(
      { message: 'Error deleting doctor' },
      { status: 500 }
    )
  }
}

