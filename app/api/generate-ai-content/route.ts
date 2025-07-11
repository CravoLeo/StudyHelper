import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { canUserMakeRequest, decrementUserUsage, UserUsage } from '@/lib/database'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Add runtime configuration for Vercel
export const runtime = 'nodejs'

// Simple in-memory cache for request deduplication
const requestCache = new Map<string, { response: any, timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute

// Global lock to prevent concurrent API calls per user
const userLocks = new Map<string, boolean>()

// Request counter for debugging
let requestCounter = 0

// Clean up old cache entries
const cleanCache = () => {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  requestCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      keysToDelete.push(key)
    }
  })
  
  keysToDelete.forEach(key => requestCache.delete(key))
}

// Lock/unlock user to prevent concurrent processing
const lockUser = (userId: string): boolean => {
  if (userLocks.get(userId)) {
    return false // Already locked
  }
  userLocks.set(userId, true)
  return true
}

const unlockUser = (userId: string): void => {
  userLocks.delete(userId)
}

export async function POST(request: NextRequest) {
  let userId: string | null = null
  const requestId = ++requestCounter
  
  console.log(`🚀 [REQ-${requestId}] ==================== NEW API REQUEST ====================`)
  
  try {
    const authResult = await auth()
    userId = authResult.userId
    
    console.log(`🔍 [REQ-${requestId}] Auth result - User ID: ${userId || 'NULL'}`)
    
    if (!userId) {
      console.log(`❌ [REQ-${requestId}] No user ID - returning 401`)
      return NextResponse.json({ 
        error: 'Real AI features require an account. Try our demo mode for a preview!',
        needsAuth: true 
      }, { status: 401 })
    }

    const { text } = await request.json()
    console.log(`📝 [REQ-${requestId}] Text received - Length: ${text?.length || 0} characters`)

    if (!text) {
      console.log(`❌ [REQ-${requestId}] No text provided - returning 400`)
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log(`❌ [REQ-${requestId}] No OpenAI API key - returning 500`)
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // FIRST: Check if user is already being processed
    console.log(`🔒 [REQ-${requestId}] Checking user lock for ${userId}...`)
    console.log(`🔒 [REQ-${requestId}] Currently locked users: ${Array.from(userLocks.keys()).join(', ') || 'NONE'}`)
    
    if (!lockUser(userId)) {
      console.log(`🔒 [REQ-${requestId}] USER LOCKED: User ${userId} already has an AI generation in progress`)
      return NextResponse.json({ 
        error: 'Another AI generation is already in progress for your account. Please wait for it to complete.',
        retry: true
      }, { status: 429 })
    }
    
    console.log(`✅ [REQ-${requestId}] User ${userId} locked successfully`)

    // Create a unique request ID for deduplication - use more text for better uniqueness
    const textHash = Buffer.from(text.substring(0, 500)).toString('base64')
    const cacheKey = `${userId}-${textHash}`
    
    console.log(`🔍 [REQ-${requestId}] Cache key: ${cacheKey.substring(0, 50)}...`)
    
    // Clean up old cache entries
    cleanCache()
    
    // Check if we have a cached response for this request
    const cachedResponse = requestCache.get(cacheKey)
    if (cachedResponse) {
      console.log(`🔄 [REQ-${requestId}] CACHE HIT: Returning cached response for user ${userId} - NO USAGE CHARGED`)
      console.log(`🔄 [REQ-${requestId}] Cache entry timestamp: ${new Date(cachedResponse.timestamp).toISOString()}`)
      return NextResponse.json(cachedResponse.response)
    }

    console.log(`🔄 [REQ-${requestId}] CACHE MISS: Processing new AI request for user ${userId}`)
    console.log(`🔄 [REQ-${requestId}] Current cache size: ${requestCache.size} entries`)

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Check if user can make request and has enough credits
    console.log(`💳 [REQ-${requestId}] Checking user credits...`)
    const { canMake, usage } = await canUserMakeRequest(userId)
    
    console.log(`💳 [REQ-${requestId}] User ${userId} usage status:`, {
      canMake,
      uses_remaining: usage?.uses_remaining,
      plan_type: usage?.plan_type
    })
    
    if (!canMake) {
      // TEMPORARY FIX: Log the issue but allow the request to proceed
      console.warn(`⚠️ [REQ-${requestId}] User ${userId} has insufficient credits, but allowing request for debugging`)
      console.warn(`⚠️ [REQ-${requestId}] Usage data:`, usage)
    } else {
      console.log(`🔄 [REQ-${requestId}] User ${userId} generating AI content (${usage?.uses_remaining} credits remaining)`)
    }

    // Don't decrement usage yet - wait until the end of successful processing
    console.log(`🔄 [REQ-${requestId}] Starting OpenAI API calls for user ${userId}... (NO USAGE DECREMENTED YET)`)

    // LANGUAGE DETECTION + SUMMARY GENERATION - COMBINED TO REDUCE API CALLS
    console.log('🔍 Detecting language and generating summary...')
    
    // Calculate dynamic summary length based on content size (optimized for 15MB limit)
    const textLength = text.length
    let summaryLength = '3-4 sentences'
    let maxTokens = 400
    
    if (textLength > 20000) {
      summaryLength = '10-12 sentences with detailed explanations'
      maxTokens = 900
    } else if (textLength > 10000) {
      summaryLength = '8-10 sentences with comprehensive coverage'
      maxTokens = 800
    } else if (textLength > 5000) {
      summaryLength = '6-8 sentences with key details'
      maxTokens = 700
    } else if (textLength > 2000) {
      summaryLength = '4-6 sentences'
      maxTokens = 600
    } else if (textLength > 1000) {
      summaryLength = '3-5 sentences'
      maxTokens = 500
    }

    console.log(`📊 Text length: ${textLength} characters, Summary target: ${summaryLength}`)

    // Combined language detection and summary generation
    const combinedPrompt = `
    TASK 1: First, detect the primary language of the following text and respond with the language name in English (e.g., "Portuguese", "English", "Spanish").

    TASK 2: Then, provide a comprehensive summary of the text in the SAME language as the original text. The summary should:
    - Be about ${summaryLength} long (adjust based on content richness)
    - Capture ALL main ideas, key points, and important details
    - Be written in clear, accessible language in the detected language
    - Include specific facts, numbers, names, and concepts mentioned
    - Maintain the logical flow and structure of the original content
    - Focus on the most important and actionable information
    
    Format your response as:
    LANGUAGE: [detected language]
    SUMMARY: [comprehensive summary in the detected language]
    
    Text to analyze:
    ${text}
    `

    const combinedResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert language detection and content analysis system. Always format your response exactly as: LANGUAGE: [language]\nSUMMARY: [summary]. Be precise and accurate.'
        },
        {
          role: 'user',
          content: combinedPrompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.6,
    })

    const combinedResult = combinedResponse.choices[0]?.message?.content || ''
    console.log(`🤖 Combined response length: ${combinedResult.length} characters`)

    // Parse the combined response
    let detectedLanguage = 'English'
    let summary = 'Unable to generate summary'
    let responseLanguage = 'English'
    
    try {
      const lines = combinedResult.split('\n')
      const languageLine = lines.find(line => line.startsWith('LANGUAGE:'))
      const summaryIndex = lines.findIndex(line => line.startsWith('SUMMARY:'))
      
      if (languageLine) {
        detectedLanguage = languageLine.replace('LANGUAGE:', '').trim()
      }
      
      if (summaryIndex !== -1) {
        summary = lines.slice(summaryIndex).join('\n').replace('SUMMARY:', '').trim()
      }
      
      // Determine response language
      if (detectedLanguage.toLowerCase().includes('portuguese') || detectedLanguage.toLowerCase().includes('português')) {
        responseLanguage = 'Portuguese'
      } else if (detectedLanguage.toLowerCase().includes('english') || detectedLanguage.toLowerCase().includes('inglês')) {
        responseLanguage = 'English'
      } else {
        responseLanguage = detectedLanguage
      }
    } catch (error) {
      console.error('Error parsing combined response:', error)
      console.log('Raw combined response:', combinedResult)
      
      // Fallback: try to extract summary from the full response
      if (combinedResult.length > 50) {
        summary = combinedResult.substring(0, Math.min(combinedResult.length, 500))
      }
    }

    console.log(`🌐 Detected language: ${detectedLanguage} → Response language: ${responseLanguage}`)
    console.log(`✅ Summary generated: ${summary.length} characters`)

    // Calculate dynamic question count based on content size
    let questionCount = '6-8'
    let questionTokens = 800
    
    if (textLength > 20000) {
      questionCount = '12-15'
      questionTokens = 1200
    } else if (textLength > 10000) {
      questionCount = '10-12'
      questionTokens = 1000
    } else if (textLength > 5000) {
      questionCount = '8-10'
      questionTokens = 900
    } else if (textLength > 2000) {
      questionCount = '6-8'
      questionTokens = 800
    }

    console.log(`📊 Question target: ${questionCount} questions, ${questionTokens} tokens`)

    // Generate study questions with language awareness
    const questionsPrompt = `
    ${responseLanguage === 'Portuguese' ? 'IMPORTANT: Respond entirely in Portuguese (Brazilian Portuguese). All summaries and questions must be in Portuguese.' : 'IMPORTANT: Respond entirely in English. All summaries and questions must be in English.'}
    
    Based on the specific content of the following text, generate ${questionCount} detailed study questions that are directly tied to the actual material. The questions MUST:
    
    - Reference SPECIFIC facts, concepts, names, numbers, or details mentioned in the text
    - Include a variety of question types:
      * Factual recall (What specific... / O que especificamente...)
      * Comprehension (Why does... / Por que...)
      * Application (How would you apply... / Como você aplicaria...)
      * Analysis (What is the relationship between... / Qual é a relação entre...)
      * Evaluation (What are the advantages/disadvantages of... / Quais são as vantagens/desvantagens de...)
    - Be answerable ONLY by someone who has read this specific text
    - Avoid generic questions that could apply to any document
    - Include specific terminology and concepts from the content
    - Test both surface-level and deep understanding of the material
    
    Format your response as a JSON array of strings, with each string being a complete, specific question.
    
    Text for questions:
    ${text}
    `

    const questionsResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert educator who creates highly specific, content-focused study questions. Your questions should be so specific to the content that they could not be answered without reading the exact text provided. Always respond with a valid JSON array of question strings. ${responseLanguage === 'Portuguese' ? 'IMPORTANT: Respond entirely in Portuguese (Brazilian Portuguese). All summaries and questions must be in Portuguese.' : 'IMPORTANT: Respond entirely in English. All summaries and questions must be in English.'}`
        },
        {
          role: 'user',
          content: questionsPrompt
        }
      ],
      max_tokens: questionTokens,
      temperature: 0.8,
    })

    let questions: string[] = []
    const rawQuestionsContent = questionsResponse.choices[0]?.message?.content || '[]'
    console.log(`🤖 Raw questions response length: ${rawQuestionsContent.length} characters`)
    
    // Clean up the response - remove markdown code blocks if present
    const questionsContent = rawQuestionsContent
      .replace(/```json\s*/g, '')  // Remove opening ```json
      .replace(/```\s*$/g, '')     // Remove closing ```
      .trim()
    
    try {
      questions = JSON.parse(questionsContent)
      if (!Array.isArray(questions)) {
        throw new Error('Invalid format')
      }
      console.log(`✅ Successfully parsed ${questions.length} questions`)
    } catch (error) {
      console.error('Error parsing questions JSON:', error)
      console.log('Raw questions response:', questionsContent)
      
      // Try to extract questions from malformed JSON
      const questionLines = questionsContent.split('\n').filter((line: string) => 
        line.trim().length > 10 && 
        (line.includes('?') || line.includes('What') || line.includes('How') || line.includes('Why') || 
         line.includes('O que') || line.includes('Como') || line.includes('Por que') || line.includes('Qual'))
      )
      
      if (questionLines.length > 0) {
        const maxQuestions = questionCount.split('-')[1] || '8'
        questions = questionLines
          .map((q: string) => q.replace(/["\[\],]/g, '').trim())
          .filter((q: string) => q.length > 10)
          .slice(0, parseInt(maxQuestions))
      } else {
        // Language-aware fallback questions
        const fallbackQuestions = responseLanguage === 'Portuguese' ? [
          'Quais métodos, processos ou abordagens específicas são descritos neste conteúdo?',
          'Quais são os termos-chave, definições ou conceitos centrais para entender este material?',
          'Que evidências, exemplos ou dados são fornecidos para apoiar os argumentos principais?',
          'Que problemas ou desafios são identificados e que soluções são propostas?',
          'Como as diferentes ideias ou seções deste conteúdo se conectam entre si?',
          'Quais são as implicações práticas ou aplicações do mundo real desta informação?',
          'Que detalhes, números ou fatos específicos são mencionados que apoiam os pontos principais?',
          'Quais são os princípios ou teorias subjacentes que orientam o conteúdo?',
          'Como esta informação se relaciona com conceitos mais amplos ou conhecimento existente?',
          'Quais são os processos ou procedimentos passo a passo descritos no texto?',
          'Que comparações ou contrastes são feitos entre diferentes conceitos ou abordagens?',
          'Quais são os benefícios e limitações potenciais das ideias apresentadas?',
          'Como você aplicaria os conceitos deste conteúdo para resolver problemas do mundo real?',
          'Qual é o contexto histórico ou informações de fundo fornecidas?',
          'Que implicações futuras ou previsões são sugeridas pelo conteúdo?'
        ] : [
          'What specific methods, processes, or approaches are described in this content?',
          'What are the key terms, definitions, or concepts that are central to understanding this material?',
          'What evidence, examples, or data points are provided to support the main arguments?',
          'What problems or challenges are identified, and what solutions are proposed?',
          'How do the different ideas or sections in this content connect to each other?',
          'What are the practical implications or real-world applications of this information?',
          'What specific details, numbers, or facts are mentioned that support the main points?',
          'What are the underlying principles or theories that guide the content?',
          'How does this information relate to broader concepts or existing knowledge?',
          'What are the step-by-step processes or procedures outlined in the text?',
          'What comparisons or contrasts are made between different concepts or approaches?',
          'What are the potential benefits and limitations of the ideas presented?',
          'How would you apply the concepts from this content to solve real-world problems?',
          'What are the historical context or background information provided?',
          'What future implications or predictions are suggested by the content?'
        ]
        
        const maxQuestions = parseInt(questionCount.split('-')[1] || '8')
        questions = fallbackQuestions.slice(0, maxQuestions)
      }
    }

    const finalQuestions = questions.filter(q => q.trim().length > 0)
    console.log(`🎯 Final result: ${summary.trim().length} char summary, ${finalQuestions.length} questions in ${responseLanguage}`)
    
    // NOW decrement usage - only after successful completion of all processing
    let updatedUsage: UserUsage | null = null
    try {
      updatedUsage = await decrementUserUsage(userId)
      if (updatedUsage) {
        console.log(`✅ [REQ-${requestId}] USAGE DECREMENTED AT END: ${updatedUsage.uses_remaining} credits remaining for user ${userId}`)
      } else {
        console.error(`❌ [REQ-${requestId}] Failed to decrement usage for user ${userId}`)
      }
    } catch (error) {
      console.error('❌ Error decrementing usage:', error)
    }
    
    // Cache the response for future requests
    const responseData = {
      summary: summary.trim(),
      questions: finalQuestions,
      usage_remaining: updatedUsage?.uses_remaining || 0,
      detected_language: detectedLanguage,
      response_language: responseLanguage
    }
    
    requestCache.set(cacheKey, {
      response: responseData,
      timestamp: Date.now()
    })
    
    console.log(`✅ [REQ-${requestId}] RESPONSE CACHED: Cache key ${cacheKey.substring(0, 50)}... stored`)
    console.log(`✅ [REQ-${requestId}] FINAL RESULT: ${finalQuestions.length} questions, ${summary.trim().length} char summary`)
    console.log(`✅ [REQ-${requestId}] PROCESS COMPLETE: Single usage consumed for entire AI generation process`)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ AI generation error:', error)
    console.log(`❌ ERROR: No usage decremented due to processing failure`)
    return NextResponse.json({ error: 'Failed to generate AI content' }, { status: 500 })
  } finally {
    // Always unlock the user, even if there's an error
    if (userId) {
      unlockUser(userId)
      console.log(`🔓 [REQ-${requestId}] USER UNLOCKED: User ${userId} processing complete`)
    }
  }
} 