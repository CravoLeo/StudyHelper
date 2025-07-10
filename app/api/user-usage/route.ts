import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserUsage, createUserUsage } from '@/lib/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let usage = await getUserUsage(userId)
    
    // Create usage record if it doesn't exist
    if (!usage) {
      usage = await createUserUsage(userId)
    }

    return NextResponse.json(usage)

  } catch (error) {
    console.error('Error fetching user usage:', error)
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
  }
} 