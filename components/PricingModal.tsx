'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { X, Check, Zap, Star, Crown } from 'lucide-react'
import { PRICING_PLANS } from '@/lib/database'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsage?: {
    uses_remaining: number
    plan_type: string
  }
  onPaymentSuccess?: () => void
}

export default function PricingModal({ isOpen, onClose, currentUsage, onPaymentSuccess }: PricingModalProps) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const handleManageSubscription = async () => {
    try {
      console.log('🔍 Opening customer portal...')
      
      const response = await fetch('/api/create-customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      console.log('🔍 Portal response:', { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer portal session')
      }

      console.log('✅ Redirecting to portal:', data.url)
      
      // Redirect to Stripe customer portal
      window.location.href = data.url
    } catch (error) {
      console.error('❌ Error opening customer portal:', error)
      alert(`Failed to open subscription management: ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  const handleUpgrade = async (planType: 'individual' | 'starter' | 'pro' | 'unlimited') => {
    setLoading(planType)
    
    try {
      if (planType === 'unlimited') {
        // Handle subscription (only unlimited is a subscription)
        const response = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planType }),
        })

        const data = await response.json()
        
        // Check if the response is successful
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`)
        }

        const { sessionId, url } = data
        
        if (!sessionId) {
          throw new Error('Failed to create subscription - no session ID received')
        }

        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        
        if (!stripe) {
          throw new Error('Stripe not loaded')
        }

        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
          sessionId: sessionId,
        })

        if (error) {
          console.error('Payment failed:', error)
          alert('Payment failed: ' + error.message)
        }
      } else {
        // Handle one-time payment (individual, starter, and pro plans)
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planType }),
        })

        const data = await response.json()
        
        // Check if the response is successful
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`)
        }

        const { sessionId, url } = data
        
        if (!sessionId) {
          throw new Error('Failed to create checkout session - no session ID received')
        }

        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        
        if (!stripe) {
          throw new Error('Stripe not loaded')
        }

        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
          sessionId: sessionId,
        })

        if (error) {
          console.error('Payment failed:', error)
          alert('Payment failed: ' + error.message)
        }
      }
    } catch (error) {
      console.error('Error upgrading plan:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Upgrade Your Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {currentUsage && (
          <div className="mb-8 p-4 bg-gray-800/50 rounded-lg">
            {/* Debug info */}
            <div className="mb-2 text-xs text-gray-500">
              DEBUG: plan_type = "{currentUsage.plan_type}", uses = {currentUsage.uses_remaining}
            </div>
            
            {currentUsage.plan_type === 'unlimited' ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      Current Plan: <span className="text-purple-400">Unlimited Plan</span>
                    </p>
                    <p className="text-gray-400">Unlimited uses remaining</p>
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Manage Subscription
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-white font-medium">Current Usage Credits</p>
                <p className="text-gray-400">
                  {currentUsage.uses_remaining} uses remaining
                </p>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-blue-500/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Zap className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{PRICING_PLANS.starter.name}</h3>
                <p className="text-gray-400 text-sm">{PRICING_PLANS.starter.description}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-2">
                ${PRICING_PLANS.starter.price}
              </div>
              <div className="text-gray-400">
                {PRICING_PLANS.starter.uses} additional uses
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-green-400" />
                Perfect for regular users
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-green-400" />
                PDF and image support
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-green-400" />
                AI-powered summaries
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-green-400" />
                Great value for money
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade('starter')}
              disabled={loading === 'starter'}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {loading === 'starter' ? 'Processing...' : 'Buy Now'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-yellow-500/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium">
              Best Value
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Star className="text-yellow-400" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{PRICING_PLANS.pro.name}</h3>
                <p className="text-gray-400 text-sm">{PRICING_PLANS.pro.description}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-2">
                ${PRICING_PLANS.pro.price}
              </div>
              <div className="text-gray-400">
                {PRICING_PLANS.pro.uses} uses - great value!
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-green-400" />
                Perfect for students & professionals
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-green-400" />
                Bulk usage at discounted rate
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-green-400" />
                All features included
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade('pro')}
              disabled={loading === 'pro'}
              className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {loading === 'pro' ? 'Processing...' : 'Upgrade Now'}
            </button>
          </div>

          {/* Unlimited Plan */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Crown className="text-purple-400" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{PRICING_PLANS.unlimited.name}</h3>
                <p className="text-gray-400 text-sm">{PRICING_PLANS.unlimited.description}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-2">
                ${PRICING_PLANS.unlimited.price}
              </div>
              <div className="text-gray-400">
                per month, unlimited uses
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-green-400" />
                Unlimited document processing
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-green-400" />
                Perfect for heavy users
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-green-400" />
                Cancel anytime
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade('unlimited')}
              disabled={loading === 'unlimited'}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {loading === 'unlimited' ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        </div>

        {/* OR Section - Individual Usage */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm font-medium">OR</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <Zap className="text-green-400" size={16} />
              </div>
              <h3 className="text-lg font-bold text-white">Buy Individual Uses</h3>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              Need just a few uses? Get {PRICING_PLANS.individual.uses} uses for ${PRICING_PLANS.individual.price} - perfect for quick tasks!
            </p>
            
            <button
              onClick={() => handleUpgrade('individual')}
              disabled={loading === 'individual'}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading === 'individual' ? 'Processing...' : `Buy ${PRICING_PLANS.individual.uses} Uses - $${PRICING_PLANS.individual.price}`}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>💳 Secure payment processed by Stripe</p>
          <p>🔒 Your data is safe and encrypted</p>
        </div>
      </div>
    </div>
  )
} 