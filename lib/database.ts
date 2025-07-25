import { supabase, SavedDocument, isLocalMode } from './supabase'

// Generate a simple hash for content duplicate detection
function generateContentHash(summary: string, questions: string[]): string {
  const content = `${summary.trim()}-${questions.join('|').trim()}`
  // Simple hash function - in production you might want to use a more robust hashing library
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

// Check for duplicate documents based on content hash
export async function checkForDuplicateDocument(
  summary: string, 
  questions: string[], 
  userId?: string
): Promise<SavedDocument | null> {
  const contentHash = generateContentHash(summary, questions)
  console.log('🔍 Checking for duplicate with hash:', contentHash)
  console.log('🔍 User ID:', userId)
  
  // If in local mode, check localStorage
  if (isLocalMode) {
    console.log('🔍 Checking localStorage for duplicates...')
    const saved = localStorage.getItem('studyhelper-documents')
    if (saved) {
      try {
        const documents = JSON.parse(saved)
        const duplicate = documents.find((doc: SavedDocument) => 
          doc.content_hash === contentHash && 
          (!userId || doc.user_id === userId)
        )
        console.log('🔍 Duplicate found in localStorage:', duplicate ? 'YES' : 'NO')
        return duplicate || null
      } catch (error) {
        console.error('Error checking for duplicates in localStorage:', error)
        return null
      }
    }
    return null
  }

  // Use Supabase for cloud storage
  try {
    console.log('🔍 Checking Supabase for duplicates...')
    let query = supabase
      .from('documents')
      .select('*')
      .eq('content_hash', contentHash)

    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.is('user_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error checking for duplicates:', error)
      return null
    }

    console.log('🔍 Duplicate found in Supabase:', data && data.length > 0 ? 'YES' : 'NO')
    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error checking for duplicates:', error)
    return null
  }
}

// User usage tracking types
export interface UserUsage {
  id: string
  user_id: string
  uses_remaining: number
  plan_type: 'free' | 'individual' | 'starter' | 'pro' | 'unlimited'
  plan_expires_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

// Pricing plans
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    uses: 3,
    price: 0,
    description: '3 free uses to try the app'
  },
  individual: {
    name: 'Individual Uses',
    uses: 5,
    price: 5,
    description: '5 uses for just R$ 5'
  },
  starter: {
    name: 'Starter Pack',
    uses: 20,
    price: 15,
    description: '20 additional uses'
  },
  pro: {
    name: 'Pro Pack',
    uses: 100,
    price: 30,
    description: '100 uses for heavy users'
  },
  unlimited: {
    name: 'Unlimited Monthly',
    uses: -1, // -1 means unlimited
    price: 100,
    description: 'Unlimited uses for 30 days'
  }
} as const

// Save a document to Supabase or localStorage
export async function saveDocument(document: Omit<SavedDocument, 'id' | 'created_at' | 'updated_at'>): Promise<SavedDocument | null> {
  console.log('🔍 saveDocument called with:', document)
  console.log('🔍 isLocalMode:', isLocalMode)
  
  // Generate content hash for duplicate detection
  const contentHash = generateContentHash(document.summary, document.questions)
  
  // If in local mode, use localStorage
  if (isLocalMode) {
    console.warn('⚠️  Saving to localStorage (local mode)')
    const id = Date.now().toString()
    const savedDoc: SavedDocument = {
      ...document,
      content_hash: contentHash,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('studyhelper-documents') || '[]')
    existing.unshift(savedDoc)
    localStorage.setItem('studyhelper-documents', JSON.stringify(existing))
    
    console.log('✅ Successfully saved to localStorage')
    return savedDoc
  }

  // Use Supabase for cloud storage
  try {
    console.log('🔍 Attempting to save to Supabase...')
    const { data, error } = await supabase
      .from('documents')
      .insert({
        file_name: document.file_name,
        summary: document.summary,
        questions: document.questions,
        content_hash: contentHash,
        user_id: document.user_id || null
      })
      .select()
      .single()

    console.log('🔍 Supabase response:', { data, error })

    if (error) {
      console.error('❌ Error saving document to Supabase:', error)
      return null
    }

    console.log('✅ Successfully saved to Supabase')
    return data
  } catch (error) {
    console.error('❌ Exception saving document to Supabase:', error)
    return null
  }
}

// Get all documents for a user (or all if no user)
export async function getDocuments(userId?: string): Promise<SavedDocument[]> {
  // If in local mode, use localStorage
  if (isLocalMode) {
    console.warn('⚠️  Loading from localStorage (local mode)')
    const saved = localStorage.getItem('studyhelper-documents')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing localStorage documents:', error)
        return []
      }
    }
    return []
  }

  // Use Supabase for cloud storage
  try {
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.is('user_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching documents:', error)
    return []
  }
}

// Delete a document
export async function deleteDocument(id: string): Promise<boolean> {
  // If in local mode, use localStorage
  if (isLocalMode) {
    console.warn('⚠️  Deleting from localStorage (local mode)')
    const saved = localStorage.getItem('studyhelper-documents')
    if (saved) {
      try {
        const documents = JSON.parse(saved)
        const filtered = documents.filter((doc: SavedDocument) => doc.id !== id)
        localStorage.setItem('studyhelper-documents', JSON.stringify(filtered))
        return true
      } catch (error) {
        console.error('Error deleting from localStorage:', error)
        return false
      }
    }
    return false
  }

  // Use Supabase for cloud storage
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting document:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting document:', error)
    return false
  }
}

