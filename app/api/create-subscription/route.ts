import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { PRICING_PLANS } from '@/lib/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType } = await request.json()

    // Validate plan type for subscriptions
    if (!planType || !['unlimited'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid subscription plan type' }, { status: 400 })
    }

    const plan = PRICING_PLANS[planType as keyof typeof PRICING_PLANS]
    const priceId = STRIPE_PRICE_IDS[planType as keyof typeof STRIPE_PRICE_IDS]

    // Create Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/?payment=cancel`,
      metadata: {
        userId: userId,
        planType: planType,
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      amount: plan.price,
      planType: planType,
      planName: plan.name,
      description: plan.description
    })

  } catch (error) {
    console.error('Error creating subscription checkout:', error)
    return NextResponse.json({ error: 'Failed to create subscription checkout' }, { status: 500 })
  }
} 