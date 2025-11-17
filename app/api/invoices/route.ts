import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET all invoices
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const role = session.user?.role

    let where: any = {}
    
    if (role === 'PATIENT') {
      // Patient can only see their own invoices
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user?.id || '' },
      })
      if (patient) {
        where.patientId = patient.id
      } else {
        return NextResponse.json([])
      }
    } else if (patientId) {
      where.patientId = patientId
    }

    if (status) {
      where.status = status
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        patient: true,
      },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { message: 'Error fetching invoices' },
      { status: 500 }
    )
  }
}

// POST create invoice
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user?.role !== 'RECEPTIONIST' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const {
      patientId,
      amount,
    } = body

    if (!patientId || !amount) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.create({
      data: {
        patientId,
        amount: parseFloat(amount),
        status: 'PENDING',
      },
      include: {
        patient: true,
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { message: 'Error creating invoice' },
      { status: 500 }
    )
  }
}
