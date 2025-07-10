import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { PRICING_PLANS } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const plan = PRICING_PLANS.unlimited

    // Create Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_IDS.unlimited,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/?payment=cancel`,
      metadata: {
        userId: userId,
        planType: 'unlimited',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      amount: plan.price,
      planType: 'unlimited',
      planName: plan.name,
      description: plan.description
    })

  } catch (error) {
    console.error('Error creating subscription checkout:', error)
    return NextResponse.json({ error: 'Failed to create subscription checkout' }, { status: 500 })
  }
} 