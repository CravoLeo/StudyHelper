'use client'

import { useEffect, useState } from 'react'
import { Loader2, Sparkles, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface AIGenerationProps {
  text: string
  onAIGenerated: (summary: string, questions: string[]) => void
  demoMode?: boolean
}

export default function AIGeneration({ text, onAIGenerated, demoMode = false }: AIGenerationProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const generateAIContent = async () => {
      setIsLoading(true)
      setError('')
      setProgress(0)

      try {
        setProgress(25)
        
        if (demoMode) {
          // Demo mode - simulate API delay and return mock data
          await new Promise(resolve => setTimeout(resolve, 800))
          setProgress(50)
          
          await new Promise(resolve => setTimeout(resolve, 600))
          setProgress(75)
          
          // Generate dynamic mock content based on text length (matches API scaling)
          const textLength = text.length
          let mockSummary = ''
          let mockQuestions: string[] = []
          
          if (textLength > 20000) {
            mockSummary = `This extensive document provides an exhaustive analysis of the subject matter with comprehensive coverage of all relevant aspects. The content systematically explores multiple theoretical frameworks, presents detailed empirical evidence, and discusses comprehensive practical applications across various domains. Key findings reveal complex relationships between different variables and concepts, with particular emphasis on advanced implementation strategies and their long-term outcomes. The document thoroughly addresses potential challenges, presents sophisticated solutions, and provides detailed recommendations for effective execution. Additionally, it includes comprehensive case studies, detailed statistical analysis, and extensive references to support all major claims and conclusions.`
            mockQuestions = [
              'What are the five primary theoretical frameworks presented and how do they interrelate?',
              'According to the comprehensive analysis, what empirical evidence supports the main hypothesis?',
              'How do the advanced implementation strategies address the complex challenges identified?',
              'What are the detailed performance metrics and success indicators discussed?',
              'What comprehensive practical applications are suggested for different industry contexts?',
              'How do the proposed solutions compare with existing methodologies in the field?',
              'What are the potential long-term risks and detailed mitigation strategies outlined?',
              'What specific case studies are presented and what lessons can be drawn from them?',
              'How do the statistical findings support the overall conclusions of the research?',
              'What are the future research directions and implications suggested by the authors?',
              'What are the detailed implementation timelines and resource requirements discussed?',
              'How do the different sections and chapters build upon each other systematically?',
              'What are the specific recommendations for different stakeholder groups?',
              'What are the ethical considerations and compliance requirements mentioned?',
              'How does this comprehensive analysis contribute to the broader field of study?'
            ]
          } else if (textLength > 10000) {
            mockSummary = `This substantial document provides detailed analysis of the subject matter with comprehensive coverage of key concepts and methodologies. The content explores multiple theoretical approaches, presents robust evidence, and discusses extensive practical applications. Key findings indicate significant relationships between different concepts, with emphasis on advanced implementation strategies and their measurable outcomes. The document addresses potential challenges and proposes detailed solutions for effective execution.`
            mockQuestions = [
              'What are the four main theoretical approaches discussed and how do they differ?',
              'According to the detailed analysis, what evidence supports the primary conclusions?',
              'How do the implementation strategies comprehensively address the challenges identified?',
              'What are the key performance indicators and success metrics mentioned?',
              'What extensive practical applications are suggested for real-world implementation?',
              'How do the proposed solutions compare with existing approaches in the field?',
              'What are the potential risks and comprehensive mitigation strategies outlined?',
              'What specific examples and case studies are provided to illustrate key points?',
              'How do the different methodologies complement each other in practice?',
              'What are the detailed recommendations for successful implementation?',
              'What future implications and research directions are suggested?',
              'How do the various sections of the document connect and build upon each other?'
            ]
          } else if (textLength > 5000) {
            mockSummary = `This comprehensive document covers multiple key areas and provides detailed analysis of the subject matter. The content explores various methodologies, presents supporting evidence, and discusses practical applications. Key findings indicate significant relationships between different concepts, with particular emphasis on implementation strategies and their outcomes. The document also addresses potential challenges and proposes solutions for effective execution.`
            mockQuestions = [
              'What are the three main methodologies discussed in the document and how do they differ in their approaches?',
              'According to the analysis, what evidence supports the primary hypothesis presented?',
              'How do the implementation strategies address the identified challenges?',
              'What are the key performance indicators mentioned for measuring success?',
              'What practical applications are suggested for real-world implementation?',
              'How do the proposed solutions compare with existing approaches in the field?',
              'What are the potential risks and mitigation strategies outlined in the document?',
              'What specific examples are provided to illustrate the main concepts?',
              'How do the different sections of the document relate to each other?',
              'What are the key recommendations for practitioners in the field?'
            ]
          } else if (textLength > 2000) {
            mockSummary = `This document provides a focused analysis of the key concepts and presents relevant findings. The content examines important aspects of the subject matter and discusses practical implications. The analysis reveals valuable insights that can be applied to understand the topic better and make informed decisions.`
            mockQuestions = [
              'What are the main concepts discussed in this document?',
              'How do the findings relate to practical applications mentioned?',
              'What insights can be drawn from the analysis presented?',
              'What are the key recommendations provided?',
              'How do the different sections of the document connect to each other?',
              'What evidence supports the conclusions drawn?',
              'What are the practical implications of the findings?',
              'How does this analysis contribute to understanding the topic?'
            ]
          } else {
            mockSummary = `This document presents essential information about the topic with clear explanations and relevant examples. The content covers fundamental concepts and provides practical insights that help understand the subject matter effectively.`
            mockQuestions = [
              'What are the fundamental concepts explained in this document?',
              'How do the examples provided illustrate the main points?',
              'What practical insights can be gained from this content?',
              'What are the key takeaways from this material?',
              'How does this information relate to broader applications?',
              'What are the main conclusions presented in the document?'
            ]
          }
          
          await new Promise(resolve => setTimeout(resolve, 400))
          setProgress(100)
          
          setSummary(mockSummary)
          setQuestions(mockQuestions)
          
          // Small delay to show completion
          setTimeout(() => {
            onAIGenerated(mockSummary, mockQuestions)
            
            // Refresh usage after successful generation (even in demo mode for consistency)
            const refreshEvent = new CustomEvent('refreshUsage')
            window.dispatchEvent(refreshEvent)
            console.log('🔄 Usage refresh event dispatched after demo generation')
          }, 500)
          
        } else {
          // Real API mode
          const response = await fetch('/api/generate-ai-content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
          })

          setProgress(50)

          if (!response.ok) {
            throw new Error('Failed to generate AI content')
          }

          const data = await response.json()
          
          if (data.error) {
            throw new Error(data.error)
          }

          setProgress(75)
          
          setSummary(data.summary)
          setQuestions(data.questions)
          
          setProgress(100)
          
          // Small delay to show completion
          setTimeout(() => {
            onAIGenerated(data.summary, data.questions)
            
            // Refresh usage after successful AI generation
            const refreshEvent = new CustomEvent('refreshUsage')
            window.dispatchEvent(refreshEvent)
            console.log('🔄 Usage refresh event dispatched after AI generation')
          }, 500)
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    generateAIContent()
  }, [text, onAIGenerated, demoMode])

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={24} className="text-green-400 animate-pulse" />
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-2">
              {demoMode ? '🎭 Demo Mode: Simulating AI analysis' : 'AI is analyzing your content'}
            </h3>
            <p className="text-gray-400 text-lg">
              {demoMode ? 'Generating sample content...' : 'Creating summary and study questions...'}
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Analyzing document structure</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span>Generating comprehensive summary</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span>Creating study questions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-8">
          <div className="w-16 h-16 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-red-500/30">
            <XCircle size={32} className="text-red-400" />
          </div>
          
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-2">
              AI processing failed
            </h3>
            <p className="text-gray-400 text-lg max-w-md">
              {error}
            </p>
          </div>
          
          <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
            <p className="text-red-300 text-sm text-center">
              {demoMode 
                ? 'Demo mode encountered an error. Please try again.' 
                : 'Please check your OpenAI API key and try again.'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (summary && questions.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-500/30">
              <CheckCircle size={24} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                AI analysis complete
              </h3>
              <p className="text-gray-400">
                {demoMode ? 'Demo content generated' : 'Summary and questions generated successfully'}
              </p>
            </div>
          </div>
          
          {demoMode && (
            <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-yellow-500/30">
              <span className="text-yellow-300 text-sm font-medium">🎭 Demo Mode</span>
            </div>
          )}
        </div>

        <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-green-200 font-medium">Ready for editing</p>
              <p className="text-green-300/80 text-sm">
                You can now edit the summary and questions, then save or export your study materials.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-green-400/30">
          <CheckCircle className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">
            {demoMode ? '🎭 Demo Content Generated' : 'AI Content Generated'}
          </h3>
          <p className="text-white/60 text-sm">Ready for editing and export</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-bold text-white mb-4">Summary Preview</h4>
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30">
            <p className="text-white/90 leading-relaxed line-clamp-3">{summary}</p>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            Study Questions Preview
            <span className="bg-purple-500/20 backdrop-blur-sm text-purple-200 px-2 py-1 rounded-xl text-sm border border-purple-400/30">
              {questions.length} questions
            </span>
          </h4>
          <div className="bg-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30">
            <div className="space-y-3">
              {questions.slice(0, 3).map((question, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-white/90 text-sm">{question}</p>
                </div>
              ))}
              {questions.length > 3 && (
                <div className="text-white/70 text-sm pt-2 border-t border-white/20">
                  + {questions.length - 3} more questions
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onAIGenerated(summary, questions)}
            className="px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Continue to Edit & Export →
          </button>
        </div>
      </div>
    </div>
  )
} 