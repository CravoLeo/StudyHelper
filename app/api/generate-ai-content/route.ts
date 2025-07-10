import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { canUserMakeRequest, decrementUserUsage } from '@/lib/database'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Check if user can make request and has enough credits
    const { canMake, usage } = await canUserMakeRequest(userId)
    
    if (!canMake) {
      return NextResponse.json({ 
        error: 'Insufficient credits', 
        usage_remaining: usage?.uses_remaining || 0 
      }, { status: 403 })
    }

    console.log(`🔄 User ${userId} generating AI content (${usage?.uses_remaining} credits remaining)`)

    // Decrement usage count before processing
    const updatedUsage = await decrementUserUsage(userId)
    if (updatedUsage) {
      console.log(`✅ Usage decremented: ${updatedUsage.uses_remaining} credits remaining`)
    }

    // Calculate dynamic summary length based on content size (optimized for 15MB limit)
    const textLength = text.length
    let summaryLength = '3-4 sentences'
    let maxTokens = 300
    
    if (textLength > 20000) {
      summaryLength = '10-12 sentences with detailed explanations'
      maxTokens = 800
    } else if (textLength > 10000) {
      summaryLength = '8-10 sentences with comprehensive coverage'
      maxTokens = 700
    } else if (textLength > 5000) {
      summaryLength = '6-8 sentences with key details'
      maxTokens = 600
    } else if (textLength > 2000) {
      summaryLength = '4-6 sentences'
      maxTokens = 500
    } else if (textLength > 1000) {
      summaryLength = '3-5 sentences'
      maxTokens = 400
    }

    console.log(`📊 Text length: ${textLength} characters, Summary target: ${summaryLength}`)

    // Generate summary
    const summaryPrompt = `
    Please provide a comprehensive summary of the following text. The summary should:
    - Be about ${summaryLength} long (adjust based on content richness)
    - Capture ALL main ideas, key points, and important details
    - Be written in clear, accessible language
    - Include specific facts, numbers, names, and concepts mentioned
    - Maintain the logical flow and structure of the original content
    - Focus on the most important and actionable information
    
    Text to summarize:
    ${text}
    `

    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content analyst who creates detailed, accurate summaries that preserve important details and context from the original text.'
        },
        {
          role: 'user',
          content: summaryPrompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.6,
    })

    const summary = summaryResponse.choices[0]?.message?.content || 'Unable to generate summary'
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

    // Generate study questions
    const questionsPrompt = `
    Based on the specific content of the following text, generate ${questionCount} detailed study questions that are directly tied to the actual material. The questions MUST:
    
    - Reference SPECIFIC facts, concepts, names, numbers, or details mentioned in the text
    - Include a variety of question types:
      * Factual recall (What specific...)
      * Comprehension (Why does...)
      * Application (How would you apply...)
      * Analysis (What is the relationship between...)
      * Evaluation (What are the advantages/disadvantages of...)
    - Be answerable ONLY by someone who has read this specific text
    - Avoid generic questions that could apply to any document
    - Include specific terminology and concepts from the content
    - Test both surface-level and deep understanding of the material
    
    EXAMPLES OF GOOD vs BAD QUESTIONS:
    ❌ BAD (too generic): "What are the main topics covered?"
    ✅ GOOD (specific): "What are the three key components of [specific process mentioned] and how do they interact?"
    
    ❌ BAD: "What conclusions can be drawn?"
    ✅ GOOD: "According to the author, what impact does [specific factor] have on [specific outcome]?"
    
    Format your response as a JSON array of strings, with each string being a complete, specific question.
    
    Text for questions:
    ${text}
    `

    const questionsResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator who creates highly specific, content-focused study questions. Your questions should be so specific to the content that they could not be answered without reading the exact text provided. Always respond with a valid JSON array of question strings.'
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
      const questionLines = questionsContent.split('\n').filter(line => 
        line.trim().length > 10 && 
        (line.includes('?') || line.includes('What') || line.includes('How') || line.includes('Why'))
      )
      
      if (questionLines.length > 0) {
        const maxQuestions = questionCount.split('-')[1] || '8'
        questions = questionLines
          .map(q => q.replace(/["\[\],]/g, '').trim())
          .filter(q => q.length > 10)
          .slice(0, parseInt(maxQuestions))
      } else {
        // Last resort fallback - more specific than before
        const fallbackQuestions = [
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
    console.log(`🎯 Final result: ${summary.trim().length} char summary, ${finalQuestions.length} questions`)
    
    return NextResponse.json({
      summary: summary.trim(),
      questions: finalQuestions,
      usage_remaining: updatedUsage?.uses_remaining || 0
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: 'Failed to generate AI content' }, { status: 500 })
  }
} 