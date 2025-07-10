import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createPaymentIntent, getOrCreateStripeCustomer } from '@/lib/stripe'
import { PRICING_PLANS } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType } = await request.json()

    // Validate plan type
    if (!planType || !['starter', 'pro'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Get plan details
    const plan = PRICING_PLANS[planType as keyof typeof PRICING_PLANS]
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Get user email from Clerk (you'll need to import this)
    // For now, we'll use a placeholder - you should get this from Clerk
    const userEmail = `user-${userId}@example.com` // Replace with actual email from Clerk

    // Create or get Stripe customer
    const customerId = await getOrCreateStripeCustomer(userId, userEmail)

    // Create payment intent
    const paymentIntent = await createPaymentIntent(customerId, plan.price, planType)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: plan.price,
      planType: planType,
      planName: plan.name,
      uses: plan.uses
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
} 