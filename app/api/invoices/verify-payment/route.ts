import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

// POST verify payment status from Stripe session
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (!stripeSession) {
      return NextResponse.json(
        { message: 'Stripe session not found' },
        { status: 404 }
      )
    }

    // Get invoice ID from metadata
    const invoiceId = stripeSession.metadata?.invoiceId || stripeSession.client_reference_id

    if (!invoiceId) {
      return NextResponse.json(
        { message: 'Invoice ID not found in session' },
        { status: 400 }
      )
    }

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    })

    if (!invoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    // If payment is successful and invoice is still pending, update it
    if (stripeSession.payment_status === 'paid' && invoice.status === 'PENDING') {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          stripePaymentId: stripeSession.payment_intent as string || stripeSession.id,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Invoice updated to PAID',
        invoice: {
          id: invoiceId,
          status: 'PAID',
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified',
      paymentStatus: stripeSession.payment_status,
      invoiceStatus: invoice.status,
    })
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { message: error.message || 'Error verifying payment' },
      { status: 500 }
    )
  }
}

