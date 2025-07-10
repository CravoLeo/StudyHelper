import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSubscription, getOrCreateStripeCustomer, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { PRICING_PLANS } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user email from Clerk (you'll need to import this)
    // For now, we'll use a placeholder - you should get this from Clerk
    const userEmail = `user-${userId}@example.com` // Replace with actual email from Clerk

    // Create or get Stripe customer
    const customerId = await getOrCreateStripeCustomer(userId, userEmail)

    // Create subscription for unlimited plan
    const subscription = await createSubscription(customerId, STRIPE_PRICE_IDS.unlimited)

    const plan = PRICING_PLANS.unlimited

    // Extract client secret from the expanded invoice
    const latestInvoice = subscription.latest_invoice as any
    const clientSecret = latestInvoice?.payment_intent?.client_secret || null

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
      amount: plan.price,
      planType: 'unlimited',
      planName: plan.name,
      description: plan.description
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
} 