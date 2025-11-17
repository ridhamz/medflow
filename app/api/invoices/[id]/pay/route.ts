import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

// POST initiate payment for invoice
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || session.user?.role !== 'PATIENT') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user?.id },
      include: {
        user: true,
      },
    })

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found' },
        { status: 404 }
      )
    }

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Verify invoice belongs to patient
    if (invoice.patientId !== patient.id) {
      return NextResponse.json(
        { message: 'Unauthorized access to this invoice' },
        { status: 403 }
      )
    }

    if (invoice.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Invoice is not pending payment' },
        { status: 400 }
      )
    }

    // Get base URL
    const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session
    // Note: Stripe test mode doesn't support TND, using USD for testing
    // In production with live mode, you can use TND if available
    const currency = 'usd' // Change to 'tnd' in production if supported
    const amountInCents = Math.round(Number(invoice.amount) * 100) // Assuming invoice.amount is in TND, convert to cents
    
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Facture #${invoice.id.slice(0, 8)}`,
              description: `Paiement de facture médicale - ${Number(invoice.amount).toFixed(2)} TND`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/patient/invoices?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/patient/invoices?payment=cancelled`,
      client_reference_id: invoice.id,
      customer_email: invoice.patient.user.email,
      metadata: {
        invoiceId: invoice.id,
        patientId: patient.id,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json(
      { message: error.message || 'Error processing payment' },
      { status: 500 }
    )
  }
}

