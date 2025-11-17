import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, clinicName, clinicAddress, clinicPhone } = await req.json()

    // Validate input
    if (!email || !password || !clinicName) {
      return NextResponse.json(
        { message: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Check if user already exists
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

    // Create clinic
    const clinic = await prisma.clinic.create({
      data: {
        name: clinicName,
        address: clinicAddress || '',
        phone: clinicPhone || '',
      },
    })

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        clinic: {
          connect: { id: clinic.id },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Inscription réussie',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { message: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
