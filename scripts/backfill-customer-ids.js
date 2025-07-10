const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build', {
  typescript: true,
})

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function backfillCustomerIds() {
  try {
    console.log('🔍 Starting customer ID backfill process...')
    
    // Check if environment variables are set
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      console.error('❌ STRIPE_SECRET_KEY not configured')
      return
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase environment variables not configured')
      return
    }
    
    // Get all users with subscriptions but no customer ID
    const { data: users, error } = await supabase
      .from('user_usage')
      .select('*')
      .not('stripe_subscription_id', 'is', null)
      .is('stripe_customer_id', null)
    
    if (error) {
      console.error('❌ Error fetching users:', error)
      return
    }
    
    console.log(`🔍 Found ${users.length} users with subscriptions but no customer ID`)
    
    if (users.length === 0) {
      console.log('✅ No users need customer ID backfill')
      return
    }
    
    for (const user of users) {
      try {
        console.log(`🔍 Processing user: ${user.user_id}`)
        
        // Get customer ID from subscription
        const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id)
        const customerId = subscription.customer
        
        console.log(`🔍 Found customer ID: ${customerId}`)
        
        // Update the database
        const { error: updateError } = await supabase
          .from('user_usage')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user.user_id)
        
        if (updateError) {
          console.error(`❌ Error updating user ${user.user_id}:`, updateError)
        } else {
          console.log(`✅ Updated user ${user.user_id} with customer ID ${customerId}`)
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.user_id}:`, error)
      }
    }
    
    console.log('✅ Customer ID backfill process completed!')
    
  } catch (error) {
    console.error('❌ Error during backfill process:', error)
  }
}

// Run the backfill if this script is called directly
if (require.main === module) {
  backfillCustomerIds()
}

module.exports = { backfillCustomerIds } 