// Update a document
export async function updateDocument(id: string, updates: Partial<SavedDocument>): Promise<SavedDocument | null> {
  // If in local mode, use localStorage
  if (isLocalMode) {
    console.warn('⚠️  Updating in localStorage (local mode)')
    const saved = localStorage.getItem('studyhelper-documents')
    if (saved) {
      try {
        const documents = JSON.parse(saved)
        const index = documents.findIndex((doc: SavedDocument) => doc.id === id)
        if (index !== -1) {
          documents[index] = { ...documents[index], ...updates, updated_at: new Date().toISOString() }
          localStorage.setItem('studyhelper-documents', JSON.stringify(documents))
          return documents[index]
        }
      } catch (error) {
        console.error('Error updating localStorage:', error)
        return null
      }
    }
    return null
  }

  // Use Supabase for cloud storage
  try {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating document:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating document:', error)
    return null
  }
}

// Note: Authentication will be handled by Clerk
// These functions are removed since we're using Clerk for auth
// The database functions above are ready to work with Clerk user IDs 

// User usage management functions
export async function getUserUsage(userId: string): Promise<UserUsage | null> {
  if (isLocalMode) {
    console.warn('⚠️  Usage tracking not available in local mode')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching user usage:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching user usage:', error)
    return null
  }
}

export async function createUserUsage(userId: string): Promise<UserUsage | null> {
  if (isLocalMode) {
    console.warn('⚠️  Usage tracking not available in local mode')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('user_usage')
      .insert({
        user_id: userId,
        uses_remaining: PRICING_PLANS.free.uses,
        plan_type: 'free',
        plan_expires_at: null,
        stripe_customer_id: null,
        stripe_subscription_id: null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user usage:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating user usage:', error)
    return null
  }
}

export async function updateUserUsage(userId: string, updates: Partial<UserUsage>): Promise<UserUsage | null> {
  if (isLocalMode) {
    console.warn('⚠️  Usage tracking not available in local mode')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('user_usage')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user usage:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating user usage:', error)
    return null
  }
}

export async function decrementUserUsage(userId: string): Promise<UserUsage | null> {
  console.log(`💳 [USAGE] decrementUserUsage called for user: ${userId}`)
  
  if (isLocalMode) {
    console.warn('⚠️ [USAGE] Usage tracking not available in local mode')
    return null
  }

  try {
    // Get current usage
    console.log(`💳 [USAGE] Getting current usage for user: ${userId}`)
    const currentUsage = await getUserUsage(userId)
    if (!currentUsage) {
      console.error(`❌ [USAGE] No usage record found for user: ${userId}`)
      return null
    }

    console.log(`💳 [USAGE] Current usage for ${userId}:`, {
      uses_remaining: currentUsage.uses_remaining,
      plan_type: currentUsage.plan_type,
      plan_expires_at: currentUsage.plan_expires_at
    })

    // Check if unlimited or if plan has expired
    if (currentUsage.plan_type === 'unlimited') {
      const expiresAt = currentUsage.plan_expires_at
      if (expiresAt && new Date(expiresAt) < new Date()) {
        console.log(`⏰ [USAGE] Unlimited plan expired for ${userId}, resetting to free`)
        // Unlimited plan has expired, reset to free
        return await updateUserUsage(userId, {
          uses_remaining: 0,
          plan_type: 'free',
          plan_expires_at: null
        })
      }
      // Still unlimited and not expired
      console.log(`♾️ [USAGE] User ${userId} has unlimited plan, no decrement needed`)
      return currentUsage
    }

    // Decrement uses for non-unlimited plans
    const newUsesRemaining = Math.max(0, currentUsage.uses_remaining - 1)
    
    console.log(`💳 [USAGE] Decrementing usage for ${userId}: ${currentUsage.uses_remaining} → ${newUsesRemaining}`)
    
    const result = await updateUserUsage(userId, {
      uses_remaining: newUsesRemaining
    })
    
    if (result) {
      console.log(`✅ [USAGE] Successfully decremented usage for ${userId}: ${result.uses_remaining} credits remaining`)
    } else {
      console.error(`❌ [USAGE] Failed to update usage for user: ${userId}`)
    }
    
    return result
  } catch (error) {
    console.error(`❌ [USAGE] Error decrementing user usage for ${userId}:`, error)
    return null
  }
}

export async function canUserMakeRequest(userId: string): Promise<{ canMake: boolean; usage: UserUsage | null }> {
  if (isLocalMode) {
    console.warn('⚠️  Usage tracking not available in local mode')
    return { canMake: true, usage: null }
  }

  try {
    let usage = await getUserUsage(userId)
    
    // Create usage record if it doesn't exist
    if (!usage) {
      usage = await createUserUsage(userId)
      if (!usage) {
        return { canMake: false, usage: null }
      }
    }

    // Check if unlimited and not expired
    if (usage.plan_type === 'unlimited') {
      const expiresAt = usage.plan_expires_at
      if (!expiresAt || new Date(expiresAt) > new Date()) {
        return { canMake: true, usage }
      }
      
      // Unlimited plan has expired, reset to free
      usage = await updateUserUsage(userId, {
        uses_remaining: 0,
        plan_type: 'free',
        plan_expires_at: null
      })
    }

    // Check if user has remaining uses
    const canMake = usage ? usage.uses_remaining > 0 : false
    
    return { canMake, usage }
  } catch (error) {
    console.error('Error checking user usage:', error)
    return { canMake: false, usage: null }
  }
} 