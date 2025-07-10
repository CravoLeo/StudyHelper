import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { getUserUsage } from '@/lib/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user usage to find stripe_customer_id
    const userUsage = await getUserUsage(userId)
    
    if (!userUsage?.stripe_customer_id) {
      return NextResponse.json({ 
        error: 'No active subscription found' 
      }, { status: 404 })
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userUsage.stripe_customer_id,
      return_url: `${request.headers.get('origin')}/dashboard`,
    })

    return NextResponse.json({
      url: session.url
    })

  } catch (error) {
    console.error('Error creating customer portal session:', error)
    return NextResponse.json({ 
      error: 'Failed to create customer portal session' 
    }, { status: 500 })
  }
} 