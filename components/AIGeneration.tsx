'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, Sparkles, CheckCircle, AlertCircle, XCircle, Globe } from 'lucide-react'

interface AIGenerationProps {
  text: string
  onAIGenerated: (summary: string, questions: string[]) => void
  language?: 'pt' | 'en'
  freeTrialUsed?: boolean
}

export default function AIGeneration({ text, onAIGenerated, language = 'pt', freeTrialUsed = false }: AIGenerationProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [detectedLanguage, setDetectedLanguage] = useState<string>('')
  const [responseLanguage, setResponseLanguage] = useState<string>('')
  const [languageDetected, setLanguageDetected] = useState(false)
  
  // Prevent multiple simultaneous API calls
  const isProcessingRef = useRef(false)
  const hasProcessedRef = useRef(false) // Track if we've already processed this text
  const lastTextRef = useRef<string>('')
  
  // Store the callback in a ref to prevent useEffect from re-running when it changes
  const onAIGeneratedRef = useRef(onAIGenerated)
  onAIGeneratedRef.current = onAIGenerated
  
  // Generate a unique ID for this component instance
  const componentId = useRef(Math.random().toString(36).substring(7))
  
  // Debug logging
      console.log(`🔍 [${componentId.current}] AIGeneration render - Text length: ${text.length}, Processing: ${isProcessingRef.current}, HasProcessed: ${hasProcessedRef.current}`)
  
  // Track when text changes to help debug re-renders
  useEffect(() => {
    const textChanged = lastTextRef.current !== text
    console.log(`📝 [${componentId.current}] Text effect triggered - Changed: ${textChanged}, Length: ${text.length}`)
    console.log(`📝 [${componentId.current}] Previous text: "${lastTextRef.current.substring(0, 50)}..."`)
    console.log(`📝 [${componentId.current}] Current text: "${text.substring(0, 50)}..."`)
    
    if (textChanged) {
      lastTextRef.current = text
      hasProcessedRef.current = false // Reset processing flag when text changes
      console.log(`📝 [${componentId.current}] Text changed - reset hasProcessed flag`)
    }
  }, [text])
  
  // Translations for UI elements
  const translations = {
    pt: {
      aiAnalyzing: 'IA está analisando seu conteúdo',
      creatingContent: 'Criando resumo e questões de estudo...',
      generatingContent: 'Gerando conteúdo de amostra...',
      detectingLanguage: 'Detectando idioma do documento',
      analyzingStructure: 'Analisando estrutura do documento',
      generatingSummary: 'Gerando resumo abrangente',
      creatingQuestions: 'Criando questões de estudo',
      languageDetected: 'Idioma Detectado',
      generatingIn: 'Gerando conteúdo em',
      aiProcessingFailed: 'Processamento de IA falhou',
      aiAnalysisComplete: 'Análise de IA concluída',
      sampleGenerated: 'Conteúdo de amostra gerado',
      summaryGenerated: 'Resumo e questões geradas com sucesso',
      freeSandbox: '🎭 Sandbox Gratuito',
      readyForEditing: 'Pronto para edição',
      canEditAndExport: 'Você pode agora editar o resumo e as questões, depois salvar ou exportar seus materiais de estudo.',
      continueToEdit: 'Continuar para Editar & Exportar →'
    },
    en: {
      aiAnalyzing: 'AI is analyzing your content',
      creatingContent: 'Creating summary and study questions...',
      generatingContent: 'Generating sample content...',
      detectingLanguage: 'Detecting document language',
      analyzingStructure: 'Analyzing document structure',
      generatingSummary: 'Generating comprehensive summary',
      creatingQuestions: 'Creating study questions',
      languageDetected: 'Language Detected',
      generatingIn: 'Generating content in',
      aiProcessingFailed: 'AI processing failed',
      aiAnalysisComplete: 'AI analysis complete',
      sampleGenerated: 'Sample content generated',
      summaryGenerated: 'Summary and questions generated successfully',
      freeSandbox: '🎭 Free Sandbox',
      readyForEditing: 'Ready for editing',
      canEditAndExport: 'You can now edit the summary and questions, then save or export your study materials.',
      continueToEdit: 'Continue to Edit & Export →'
    }
  }
  
  const t = translations[language]

  // Single useEffect that only runs when text actually changes
  useEffect(() => {
    // Prevent processing if we've already processed this exact text
    if (hasProcessedRef.current) {
      console.log(`🚫 [${componentId.current}] Already processed this text, skipping`)
      return
    }
    
    // Prevent multiple simultaneous API calls
    if (isProcessingRef.current) {
      console.log(`🚫 [${componentId.current}] AI generation already in progress, skipping duplicate call`)
      console.log(`🚫 [${componentId.current}] This should not happen with the fixed logic!`)
      return
    }
    
    console.log(`🔍 [${componentId.current}] Starting AI generation - Text: ${text.substring(0, 50)}...`)
    
    hasProcessedRef.current = true // Mark as processed BEFORE starting
    isProcessingRef.current = true
    
    const generateAIContent = async () => {
      setIsLoading(true)
      setError('')
      setProgress(0)
      setLanguageDetected(false)

      try {
        setProgress(10)
        

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
            const errorData = await response.json().catch(() => ({}))
            
            // Check if this is a free trial error
            if (response.status === 403 && errorData.freeTrialUsed) {
              throw new Error('FREE_TRIAL_USED')
            }
            
            throw new Error(errorData.error || 'Failed to generate AI content')
          }

          const data = await response.json()
          
          if (data.error) {
            // Handle user lock specifically
            if (data.retry && response.status === 429) {
              console.log('🔒 User locked, retrying in 2 seconds...')
              await new Promise(resolve => setTimeout(resolve, 2000))
              
              // Retry the request once
              const retryResponse = await fetch('/api/generate-ai-content', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
              })
              
              const retryData = await retryResponse.json()
              if (retryData.error) {
                throw new Error(retryData.error)
              }
              
              // Use retry data instead
              Object.assign(data, retryData)
            } else {
              throw new Error(data.error)
            }
          }

          // Set language detection results
          if (data.detected_language) {
            setDetectedLanguage(data.detected_language)
            setResponseLanguage(data.response_language || data.detected_language)
            setLanguageDetected(true)
          }

          setProgress(75)
          
          setSummary(data.summary)
          setQuestions(data.questions)
          
          setProgress(100)
          
          // Small delay to show completion
          setTimeout(() => {
            console.log('🔄 Real API mode calling onAIGenerated callback')
            onAIGeneratedRef.current(data.summary, data.questions)
            
            // Refresh usage after successful AI generation
            const refreshEvent = new CustomEvent('refreshUsage')
            window.dispatchEvent(refreshEvent)
            console.log(`🔄 Usage refresh event dispatched after AI generation - ${data.usage_remaining} credits remaining`)
          }, 500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
        isProcessingRef.current = false
      }
    }

    generateAIContent()
    
    // Cleanup function to reset processing flag
    return () => {
      isProcessingRef.current = false
    }
  }, [text]) // Removed onAIGenerated from dependencies to prevent re-renders

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
              {t.aiAnalyzing}
            </h3>
            <p className="text-gray-400 text-lg">
              {t.creatingContent}
            </p>
          </div>
          
          {/* Language Detection Status */}
          {languageDetected && (
            <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Globe size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-blue-200 font-medium">{t.languageDetected}: {detectedLanguage}</p>
                  <p className="text-blue-300/80 text-sm">
                    {t.generatingIn} {responseLanguage}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{t.detectingLanguage}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span>{t.analyzingStructure}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span>{t.generatingSummary}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                <span>{t.creatingQuestions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    const freeTrialUsed = error === 'FREE_TRIAL_USED'
    
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-8">
          <div className={`w-16 h-16 ${freeTrialUsed ? 'bg-orange-500/20 border-orange-500/30' : 'bg-red-500/20 border-red-500/30'} backdrop-blur-sm rounded-full flex items-center justify-center border`}>
            {freeTrialUsed ? (
              <AlertCircle size={32} className="text-orange-400" />
            ) : (
              <XCircle size={32} className="text-red-400" />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-2">
              {freeTrialUsed ? 'Free Trial Used' : t.aiProcessingFailed}
            </h3>
            <p className="text-gray-400 text-lg max-w-md">
              {freeTrialUsed 
                ? 'You\'ve used your free trial. Create an account to continue using our AI features!'
                : error
              }
            </p>
          </div>
          
          {freeTrialUsed ? (
            <div className="bg-orange-500/10 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 max-w-md">
              <div className="text-center space-y-4">
                <p className="text-orange-300 text-sm">
                  You've used your free trial. Create an account to continue using our AI features!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      // Trigger sign up - we'll need to handle this in the parent
                      const event = new CustomEvent('openSignUp')
                      window.dispatchEvent(event)
                    }}
                    className="px-6 py-3 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors"
                  >
                    Create Account
                  </button>

                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <p className="text-red-300 text-sm text-center">
                Please check your OpenAI API key and try again.
              </p>
            </div>
          )}
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
                {t.aiAnalysisComplete}
              </h3>
              <p className="text-gray-400">
                {t.summaryGenerated}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Language Detection Badge */}
            {detectedLanguage && (
              <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-blue-500/30">
                <div className="flex items-center space-x-2">
                  <Globe size={16} className="text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">
                    {responseLanguage}
                  </span>
                </div>
              </div>
            )}
            

          </div>
        </div>

        <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-green-200 font-medium">
                {t.readyForEditing}
              </p>
              <p className="text-green-300/80 text-sm">
                {t.canEditAndExport}
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
            AI Content Generated
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
            onClick={() => {
              console.log('🔄 Continue button clicked - calling onAIGenerated')
              onAIGeneratedRef.current(summary, questions)
            }}
            className="px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {t.continueToEdit}
          </button>
        </div>
      </div>
    </div>
  )
} 