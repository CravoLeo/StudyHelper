'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Crown, User, Calendar, RefreshCw, CreditCard } from 'lucide-react'
import { PRICING_PLANS } from '@/lib/database'
import PricingModal from '@/components/PricingModal'

interface UserUsage {
  uses_remaining: number
  plan_type: 'free' | 'starter' | 'pro' | 'unlimited'
  plan_expires_at: string | null
  created_at: string
}

export default function Dashboard() {
  const { user } = useUser()
  const [usage, setUsage] = useState<UserUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPricingModal, setShowPricingModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUsage()
    }
  }, [user])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/user-usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUsage = () => {
    setLoading(true)
    fetchUsage()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h1>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const currentPlan = usage ? PRICING_PLANS[usage.plan_type] : PRICING_PLANS.free
  const isUnlimited = usage?.plan_type === 'unlimited'
  const planExpired = usage?.plan_expires_at && new Date(usage.plan_expires_at) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
          <button
            onClick={refreshUsage}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            title="Refresh usage data"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="text-yellow-400" size={24} />
              <h2 className="text-xl font-bold">Current Plan</h2>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-white">
                  {isUnlimited ? 'Unlimited Plan' : 'Usage Credits'}
                </span>
                {isUnlimited && (
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-gray-400 mb-4">
                {isUnlimited ? currentPlan.description : 'Purchase usage credits to continue using the app'}
              </p>

              {/* Usage Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Uses Remaining:</span>
                  <span className="font-bold text-lg">
                    {usage?.uses_remaining === -1 ? (
                      <span className="text-green-400">Unlimited</span>
                    ) : (
                      <span className={usage?.uses_remaining === 0 ? 'text-red-400' : 'text-green-400'}>
                        {usage?.uses_remaining || 0}
                      </span>
                    )}
                  </span>
                </div>

                {usage?.plan_expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Plan Expires:</span>
                    <span className={`font-medium ${planExpired ? 'text-red-400' : 'text-blue-400'}`}>
                      {new Date(usage.plan_expires_at).toLocaleDateString()}
                      {planExpired && ' (Expired)'}
                    </span>
                  </div>
                )}

                {usage?.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Member Since:</span>
                    <span className="text-gray-400">
                      {new Date(usage.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPricingModal(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                {isUnlimited ? 'Manage Plan' : 'Buy Credits'}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Back to App
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="font-bold mb-2 text-green-400">Plan Benefits</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  AI-powered summaries
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  PDF & image support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Study questions generation
                </li>
                {isUnlimited && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Priority processing
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="font-bold mb-2 text-blue-400">Usage Tips</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Upload clear, high-quality documents</li>
                <li>• Use PDF format for best results</li>
                <li>• Check your usage regularly</li>
                <li>• Upgrade for unlimited access</li>
              </ul>
            </div>

            {(usage?.uses_remaining === 0 || planExpired) && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
                <h3 className="font-bold mb-2 text-red-400">Action Required</h3>
                <p className="text-sm text-gray-300 mb-3">
                  {planExpired ? 'Your plan has expired.' : 'You\'ve used all your credits.'}
                  {' '}Upgrade to continue using the app.
                </p>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentUsage={usage ? {
          uses_remaining: usage.uses_remaining,
          plan_type: usage.plan_type
        } : undefined}
        onPaymentSuccess={() => {
          setShowPricingModal(false)
          refreshUsage()
        }}
      />
    </div>
  )
} 