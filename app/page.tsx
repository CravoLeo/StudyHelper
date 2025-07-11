'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, SignInButton, SignOutButton, UserButton } from '@clerk/nextjs'
import FileUpload from '@/components/FileUpload'
import TextExtraction from '@/components/TextExtraction'
import AIGeneration from '@/components/AIGeneration'
import PricingModal from '@/components/PricingModal'
import NextStepsModal from '@/components/NextStepsModal'
import MaintenanceMode from '@/components/MaintenanceMode'
import { FileText, Upload, Sparkles, Download, Save, History, Trash2, Calendar, Eye, User, AlertCircle, CheckCircle, XCircle, CreditCard, Zap, Rocket, Globe } from 'lucide-react'
import { SavedDocument, isLocalMode } from '@/lib/supabase'
import { saveDocument, getDocuments, deleteDocument, UserUsage } from '@/lib/database'

// Language translations
const translations = {
  pt: {
    // Navigation
    features: 'Recursos',
    history: 'Histórico',
    manageplan: 'Gerenciar Plano',
    upgrade: 'Atualizar',
    whatsnext: 'O que vem a seguir?',
    signin: 'Entrar',
    unlimited: 'Ilimitado',
    unlimitedPlan: 'Plano Ilimitado',
    uses: 'usos',
    usesLeft: 'restantes',
    
    // Status messages
    localMode: 'Modo Local: Documentos salvos apenas no navegador',
    cloudMode: 'Modo Nuvem: Documentos salvos com segurança',
    
    // Hero section
    heroTitle: 'Transforme Documentos em',
    heroSubtitle: 'Materiais de Estudo',
    heroTagline: '100% Automático e Seguro',
    heroDescription: 'Carregue PDFs ou imagens e obtenha resumos e questões de estudo com IA em segundos. Nenhum trabalho manual necessário.',
    
    // Mode toggle
    demoMode: '🎭 MODO DEMO',
    openaiMode: '🚀 MODO OPENAI',
    demoModeDesc: 'Gratuito • Usa dados simulados',
    openaiModeDesc: 'Usa créditos • IA real',
    
    // Actions
    startNewDocument: 'Iniciar Novo Documento',
    
    // Progress steps
    upload: 'Carregar',
    extract: 'Extrair',
    generate: 'Gerar',
    export: 'Exportar',
    
    // Features section
    featuresTitle: 'Aumente a criatividade - e a eficiência!',
    featuresSubtitle: 'Seja para criar materiais de estudo para provas ou processar artigos de pesquisa instantaneamente, o StudyHelper torna isso possível.',
    
    aiPoweredTitle: 'Movido por IA',
    aiPoweredDesc: 'IA avançada analisa seus documentos e cria resumos abrangentes e questões de estudo',
    
    multipleFormatsTitle: 'Múltiplos Formatos',
    multipleFormatsDesc: 'Funciona com PDFs, imagens e vários tipos de documento. Carregue e obtenha resultados instantaneamente',
    
    exportReadyTitle: 'Pronto para Exportar',
    exportReadyDesc: 'Exporte seus materiais de estudo como arquivos de texto ou PDFs. Perfeito para compartilhar e imprimir',
    
    // Trust indicators
    trustedBy: 'Confiado por estudantes de',
    universities: 'Universidades',
    highSchools: 'Escolas Secundárias',
    researchLabs: 'Laboratórios de Pesquisa',
    studyGroups: 'Grupos de Estudo',
    
    // Edit section
    demoModeActive: 'Modo Demo Ativo',
    demoModeContent: 'Este conteúdo foi gerado usando dados simulados',
    summary: 'Resumo',
    studyQuestions: 'Questões de Estudo',
    summaryPlaceholder: 'Resumo gerado por IA aparecerá aqui...',
    addQuestion: 'Adicionar questão',
    removeQuestion: 'Remover questão',
    
    // Actions
    saveDocument: 'Salvar Documento',
    exportAsTxt: 'Exportar como TXT',
    exportAsPdf: 'Exportar como PDF',
    
    // Export notifications
    exportingTxt: 'Exportando arquivo de texto...',
    exportingPdf: 'Exportando arquivo PDF...',
    
    // History modal
    savedDocuments: 'Documentos Salvos',
    noDocuments: 'Nenhum documento salvo ainda',
    close: 'Fechar',
    view: 'Visualizar',
    delete: 'Excluir',
    
    // Language switcher
    language: 'Idioma',
    portuguese: 'Português',
    english: 'English'
  },
  en: {
    // Navigation
    features: 'Features',
    history: 'History',
    manageplan: 'Manage Plan',
    upgrade: 'Upgrade',
    whatsnext: 'What\'s Next?',
    signin: 'Sign In',
    unlimited: 'Unlimited',
    unlimitedPlan: 'Unlimited Plan',
    uses: 'uses',
    usesLeft: 'left',
    
    // Status messages
    localMode: 'Local Mode: Documents saved to browser only',
    cloudMode: 'Cloud Mode: Documents securely saved',
    
    // Hero section
    heroTitle: 'Turn Documents into',
    heroSubtitle: 'Study Materials',
    heroTagline: '100% Automatic & Secure',
    heroDescription: 'Upload PDFs or images and get AI-powered summaries and study questions in seconds. No manual work required.',
    
    // Mode toggle
    demoMode: '🎭 DEMO MODE',
    openaiMode: '🚀 OPENAI MODE',
    demoModeDesc: 'Free • Uses mock data',
    openaiModeDesc: 'Uses credits • Real AI',
    
    // Actions
    startNewDocument: 'Start New Document',
    
    // Progress steps
    upload: 'Upload',
    extract: 'Extract',
    generate: 'Generate',
    export: 'Export',
    
    // Features section
    featuresTitle: 'Boost creativity – and efficiency!',
    featuresSubtitle: 'Whether you want to create study materials for exams or process research papers instantly, StudyHelper makes it possible.',
    
    aiPoweredTitle: 'AI-Powered',
    aiPoweredDesc: 'Advanced AI analyzes your documents and creates comprehensive summaries and study questions',
    
    multipleFormatsTitle: 'Multiple Formats',
    multipleFormatsDesc: 'Works with PDFs, images, and various document types. Upload and get results instantly',
    
    exportReadyTitle: 'Export Ready',
    exportReadyDesc: 'Export your study materials as text files or PDFs. Perfect for sharing and printing',
    
    // Trust indicators
    trustedBy: 'Trusted by students at',
    universities: 'Universities',
    highSchools: 'High Schools',
    researchLabs: 'Research Labs',
    studyGroups: 'Study Groups',
    
    // Edit section
    demoModeActive: 'Demo Mode Active',
    demoModeContent: 'This content was generated using mock data',
    summary: 'Summary',
    studyQuestions: 'Study Questions',
    summaryPlaceholder: 'AI-generated summary will appear here...',
    addQuestion: 'Add question',
    removeQuestion: 'Remove question',
    
    // Actions
    saveDocument: 'Save Document',
    exportAsTxt: 'Export as TXT',
    exportAsPdf: 'Export as PDF',
    
    // Export notifications
    exportingTxt: 'Exporting text file...',
    exportingPdf: 'Exporting PDF file...',
    
    // History modal
    savedDocuments: 'Saved Documents',
    noDocuments: 'No saved documents yet',
    close: 'Close',
    view: 'View',
    delete: 'Delete',
    
    // Language switcher
    language: 'Language',
    portuguese: 'Português',
    english: 'English'
  }
}

