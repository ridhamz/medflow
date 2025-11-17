import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

// Disable body parsing for webhook
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { message: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { message: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { message: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  console.log(`Received Stripe webhook event: ${event.type}`)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    console.log('Checkout session completed:', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      metadata: session.metadata,
    })

    // Only update if payment was successful
    if (session.payment_status === 'paid') {
      try {
        // Get invoice ID from metadata
        const invoiceId = session.metadata?.invoiceId || session.client_reference_id

        if (!invoiceId) {
          console.error('No invoice ID in session metadata or client_reference_id')
          return NextResponse.json(
            { message: 'No invoice ID found' },
            { status: 400 }
          )
        }

        // Check if invoice exists and is still pending
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
        })

        if (!invoice) {
          console.error(`Invoice ${invoiceId} not found`)
          return NextResponse.json(
            { message: 'Invoice not found' },
            { status: 404 }
          )
        }

        if (invoice.status === 'PAID') {
          console.log(`Invoice ${invoiceId} is already marked as paid`)
          return NextResponse.json({ received: true })
        }

        // Update invoice status
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            stripePaymentId: session.payment_intent as string || session.id,
          },
        })

        console.log(`✅ Invoice ${invoiceId} marked as paid successfully`)
      } catch (error: any) {
        console.error('Error updating invoice:', error)
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        })
        // Don't return error to Stripe, just log it
        // Stripe will retry the webhook
      }
    } else {
      console.log(`Payment status is ${session.payment_status}, not updating invoice`)
    }
  } else if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log('PaymentIntent succeeded:', paymentIntent.id)
    
    // Try to find invoice by payment intent ID
    try {
      const invoice = await prisma.invoice.findFirst({
        where: {
          stripePaymentId: paymentIntent.id,
        },
      })

      if (invoice && invoice.status === 'PENDING') {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        })
        console.log(`✅ Invoice ${invoice.id} marked as paid via payment_intent.succeeded`)
      }
    } catch (error: any) {
      console.error('Error updating invoice from payment_intent:', error)
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

