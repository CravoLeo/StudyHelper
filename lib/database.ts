import { supabase, SavedDocument, isLocalMode } from './supabase'

// User usage tracking types
export interface UserUsage {
  id: string
  user_id: string
  uses_remaining: number
  plan_type: 'free' | 'starter' | 'pro' | 'unlimited'
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
  starter: {
    name: 'Starter Pack',
    uses: 20,
    price: 5,
    description: '20 additional uses'
  },
  pro: {
    name: 'Pro Pack',
    uses: 100,
    price: 20,
    description: '100 uses for heavy users'
  },
  unlimited: {
    name: 'Unlimited Monthly',
    uses: -1, // -1 means unlimited
    price: 50,
    description: 'Unlimited uses for 30 days'
  }
} as const

// Save a document to Supabase or localStorage
export async function saveDocument(document: Omit<SavedDocument, 'id' | 'created_at' | 'updated_at'>): Promise<SavedDocument | null> {
  // If in local mode, use localStorage
  if (isLocalMode) {
    console.warn('⚠️  Saving to localStorage (local mode)')
    const id = Date.now().toString()
    const savedDoc: SavedDocument = {
      ...document,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('studyhelper-documents') || '[]')
    existing.unshift(savedDoc)
    localStorage.setItem('studyhelper-documents', JSON.stringify(existing))
    
    return savedDoc
  }

  // Use Supabase for cloud storage
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        file_name: document.file_name,
        summary: document.summary,
        questions: document.questions,
        demo_mode: document.demo_mode,
        user_id: document.user_id || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving document:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error saving document:', error)
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
  if (isLocalMode) {
    console.warn('⚠️  Usage tracking not available in local mode')
    return null
  }

  try {
    // Get current usage
    const currentUsage = await getUserUsage(userId)
    if (!currentUsage) {
      return null
    }

    // Check if unlimited or if plan has expired
    if (currentUsage.plan_type === 'unlimited') {
      const expiresAt = currentUsage.plan_expires_at
      if (expiresAt && new Date(expiresAt) < new Date()) {
        // Unlimited plan has expired, reset to free
        return await updateUserUsage(userId, {
          uses_remaining: 0,
          plan_type: 'free',
          plan_expires_at: null
        })
      }
      // Still unlimited and not expired
      return currentUsage
    }

    // Decrement uses for non-unlimited plans
    const newUsesRemaining = Math.max(0, currentUsage.uses_remaining - 1)
    
    return await updateUserUsage(userId, {
      uses_remaining: newUsesRemaining
    })
  } catch (error) {
    console.error('Error decrementing user usage:', error)
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