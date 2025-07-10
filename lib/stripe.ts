import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Product IDs for different plans (you'll need to create these in Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  individual: process.env.STRIPE_INDIVIDUAL_PRICE_ID!,
  starter: process.env.STRIPE_STARTER_PRICE_ID!, // Now a subscription
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  unlimited: process.env.STRIPE_UNLIMITED_PRICE_ID!
} as const

// Helper function to create or retrieve a Stripe customer
export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  try {
    // First, try to find existing customer
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        userId: userId
      }
    })

    return customer.id
  } catch (error) {
    console.error('Error creating/retrieving Stripe customer:', error)
    throw error
  }
}

// Helper function to create a payment intent for one-time payments
export async function createPaymentIntent(customerId: string, amount: number, planType: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        planType: planType
      }
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

// Helper function to create a subscription for unlimited plan
export async function createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    })

    return subscription
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

// Helper function to cancel a subscription
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
} 