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

    console.log('🔍 Creating customer portal for user:', userId)

    // Get user usage to find stripe_customer_id
    const userUsage = await getUserUsage(userId)
    console.log('🔍 User usage:', userUsage)
    
    let customerId = userUsage?.stripe_customer_id
    
    // If no customer ID but we have a subscription ID, get customer ID from Stripe
    if (!customerId && userUsage?.stripe_subscription_id) {
      console.log('🔍 No customer ID found, but subscription ID exists. Getting customer ID from Stripe...')
      
      try {
        const subscription = await stripe.subscriptions.retrieve(userUsage.stripe_subscription_id)
        customerId = subscription.customer as string
        
        console.log('🔍 Found customer ID from subscription:', customerId)
        
        // Update the database with the customer ID for future use
        await updateUserUsage(userId, {
          stripe_customer_id: customerId
        })
        
        console.log('✅ Updated database with customer ID')
      } catch (error) {
        console.error('❌ Error retrieving subscription:', error)
        return NextResponse.json({ 
          error: 'Failed to retrieve subscription details. Please contact support.' 
        }, { status: 500 })
      }
    }
    
    // If still no customer ID, try to find it by searching Stripe customers by user metadata
    if (!customerId) {
      console.log('🔍 No customer ID found in database or subscription. Searching Stripe customers...')
      
      try {
        // Get user's email from Clerk
        const { createClerkClient } = await import('@clerk/nextjs/server')
        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY!,
        })
        
        const user = await clerkClient.users.getUser(userId)
        const userEmail = user.emailAddresses[0]?.emailAddress
        
        if (userEmail) {
          console.log('🔍 Found user email, searching for Stripe customer:', userEmail)
          
          // Search for customer by email
          const customers = await stripe.customers.list({
            email: userEmail,
            limit: 1
          })
          
          if (customers.data.length > 0) {
            customerId = customers.data[0].id
            console.log('🔍 Found customer ID from email search:', customerId)
            
            // Update the database with the customer ID for future use
            await updateUserUsage(userId, {
              stripe_customer_id: customerId
            })
            
            console.log('✅ Updated database with customer ID')
          }
        }
      } catch (error) {
        console.error('❌ Error searching for customer:', error)
        // Continue without customer ID - will show error below
      }
    }

    if (!customerId) {
      console.error('❌ No stripe_customer_id found for user:', userId)
      return NextResponse.json({ 
        error: 'No active subscription found. Please contact support.' 
      }, { status: 404 })
    }

    console.log('🔍 Using stripe_customer_id:', customerId)

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get('origin')}/dashboard`,
    })

    console.log('✅ Customer portal session created:', session.id)

    return NextResponse.json({
      url: session.url
    })

  } catch (error) {
    console.error('❌ Error creating customer portal session:', error)
    return NextResponse.json({ 
      error: 'Failed to create customer portal session. Please try again.' 
    }, { status: 500 })
  }
} 