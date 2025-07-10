import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { updateUserUsage, PRICING_PLANS } from '@/lib/database'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('Stripe webhook event:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const customerId = paymentIntent.customer as string
    const planType = paymentIntent.metadata.planType

    if (!customerId || !planType) {
      console.error('Missing customer ID or plan type in payment intent')
      return
    }

    // Get customer to find user ID
    const customer = await stripe.customers.retrieve(customerId)
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted')
      return
    }

    const userId = (customer as Stripe.Customer).metadata.userId
    if (!userId) {
      console.error('User ID not found in customer metadata')
      return
    }

    // Update user usage based on plan type
    if (planType === 'starter') {
      await updateUserUsage(userId, {
        uses_remaining: PRICING_PLANS.starter.uses,
        plan_type: 'starter'
      })
    } else if (planType === 'pro') {
      await updateUserUsage(userId, {
        uses_remaining: PRICING_PLANS.pro.uses,
        plan_type: 'pro'
      })
    }

    console.log(`Updated usage for user ${userId} with plan ${planType}`)

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = (invoice as any).subscription as string

    if (!customerId || !subscriptionId) {
      console.error('Missing customer ID or subscription ID in invoice')
      return
    }

    // Get customer to find user ID
    const customer = await stripe.customers.retrieve(customerId)
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted')
      return
    }

    const userId = (customer as Stripe.Customer).metadata.userId
    if (!userId) {
      console.error('User ID not found in customer metadata')
      return
    }

    // Set unlimited plan for 30 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await updateUserUsage(userId, {
      uses_remaining: -1, // Unlimited
      plan_type: 'unlimited',
      plan_expires_at: expiresAt.toISOString(),
      stripe_subscription_id: subscriptionId
    })

    console.log(`Updated usage for user ${userId} with unlimited plan until ${expiresAt}`)

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    if (!customerId) {
      console.error('Missing customer ID in subscription')
      return
    }

    // Get customer to find user ID
    const customer = await stripe.customers.retrieve(customerId)
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted')
      return
    }

    const userId = (customer as Stripe.Customer).metadata.userId
    if (!userId) {
      console.error('User ID not found in customer metadata')
      return
    }

    // Reset to free plan
    await updateUserUsage(userId, {
      uses_remaining: 0,
      plan_type: 'free',
      plan_expires_at: null,
      stripe_subscription_id: null
    })

    console.log(`Reset user ${userId} to free plan after subscription cancellation`)

  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
} 