// Free trial management using localStorage
const FREE_TRIAL_KEY = 'studyhelper-free-trial-used'

export interface FreeTrialStatus {
  hasUsedFreeTrial: boolean
  usedAt?: string
}

/**
 * Check if the current user has used their free trial
 */
export function checkFreeTrialStatus(): FreeTrialStatus {
  if (typeof window === 'undefined') {
    return { hasUsedFreeTrial: false }
  }

  try {
    const stored = localStorage.getItem(FREE_TRIAL_KEY)
    if (!stored) {
      return { hasUsedFreeTrial: false }
    }

    const data = JSON.parse(stored)
    return {
      hasUsedFreeTrial: true,
      usedAt: data.usedAt || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error checking free trial status:', error)
    return { hasUsedFreeTrial: false }
  }
}

/**
 * Mark that the free trial has been used
 */
export function markFreeTrialUsed(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const data = {
      usedAt: new Date().toISOString()
    }
    localStorage.setItem(FREE_TRIAL_KEY, JSON.stringify(data))
    console.log('✅ Free trial marked as used')
  } catch (error) {
    console.error('Error marking free trial as used:', error)
  }
}

/**
 * Clear the free trial flag (when user signs up)
 */
export function clearFreeTrialFlag(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(FREE_TRIAL_KEY)
    console.log('✅ Free trial flag cleared (user signed up)')
  } catch (error) {
    console.error('Error clearing free trial flag:', error)
  }
}

/**
 * Check if user can use free trial (not logged in and hasn't used it yet)
 */
export function canUseFreeTrial(isSignedIn: boolean): boolean {
  if (isSignedIn) {
    return false // Logged in users use their account credits
  }

  const status = checkFreeTrialStatus()
  return !status.hasUsedFreeTrial
} 