export default function Home() {
  const { user, isSignedIn, isLoaded } = useUser()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [summary, setSummary] = useState<string>('')
  const [questions, setQuestions] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<'upload' | 'extract' | 'generate' | 'edit'>('upload')
  const [isExporting, setIsExporting] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([])
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDebug, setShowDebug] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceChecked, setMaintenanceChecked] = useState(true) // Start as true to avoid hydration issues
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: false,
    supabaseKey: false,
    clerkPublic: false,
    openaiKey: false,
  })
  
  // Usage tracking state
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showNextStepsModal, setShowNextStepsModal] = useState(false)
  const [usageLoading, setUsageLoading] = useState(false)
  const [showStatusMessage, setShowStatusMessage] = useState(true)
  
  // Language state
  const [language, setLanguage] = useState<'pt' | 'en'>('pt') // Default to Portuguese
  const t = translations[language]

  // Simplified maintenance mode check - only run on client
  useEffect(() => {
    // Check URL parameters for demo mode
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('demo') === 'true') {
      setDemoMode(true)
    }

    // Only check maintenance mode, don't block rendering
    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch('/api/health-check')
        if (response.ok) {
          const status = await response.json()
          // Only set maintenance mode if explicitly true
          if (status.maintenanceMode === true) {
            setMaintenanceMode(true)
          }
          setEnvStatus({
            supabaseUrl: status.supabaseUrl || false,
            supabaseKey: status.supabaseKey || false,
            clerkPublic: status.clerkPublic || false,
            openaiKey: status.openaiKey || false,
          })
        }
      } catch (error) {
        console.error('Error checking maintenance mode:', error)
        // Silently fail, don't set maintenance mode
      }
    }

    // Run after a brief delay to ensure hydration is complete
    const timer = setTimeout(checkMaintenanceMode, 500)
    return () => clearTimeout(timer)
  }, [])

  // Early returns moved to end of component to fix hooks rule violation

  // Debug information
  const debugInfo = {
    supabaseUrl: envStatus.supabaseUrl ? '✅ Connected' : '❌ Missing',
    supabaseKey: envStatus.supabaseKey ? '✅ Connected' : '❌ Missing',
    clerkPublic: envStatus.clerkPublic ? '✅ Connected' : '❌ Missing',
    openaiKey: envStatus.openaiKey ? '✅ Connected' : '❌ Missing',
    localMode: isLocalMode ? '⚠️ Local Mode' : '☁️ Cloud Mode'
  }

  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file)
    setCurrentStep('extract')
  }, [])

  const handleTextExtracted = useCallback((text: string) => {
    console.log(`📝 handleTextExtracted called with ${text.length} characters`)
    setExtractedText(text)
    setCurrentStep('generate')
  }, [])

  const handleManageSubscription = async () => {
    try {
      console.log('🔍 Cancelling subscription...')
      
      const confirmed = confirm('Are you sure you want to cancel your unlimited subscription? You will keep unlimited access until the end of your billing period.')
      
      if (!confirmed) return

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      console.log('🔍 Cancel response:', { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      console.log('✅ Subscription cancelled successfully')
      
      // Show success message
      alert(data.message || 'Subscription cancelled successfully!')
      
      // Refresh the page to update the UI
      window.location.reload()
    } catch (error) {
      console.error('❌ Error cancelling subscription:', error)
      alert(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  const handleAIGenerated = useCallback((generatedSummary: string, generatedQuestions: string[]) => {
    setSummary(generatedSummary)
    setQuestions(generatedQuestions)
    setCurrentStep('edit')
  }, [])

  const resetApp = useCallback(() => {
    setUploadedFile(null)
    setExtractedText('')
    setSummary('')
    setQuestions([])
    setCurrentStep('upload')
  }, [])

  // Environment status is now loaded in the maintenance mode check

  // Load user usage
  const loadUserUsage = useCallback(async () => {
    if (!isSignedIn || isLocalMode) return

    setUsageLoading(true)
    try {
      const response = await fetch('/api/user-usage')
      if (response.ok) {
        const usage = await response.json()
        setUserUsage(usage)
      }
    } catch (error) {
      console.error('Error loading user usage:', error)
    } finally {
      setUsageLoading(false)
    }
  }, [isSignedIn])

  // Load documents on mount and when user changes
  useEffect(() => {
    if (!isLoaded) return

    const initializeApp = async () => {
      try {
        // Load user's documents if signed in, otherwise load public docs
        const documents = await getDocuments(user?.id)
        setSavedDocuments(documents)
        
        // Load user usage if signed in
        if (isSignedIn) {
          await loadUserUsage()
        }
        
        // Show success message if we're in cloud mode
        if (!isLocalMode) {
          console.log('✅ Successfully connected to Supabase database!')
        }
      } catch (error) {
        console.error('Error loading documents:', error)
        // Fallback to localStorage for backward compatibility
        const saved = localStorage.getItem('studyhelper-documents')
        if (saved) {
          try {
            const localDocs = JSON.parse(saved)
            // Convert localStorage format to Supabase format
            const convertedDocs = localDocs.map((doc: any) => ({
              id: doc.id,
              file_name: doc.fileName,
              summary: doc.summary,
              questions: doc.questions,
              demo_mode: doc.demoMode,
              created_at: doc.savedAt,
              updated_at: doc.savedAt,
              user_id: undefined
            }))
            setSavedDocuments(convertedDocs)
          } catch (error) {
            console.error('Error loading local documents:', error)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [user, isLoaded, isSignedIn, loadUserUsage])

  // Listen for pricing modal events from child components
  useEffect(() => {
    const handleOpenPricingModal = () => {
      setShowPricingModal(true)
    }

    window.addEventListener('openPricingModal', handleOpenPricingModal)
    
    return () => {
      window.removeEventListener('openPricingModal', handleOpenPricingModal)
    }
  }, [])

  // Listen for usage refresh events from child components
  useEffect(() => {
    const handleRefreshUsage = () => {
      console.log('🔄 Refreshing usage after successful operation')
      loadUserUsage()
    }

    window.addEventListener('refreshUsage', handleRefreshUsage)
    
    return () => {
      window.removeEventListener('refreshUsage', handleRefreshUsage)
    }
  }, [loadUserUsage])

  // Handle successful payment (fallback for webhook issues in local development)
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!isSignedIn) return
      
      const urlParams = new URLSearchParams(window.location.search)
      const paymentStatus = urlParams.get('payment')
      const sessionId = urlParams.get('session_id')
      
      if (paymentStatus === 'success' && sessionId) {
        console.log('🔄 Payment success detected, updating usage...')
        
        try {
          const response = await fetch('/api/update-usage-after-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId })
          })
          
          if (response.ok) {
            const result = await response.json()
            console.log('✅ Usage updated successfully:', result)
            
            // Refresh user usage
            await loadUserUsage()
            
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname)
          } else {
            console.error('Failed to update usage after payment')
          }
        } catch (error) {
          console.error('Error updating usage after payment:', error)
        }
      }
    }
    
    handlePaymentSuccess()
  }, [isSignedIn, loadUserUsage])

  // Save current document to Supabase
  const saveCurrentDocument = useCallback(async () => {
    console.log('💾 Save button clicked')
    console.log('🔍 Checking save conditions:', {
      hasFile: !!uploadedFile,
      hasSummary: !!summary && summary.trim().length > 0,
      hasQuestions: questions.length > 0,
      userId: user?.id,
      demoMode
    })

    if (!uploadedFile || !summary || questions.length === 0) {
      console.log('❌ Save conditions not met')
      return
    }

    try {
      const documentData = {
        file_name: uploadedFile.name,
        summary,
        questions,
        demo_mode: demoMode,
        user_id: user?.id // Use Clerk user ID
      }

      console.log('📝 Attempting to save document:', documentData)
      const savedDoc = await saveDocument(documentData)
      console.log('💾 Save result:', savedDoc)
      
      if (savedDoc) {
        setSavedDocuments(prev => [savedDoc, ...prev])
        console.log('✅ Document saved successfully')
        
        // Show success notification
        setShowSaveSuccess(true)
        setTimeout(() => setShowSaveSuccess(false), 3000)
      } else {
        console.error('❌ Failed to save document - saveDocument returned null')
      }
    } catch (error) {
      console.error('❌ Error saving document:', error)
    }
  }, [uploadedFile, summary, questions, demoMode, user?.id])

  // Load a saved document
  const loadSavedDocument = useCallback((doc: SavedDocument) => {
    setSummary(doc.summary)
    setQuestions(doc.questions)
    setDemoMode(doc.demo_mode)
    setCurrentStep('edit')
    setShowHistory(false)
  }, [])

  // Delete a saved document
  const deleteSavedDocument = useCallback(async (id: string) => {
    try {
      const success = await deleteDocument(id)
      if (success) {
        setSavedDocuments(prev => prev.filter(doc => doc.id !== id))
      } else {
        console.error('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }, [])

  // Additional memoized handlers for inline functions
  const toggleDebug = useCallback(() => setShowDebug(!showDebug), [showDebug])
  const showHistoryModal = useCallback(() => setShowHistory(true), [])
  const hideHistoryModal = useCallback(() => setShowHistory(false), [])
  const toggleDemoMode = useCallback(() => setDemoMode(!demoMode), [demoMode])
  const handleSummaryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value)
  }, [])
  const handleQuestionChange = useCallback((index: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = value
    setQuestions(newQuestions)
  }, [questions])

  // Memoized handlers for document actions
  const handleLoadDocument = useCallback((doc: SavedDocument) => {
    return () => loadSavedDocument(doc)
  }, [loadSavedDocument])

  const handleDeleteDocument = useCallback((docId: string) => {
    return () => deleteSavedDocument(docId)
  }, [deleteSavedDocument])

  // TODO: Auth functions will be replaced with Clerk integration

  const exportAsText = useCallback(() => {
    setIsExporting(true)
    
    try {
      const content = [
        '=== STUDY HELPER EXPORT ===',
        '',
        'SUMMARY:',
        summary,
        '',
        'STUDY QUESTIONS:',
        ...questions.map((q, i) => `${i + 1}. ${q}`),
        '',
        `Generated on: ${new Date().toLocaleString()}`,
        `File: ${uploadedFile?.name || 'Unknown'}`
      ].join('\n')

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `study-helper-${uploadedFile?.name?.replace(/\.[^/.]+$/, '') || 'export'}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setTimeout(() => setIsExporting(false), 500)
    }
  }, [summary, questions, uploadedFile])

  const exportAsPDF = useCallback(async () => {
    setIsExporting(true)
    
    try {
      // Simple PDF export using browser print
      const printWindow = window.open('', '_blank')
      if (!printWindow) return

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Study Helper Export</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; }
            .title { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .subtitle { color: #666; margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
            .summary { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .question { margin-bottom: 15px; padding: 15px; background: #f0f9ff; border-radius: 8px; }
            .question-number { font-weight: bold; color: #2563eb; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            @media print {
              body { margin: 0; padding: 20px; }
              .header { margin-bottom: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">📚 Study Helper Export</div>
            <div class="subtitle">File: ${uploadedFile?.name || 'Unknown'}</div>
            <div class="subtitle">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="section">
            <div class="section-title">📝 Summary</div>
            <div class="summary">${summary}</div>
          </div>
          
          <div class="section">
            <div class="section-title">❓ Study Questions</div>
            ${questions.map((q, i) => `
              <div class="question">
                <span class="question-number">${i + 1}.</span> ${q}
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            Generated by StudyHelper - AI-Powered Document Analysis
          </div>
        </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.focus()
    
      // Small delay to ensure content is loaded
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    } finally {
      setTimeout(() => setIsExporting(false), 1000)
    }
  }, [summary, questions, uploadedFile])

  // Show maintenance mode if enabled (render inline to avoid hydration issues)
  if (maintenanceMode) {
    return <MaintenanceMode />
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading StudyHelper...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">StudyHelper</span>
        </div>
        
        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:text-white transition-colors"
          >
            {t.features}
          </button>
          <button onClick={showHistoryModal} className="hover:text-white transition-colors">
            {t.history} {savedDocuments.length > 0 && (
              <span className="ml-1 bg-green-500 text-black px-2 py-1 rounded-full text-xs font-medium">
                {savedDocuments.length}
              </span>
            )}
          </button>
          
          {/* Language Switcher */}
          <button 
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">
              {language === 'pt' ? 'PT' : 'EN'}
            </span>
          </button>
        </div>
        
        {/* Right Side - Auth & User Info */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              {/* Usage Display */}
              {userUsage && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-sm">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium">
                    {userUsage.uses_remaining === -1 
                      ? t.unlimited 
                      : `${userUsage.uses_remaining} ${t.uses}`}
                  </span>
                </div>
              )}
              
              {/* Plan Management Button */}
              {userUsage && userUsage.plan_type === 'unlimited' ? (
                <button 
                  onClick={handleManageSubscription}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  {t.manageplan}
                </button>
              ) : (
                <button 
                  onClick={() => setShowPricingModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors font-medium text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  {t.upgrade}
                </button>
              )}
              
              {/* What's Next Button */}
              <button 
                onClick={() => setShowNextStepsModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <Rocket className="w-4 h-4" />
                {t.whatsnext}
              </button>
              
              {/* User Button */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg text-sm">
                <UserButton />
                <div className="hidden sm:block">
                  <div className="text-xs text-gray-300">
                    {user.firstName || user.emailAddresses[0].emailAddress.split('@')[0]}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNextStepsModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <Rocket className="w-4 h-4" />
                {t.whatsnext}
              </button>
              <SignInButton mode="modal">
                <button className="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors font-medium text-sm">
                  {t.signin}
                </button>
              </SignInButton>
            </div>
          )}
        </div>
      </nav>

      {/* Status Messages */}
      {showStatusMessage && isLocalMode && (
        <div className="mb-4 max-w-4xl mx-auto px-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-200">{t.localMode}</span>
              </div>
              <button
                onClick={() => setShowStatusMessage(false)}
                className="text-yellow-400 hover:text-yellow-200 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusMessage && !isLocalMode && (
        <div className="mb-4 max-w-4xl mx-auto px-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-200">{t.cloudMode}</span>
              </div>
              <button
                onClick={() => setShowStatusMessage(false)}
                className="text-green-400 hover:text-green-200 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Similar to remove.bg */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {t.heroTitle}
          <br />
          <span className="text-green-400">{t.heroSubtitle}</span>
          <br />
          {t.heroTagline}
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
          {t.heroDescription}
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDemoMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  demoMode ? 'bg-blue-500' : 'bg-green-500'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    demoMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${
                  demoMode ? 'text-blue-300' : 'text-green-300'
                }`}>
                  {demoMode ? t.demoMode : t.openaiMode}
                </span>
                <span className={`text-xs ${
                  demoMode ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {demoMode ? t.demoModeDesc : t.openaiModeDesc}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Upload Area or CTA */}
        <div className="mb-16">
          {currentStep === 'upload' && (
            <div className="max-w-xl mx-auto">
              <FileUpload onFileUpload={handleFileUpload} language={language} />
            </div>
          )}
          
          {currentStep !== 'upload' && (
            <button
              onClick={resetApp}
              className="px-12 py-4 bg-green-500 text-black rounded-lg font-semibold text-lg hover:bg-green-400 transition-all duration-200 shadow-lg"
            >
              {t.startNewDocument}
            </button>
          )}
        </div>

        {/* Progress Steps - Cleaner */}
        {currentStep !== 'upload' && (
          <div className="flex justify-center mb-12">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all bg-green-500/20 text-green-300">
                  <Upload size={16} />
                  <span className="text-sm font-medium">{t.upload}</span>
                </div>
                <div className="w-6 h-0.5 bg-green-500"></div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  currentStep === 'extract' ? 'bg-green-500 text-black' : 
                  ['generate', 'edit'].includes(currentStep) ? 'bg-green-500/20 text-green-300' : 
                  'bg-gray-800 text-gray-400'
                }`}>
                  <FileText size={16} />
                  <span className="text-sm font-medium">{t.extract}</span>
                </div>
                <div className={`w-6 h-0.5 ${
                  ['generate', 'edit'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-600'
                }`}></div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  currentStep === 'generate' ? 'bg-green-500 text-black' : 
                  currentStep === 'edit' ? 'bg-green-500/20 text-green-300' : 
                  'bg-gray-800 text-gray-400'
                }`}>
                  <Sparkles size={16} />
                  <span className="text-sm font-medium">{t.generate}</span>
                </div>
                <div className={`w-6 h-0.5 ${
                  currentStep === 'edit' ? 'bg-green-500' : 'bg-gray-600'
                }`}></div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  currentStep === 'edit' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'
                }`}>
                  <Download size={16} />
                  <span className="text-sm font-medium">{t.export}</span>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Features Section - Similar to remove.bg's approach */}
      {currentStep === 'upload' && (
        <div id="features" className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-3">
              {t.featuresTitle}
            </h2>
            <p className="text-gray-400 text-lg">
              {t.featuresSubtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t.aiPoweredTitle}
              </h3>
              <p className="text-gray-400 text-sm">
                {t.aiPoweredDesc}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t.multipleFormatsTitle}
              </h3>
              <p className="text-gray-400 text-sm">
                {t.multipleFormatsDesc}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t.exportReadyTitle}
              </h3>
              <p className="text-gray-400 text-sm">
                {t.exportReadyDesc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trust Indicators - Cleaner */}
      {currentStep === 'upload' && (
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-3 uppercase tracking-wide">
              {t.trustedBy}
            </p>
            <div className="flex justify-center items-center gap-6 text-gray-600 text-sm">
              <span>{t.universities}</span>
              <span>•</span>
              <span>{t.highSchools}</span>
              <span>•</span>
              <span>{t.researchLabs}</span>
              <span>•</span>
              <span>{t.studyGroups}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        {/* Content Steps */}
        <div className="space-y-6">
          {currentStep === 'extract' && uploadedFile && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <TextExtraction 
                file={uploadedFile} 
                onTextExtracted={handleTextExtracted}
                demoMode={demoMode}
                language={language}
              />
            </div>
          )}

          {currentStep === 'generate' && extractedText && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <AIGeneration 
                text={extractedText} 
                onAIGenerated={handleAIGenerated}
                demoMode={demoMode}
                language={language}
              />
            </div>
          )}

          {currentStep === 'edit' && (
            <div className="space-y-6">
              {demoMode && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎭</span>
                    <div>
                      <p className="text-yellow-200 font-medium text-sm">{t.demoModeActive}</p>
                      <p className="text-yellow-300/80 text-xs">{t.demoModeContent}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{t.summary}</h3>
                <textarea
                  value={summary}
                  onChange={handleSummaryChange}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder={t.summaryPlaceholder}
                />
              </div>

              <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{t.studyQuestions}</h3>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-xs">
                          {index + 1}
                        </span>
                        <textarea
                          value={question}
                          onChange={(e) => handleQuestionChange(index, e.target.value)}
                          className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    onClick={resetApp}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                  >
                    Start Over
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={saveCurrentDocument}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
                    >
                      <Save size={16} />
                      {t.saveDocument}
                    </button>
                    <button 
                      onClick={exportAsText}
                      disabled={isExporting}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isExporting ? t.exportingTxt : t.exportAsTxt}
                    </button>
                    <button 
                      onClick={exportAsPDF}
                      disabled={isExporting}
                      className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isExporting ? t.exportingPdf : t.exportAsPdf}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Save Success Notification */}
      {showSaveSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
                      <div className="flex items-center gap-2 text-sm">
              <Save size={16} />
              <span>
                {language === 'pt' ? 'Documento salvo com sucesso!' : 'Document saved successfully!'}
              </span>
            </div>
        </div>
      )}
      
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">{t.savedDocuments}</h2>
                <button
                  onClick={hideHistoryModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle size={20} className="text-gray-600" />
                </button>
              </div>
                              <p className="text-gray-600 text-sm mt-1">
                  {savedDocuments.length} {language === 'pt' ? 'documentos salvos' : 'saved documents'}
                </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {savedDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={40} className="text-gray-400 mx-auto mb-3" />
                                      <p className="text-gray-500">{t.noDocuments}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {language === 'pt' ? 'Processe e salve seu primeiro documento para vê-lo aqui' : 'Process and save your first document to see it here'}
                    </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedDocuments.map((doc) => (
                    <div key={doc.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-1 text-sm">{doc.file_name}</h3>
                          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                            {doc.summary.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{doc.questions.length} {t.studyQuestions}</span>
                            {doc.demo_mode && (
                              <>
                                <span>•</span>
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">{t.demoMode}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={handleLoadDocument(doc)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                          >
                            <Eye size={12} />
                            {t.view}
                          </button>
                          <button
                            onClick={handleDeleteDocument(doc.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={12} />
                            {t.delete}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Pricing Modal */}
      <PricingModal 
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentUsage={userUsage ? {
          uses_remaining: userUsage.uses_remaining,
          plan_type: userUsage.plan_type
        } : undefined}
        onPaymentSuccess={() => {
          // Refresh user usage after payment
          loadUserUsage()
          setShowPricingModal(false)
        }}
        language={language}
      />
      
      {/* Next Steps Modal */}
      <NextStepsModal 
        isOpen={showNextStepsModal}
        onClose={() => setShowNextStepsModal(false)}
      />
    </div>
  )
} 