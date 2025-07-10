import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { getUserUsage, updateUserUsage } from '@/lib/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Cancelling subscription for user:', userId)

    // Get user usage to find subscription ID
    const userUsage = await getUserUsage(userId)
    
    if (!userUsage?.stripe_subscription_id) {
      console.error('❌ No subscription found for user:', userId)
      return NextResponse.json({ 
        error: 'No active subscription found.' 
      }, { status: 404 })
    }

    console.log('🔍 Checking subscription status:', userUsage.stripe_subscription_id)

    // First check if subscription is already cancelled
    const currentSubscription = await stripe.subscriptions.retrieve(userUsage.stripe_subscription_id)
    
    if (currentSubscription.cancel_at_period_end) {
      console.log('⚠️ Subscription already cancelled for user:', userId)
      return NextResponse.json({ 
        error: 'Subscription is already cancelled.',
        is_cancelled: true,
        current_period_end: (currentSubscription as any).current_period_end ? new Date((currentSubscription as any).current_period_end * 1000).toISOString() : null
      }, { status: 400 })
    }

    console.log('🔍 Cancelling subscription:', userUsage.stripe_subscription_id)

    // Cancel the subscription at the end of the billing period
    const cancelledSubscription = await stripe.subscriptions.update(
      userUsage.stripe_subscription_id,
      {
        cancel_at_period_end: true
      }
    )

    console.log('✅ Subscription cancelled successfully:', cancelledSubscription.id)
    console.log('✅ Cancel at period end:', cancelledSubscription.cancel_at_period_end)
    console.log('✅ Current period end:', (cancelledSubscription as any).current_period_end)

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully. Your unlimited access will continue until the end of your billing period.',
      is_cancelled: true,
      current_period_end: (cancelledSubscription as any).current_period_end ? new Date((cancelledSubscription as any).current_period_end * 1000).toISOString() : null,
      cancel_at: (cancelledSubscription as any).cancel_at ? new Date((cancelledSubscription as any).cancel_at * 1000).toISOString() : null
    })

  } catch (error) {
    console.error('❌ Error cancelling subscription:', error)
    return NextResponse.json({ 
      error: 'Failed to cancel subscription. Please try again.' 
    }, { status: 500 })
  }
}

// GET endpoint to check cancellation status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Fetching subscription status for user:', userId)

    const userUsage = await getUserUsage(userId)
    
    if (!userUsage?.stripe_subscription_id) {
      console.log('⚠️ No subscription found for user:', userId)
      return NextResponse.json({ 
        has_subscription: false 
      })
    }

    console.log('🔍 Found subscription ID:', userUsage.stripe_subscription_id)

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(userUsage.stripe_subscription_id)

    console.log('🔍 Subscription details:')
    console.log('  - cancel_at_period_end:', subscription.cancel_at_period_end)
    console.log('  - current_period_end:', (subscription as any).current_period_end)
    console.log('  - cancel_at:', (subscription as any).cancel_at)

    const response = {
      has_subscription: true,
      is_cancelled: subscription.cancel_at_period_end,
      current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
      cancel_at: (subscription as any).cancel_at ? new Date((subscription as any).cancel_at * 1000).toISOString() : null
    }

    console.log('✅ Returning subscription status:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error checking subscription status:', error)
    return NextResponse.json({ 
      error: 'Failed to check subscription status.' 
    }, { status: 500 })
  }
} 