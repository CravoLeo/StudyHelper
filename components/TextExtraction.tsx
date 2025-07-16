'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, FileText, Eye, EyeOff, CheckCircle, XCircle, User } from 'lucide-react'

interface TextExtractionProps {
  file: File
  onTextExtracted: (text: string) => void
  language?: 'pt' | 'en'
  freeTrialUsed?: boolean
}

const translations = {
  pt: {
    extractingText: 'Extraindo texto do seu documento',
    readingPdf: 'Lendo conteúdo do PDF...',
    runningOcr: 'Executando análise OCR...',
    ocrProcessing: 'Processamento OCR de imagem pode levar até 60 segundos',
    readingPdfStructure: 'Lendo estrutura do PDF',
    extractingTextContent: 'Extraindo conteúdo do texto',
    runningOcrImage: 'Executando OCR na imagem',
    recognizingText: 'Reconhecendo caracteres de texto',
    preparingAi: 'Preparando para análise de IA',
    signInRequired: 'Login necessário',
    usageLimitReached: 'Limite de uso atingido',
    extractionFailed: 'Falha na extração',
    signInRequiredDesc: 'Recursos reais de IA requerem uma conta. Experimente nosso modo demo para ver como funciona primeiro!',

    upgradeDesc: '🚀 Atualize seu plano para continuar processando documentos com resumos e questões de estudo alimentados por IA.',
    viewPricingPlans: 'Ver Planos de Preços',
    backToHome: 'Voltar ao Início',
    textExtracted: 'Texto extraído com sucesso',
    charactersExtracted: 'caracteres extraídos',
    readyForAi: 'Pronto para análise de IA',
    showFullText: 'Mostrar texto completo',
    showLess: 'Mostrar menos',
    extractedText: 'Texto Extraído',
    continueToAi: 'Continuar para IA →',
    fileTooLarge: 'Arquivo Muito Grande',
    fileTooLargeDesc: 'Seu arquivo é muito grande para processamento. Tente um arquivo menor (menos de 15MB) ou comprima seu PDF antes de carregar.',
    trySmallerFile: 'Tentar Arquivo Menor'
  },
  en: {
    extractingText: 'Extracting text from your document',
    readingPdf: 'Reading PDF content...',
    runningOcr: 'Running OCR analysis...',
    ocrProcessing: 'Image OCR processing may take up to 60 seconds',
    readingPdfStructure: 'Reading PDF structure',
    extractingTextContent: 'Extracting text content',
    runningOcrImage: 'Running OCR on image',
    recognizingText: 'Recognizing text characters',
    preparingAi: 'Preparing for AI analysis',
    signInRequired: 'Sign in required',
    usageLimitReached: 'Usage limit reached',
    extractionFailed: 'Extraction failed',
    signInRequiredDesc: 'Real AI features require an account. Create an account to continue using our AI features!',
    upgradeDesc: '🚀 Upgrade your plan to continue processing documents with AI-powered summaries and study questions.',
    viewPricingPlans: 'View Pricing Plans',
    backToHome: 'Back to Home',
    textExtracted: 'Text extracted successfully',
    charactersExtracted: 'characters extracted',
    readyForAi: 'Ready for AI analysis',
    showFullText: 'Show full text',
    showLess: 'Show less',
    extractedText: 'Extracted Text',
    continueToAi: 'Continue to AI →',
    fileTooLarge: 'File Too Large',
    fileTooLargeDesc: 'Your file is too large for processing. Please try a smaller file (under 15MB) or compress your PDF before uploading.',
    trySmallerFile: 'Try Smaller File'
  }
}

