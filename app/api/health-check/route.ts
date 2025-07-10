import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    clerkPublic: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    openaiKey: !!process.env.OPENAI_API_KEY,
  })
} 