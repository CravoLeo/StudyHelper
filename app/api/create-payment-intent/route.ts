import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { PRICING_PLANS } from '@/lib/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Stripe Secret Key exists:', !!process.env.STRIPE_SECRET_KEY)
    console.log('🔍 Stripe Secret Key starts with sk_live:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live'))

    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType } = await request.json()

    // Validate plan type
    if (!planType || !['individual', 'starter', 'pro'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Get plan details
    const plan = PRICING_PLANS[planType as keyof typeof PRICING_PLANS]
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Get the price ID from environment variables
    const priceId = STRIPE_PRICE_IDS[planType as keyof typeof STRIPE_PRICE_IDS]
    
    console.log('🔍 Using price ID:', priceId, 'for plan:', planType)

    // Create Checkout Session using pre-created price IDs
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
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
      uses: plan.uses
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
} 