export default function TextExtraction({ file, onTextExtracted, language = 'pt', freeTrialUsed = false }: TextExtractionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [extractedText, setExtractedText] = useState('')
  const [error, setError] = useState('')
  const [showFullText, setShowFullText] = useState(false)
  const t = translations[language]

  // Prevent duplicate processing
  const hasProcessedRef = useRef(false)
  const lastFileRef = useRef<File | null>(null)
  
  // Generate unique ID for this component
  const componentId = useRef(Math.random().toString(36).substring(7))
  
  console.log(`📄 [${componentId.current}] TextExtraction render - File: ${file.name}, Size: ${file.size}, HasProcessed: ${hasProcessedRef.current}`)

  useEffect(() => {
    // Check if we've already processed this exact file
    if (hasProcessedRef.current && lastFileRef.current === file) {
      console.log(`🚫 [${componentId.current}] Already processed this file, skipping`)
      return
    }
    
    // Reset processing flag if file changed
    if (lastFileRef.current !== file) {
      hasProcessedRef.current = false
      console.log(`📄 [${componentId.current}] File changed - reset processing flag`)
    }
    
    console.log(`📄 [${componentId.current}] Processing file: ${file.name}`)
    hasProcessedRef.current = true
    lastFileRef.current = file
    
    const extractText = async () => {
      setIsLoading(true)
      setError('')

      try {
        console.log(`📤 [${componentId.current}] Sending file to API:`, {
          name: file.name,
          type: file.type,
          size: file.size
        })

        const formData = new FormData()
        formData.append('file', file)
    

        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData
        })

        console.log(`📥 [${componentId.current}] API Response status:`, response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error(`❌ [${componentId.current}] API Error:`, errorData)
          
          // Check if this is an authentication error or free trial error
          if (response.status === 401 && errorData.needsAuth) {
            setError('NEEDS_AUTH')
            return
          }
          
          // Check if this is a free trial error
          if (response.status === 403 && errorData.freeTrialUsed) {
            setError('FREE_TRIAL_USED')
            return
          }
          
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log(`✅ [${componentId.current}] Extraction successful:`, {
          textLength: data.text?.length || 0,
          preview: data.text?.substring(0, 100) + '...'
        })

        setExtractedText(data.text || '')
        onTextExtracted(data.text || '')
        
        // Refresh usage after successful extraction
        const refreshEvent = new CustomEvent('refreshUsage')
        window.dispatchEvent(refreshEvent)
        console.log(`🔄 [${componentId.current}] Usage refresh event dispatched after text extraction`)
      } catch (err) {
        console.error(`❌ [${componentId.current}] Text extraction failed:`, err)
        setError(err instanceof Error ? err.message : 'Failed to extract text')
      } finally {
        setIsLoading(false)
      }
    }

    extractText()
  }, [file, onTextExtracted]) // Removed 't' dependency to prevent duplicate API calls

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText size={24} className="text-green-400 animate-pulse" />
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-2">
              {t.extractingText}
            </h3>
            <p className="text-gray-400 text-lg">
              {file.type === 'application/pdf' ? t.readingPdf : t.runningOcr}
            </p>
            {file.type.startsWith('image/') && (
              <p className="text-gray-500 text-sm mt-2">
                {t.ocrProcessing}
              </p>
            )}
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  {file.type === 'application/pdf' 
                    ? t.readingPdfStructure 
                    : t.runningOcrImage}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span>
                  {file.type === 'application/pdf' 
                    ? t.extractingTextContent 
                    : t.recognizingText}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span>{t.preparingAi}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    // Check if this is a usage limit error, authentication error, free trial error, or file size error
    const isUsageLimitError = error.includes('Usage limit exceeded')
    const needsAuth = error === 'NEEDS_AUTH'
    const freeTrialUsed = error === 'FREE_TRIAL_USED'
    const isFileTooLarge = error.includes('413') || error.includes('too large') || error.includes('Payload Too Large')
    
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-8">
          <div className={`w-16 h-16 ${needsAuth ? 'bg-blue-500/20 border-blue-500/30' : freeTrialUsed ? 'bg-orange-500/20 border-orange-500/30' : 'bg-red-500/20 border-red-500/30'} backdrop-blur-sm rounded-full flex items-center justify-center border`}>
            {needsAuth ? (
              <User size={32} className="text-blue-400" />
            ) : freeTrialUsed ? (
              <User size={32} className="text-orange-400" />
            ) : (
              <XCircle size={32} className="text-red-400" />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-2">
              {needsAuth ? t.signInRequired : freeTrialUsed ? 'Free Trial Used' : isUsageLimitError ? t.usageLimitReached : isFileTooLarge ? t.fileTooLarge : t.extractionFailed}
            </h3>
            <p className="text-gray-400 text-lg max-w-md">
              {needsAuth 
                ? t.signInRequiredDesc
                : freeTrialUsed
                ? 'You\'ve used your free trial. Create an account to continue using our AI features!'
                : isFileTooLarge
                ? t.fileTooLargeDesc
                : error
              }
            </p>
          </div>
          
          {needsAuth ? (
            <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 max-w-md">
              <div className="text-center space-y-4">
                <p className="text-blue-300 text-sm">
                  {t.signInRequiredDesc}
                </p>
                <button
                  onClick={() => {
                    // Redirect to home
                    window.location.href = '/'
                  }}
                  className="px-8 py-3 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors text-lg"
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : freeTrialUsed ? (
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
          ) : isUsageLimitError ? (
            <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30 max-w-md">
              <div className="text-center space-y-4">
                <p className="text-yellow-300 text-sm">
                  {t.upgradeDesc}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      // Trigger the pricing modal - we'll need to pass this up to the parent
                      const event = new CustomEvent('openPricingModal')
                      window.dispatchEvent(event)
                    }}
                    className="px-6 py-3 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors"
                  >
                    {t.viewPricingPlans}
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    {t.backToHome}
                  </button>
                </div>
              </div>
            </div>
          ) : isFileTooLarge ? (
            <div className="bg-orange-500/10 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 max-w-md">
              <div className="text-center space-y-4">
                <p className="text-orange-300 text-sm">
                  {t.fileTooLargeDesc}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors"
                  >
                    {t.trySmallerFile}
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    {t.backToHome}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/30 max-w-md">
              <div className="text-center space-y-4">
                <p className="text-red-300 text-sm">
                  {error}
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  {t.backToHome}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (extractedText) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-500/30">
              <CheckCircle size={24} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {t.textExtracted}
              </h3>
              <p className="text-gray-400">
                {extractedText.length.toLocaleString()} {t.charactersExtracted}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-green-200 font-medium">{t.readyForAi}</p>
              <p className="text-green-300/80 text-sm">
                {language === 'pt' ? 'Prosseguindo para gerar resumo e questões de estudo' : 'Proceeding to generate summary and study questions'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white">{t.extractedText}</h4>
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              {showFullText ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="text-sm">{showFullText ? t.showLess : t.showFullText}</span>
            </button>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {showFullText ? extractedText : extractedText.substring(0, 500) + '...'}
            </p>
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
            {t.textExtracted}
          </h3>
          <p className="text-white/60 text-sm">{t.readyForAi}</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <p className="text-white/90 leading-relaxed line-clamp-6">{extractedText}</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onTextExtracted(extractedText)}
          className="px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          {t.continueToAi}
        </button>
      </div>
    </div>
  )
} 