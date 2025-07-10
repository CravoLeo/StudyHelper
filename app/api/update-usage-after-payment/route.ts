import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { updateUserUsage, getUserUsage, PRICING_PLANS } from '@/lib/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    console.log('🔄 Checking payment session:', sessionId)

    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    // Check if this is for the current user
    if (session.metadata?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const planType = session.metadata?.planType

    if (!planType) {
      return NextResponse.json({ error: 'Plan type not found' }, { status: 400 })
    }

    console.log(`✅ Processing usage update for user ${userId} with plan ${planType}`)

    // Get current usage to add to existing uses
    const currentUsage = await getUserUsage(userId)
    const currentUses = currentUsage?.uses_remaining || 0

    // Update user usage based on plan type - ADD to existing uses
    if (planType === 'individual') {
      // Individual purchases just add uses, don't change plan type
      const newUses = currentUses + PRICING_PLANS.individual.uses
      await updateUserUsage(userId, {
        uses_remaining: newUses
      })
      console.log(`✅ Added ${PRICING_PLANS.individual.uses} uses to existing ${currentUses} = ${newUses} total`)
    } else if (planType === 'starter') {
      // Starter is a one-time purchase - add uses
      const newUses = currentUses + PRICING_PLANS.starter.uses
      await updateUserUsage(userId, {
        uses_remaining: newUses,
        plan_type: 'starter'
      })
      console.log(`✅ Added ${PRICING_PLANS.starter.uses} uses to existing ${currentUses} = ${newUses} total`)
    } else if (planType === 'pro') {
      const newUses = currentUses + PRICING_PLANS.pro.uses
      await updateUserUsage(userId, {
        uses_remaining: newUses,
        plan_type: 'pro'
      })
      console.log(`✅ Added ${PRICING_PLANS.pro.uses} uses to existing ${currentUses} = ${newUses} total`)
    } else if (planType === 'unlimited') {
      // Set unlimited plan for 30 days
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      await updateUserUsage(userId, {
        uses_remaining: -1, // Unlimited
        plan_type: 'unlimited',
        plan_expires_at: expiresAt.toISOString(),
        stripe_subscription_id: session.subscription as string
      })
      console.log(`✅ Set unlimited plan until ${expiresAt}`)
    }

    console.log(`🎉 Successfully updated usage for user ${userId} with plan ${planType}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Usage updated successfully',
      planType: planType 
    })

  } catch (error) {
    console.error('Error updating usage after payment:', error)
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
  }
} 