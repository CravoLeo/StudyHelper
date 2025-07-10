import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { PRICING_PLANS } from '@/lib/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Creating subscription checkout...')
    
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      console.error('❌ Stripe not configured - missing or placeholder secret key')
      return NextResponse.json({ 
        error: 'Payment system is currently unavailable. Please try again later.' 
      }, { status: 503 })
    }

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

    console.log('🔍 Using price ID:', priceId, 'for subscription plan:', planType)

    // Validate price ID
    if (!priceId || priceId.includes('placeholder')) {
      console.error('❌ Invalid price ID for subscription plan:', planType, 'priceId:', priceId)
      return NextResponse.json({ 
        error: 'Payment configuration error. Please contact support.' 
      }, { status: 503 })
    }

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

    console.log('✅ Subscription checkout session created successfully:', session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      amount: plan.price,
      planType: planType,
      planName: plan.name,
      description: plan.description
    })

  } catch (error) {
    console.error('❌ Error creating subscription checkout:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('No such price')) {
        return NextResponse.json({ 
          error: 'Invalid price configuration. Please contact support.' 
        }, { status: 503 })
      }
      if (error.message.includes('Invalid API Key')) {
        return NextResponse.json({ 
          error: 'Payment system configuration error. Please contact support.' 
        }, { status: 503 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create subscription checkout. Please try again.' 
    }, { status: 500 })
  }
} 