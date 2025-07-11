import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Test basic authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Test request parsing
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Test environment variable access
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Test OpenAI import and basic functionality
    try {
      const OpenAI = require('openai')
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      // Simple test call
      const testResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "API test successful" in exactly those words.'
          }
        ],
        max_tokens: 10,
        temperature: 0,
      })

      const testResult = testResponse.choices[0]?.message?.content || 'No response'

      return NextResponse.json({
        success: true,
        userId,
        textLength: text.length,
        openaiTest: testResult,
        timestamp: new Date().toISOString()
      })

    } catch (openaiError) {
      console.error('OpenAI Error:', openaiError)
      return NextResponse.json({ 
        error: 'OpenAI integration failed', 
        details: openaiError.message 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test AI API error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 })
  }
} 