'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, SignInButton, SignUpButton, SignOutButton, UserButton } from '@clerk/nextjs'
import FileUpload from '@/components/FileUpload'
import TextExtraction from '@/components/TextExtraction'
import AIGeneration from '@/components/AIGeneration'
import PricingModal from '@/components/PricingModal'
import NextStepsModal from '@/components/NextStepsModal'
import MaintenanceMode from '@/components/MaintenanceMode'
import { FileText, Upload, BookOpen, Sparkles, Download, Save, History, Trash2, Calendar, Eye, User, AlertCircle, CheckCircle, XCircle, CreditCard, Zap, Rocket, Globe, Menu, X } from 'lucide-react'
import { SavedDocument, isLocalMode } from '@/lib/supabase'
import { saveDocument, getDocuments, deleteDocument, checkForDuplicateDocument, UserUsage } from '@/lib/database'
import { checkFreeTrialStatus, markFreeTrialUsed, clearFreeTrialFlag, canUseFreeTrial } from '@/lib/free-trial'
import DuplicateWarningModal from '@/components/DuplicateWarningModal'

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
    heroDescription: 'Carregue PDFs e imagens e obtenha resumos e questões de estudo com IA em segundos. Nenhum trabalho manual necessário.',
    
    // Mode toggle
    openaiMode: '🚀 MODO OPENAI',
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
    multipleFormatsDesc: 'Funciona com PDFs e imagens. Carregue e obtenha resultados instantaneamente',
    
    exportReadyTitle: 'Pronto para Exportar',
    exportReadyDesc: 'Exporte seus materiais de estudo como arquivos de texto ou PDFs. Perfeito para compartilhar e imprimir',
    
    // Trust indicators
    trustedBy: 'Utilizado por estudantes de',
    universities: 'Universidades',
    highSchools: 'Escolas Secundárias',
    researchLabs: 'Laboratórios de Pesquisa',
    studyGroups: 'Grupos de Estudo',
    
    // Edit section
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
    english: 'English',

    // Next Steps Modal
    nextSteps_title: 'O que vem a seguir?',
    nextSteps_subtitle: 'Novos recursos incríveis chegando ao StudyHelper',
    nextSteps_imageOCR_title: 'Reconhecimento de Imagens',
    nextSteps_imageOCR_desc: 'Processar imagens e documentos escaneados com OCR avançado',
    nextSteps_inDevelopment: 'Em desenvolvimento',
    nextSteps_imageOCR_feat1: 'Extrair texto de fotos',
    nextSteps_imageOCR_feat2: 'Suporte a JPG, PNG, GIF, WebP',
    nextSteps_imageOCR_feat3: 'Reconhecimento de alta precisão',
    nextSteps_imageOCR_feat4: 'Processamento via Google Cloud Vision',
    nextSteps_batch_title: 'Processamento em Lote',
    nextSteps_batch_desc: 'Carregue múltiplos documentos de uma vez',
    nextSteps_batch_feat1: 'Processar até 10 arquivos por vez',
    nextSteps_batch_feat2: 'Geração de resumos em massa',
    nextSteps_batch_feat3: 'Materiais de estudo combinados',
    nextSteps_batch_feat4: 'Exportar todos os resultados juntos',
    nextSteps_ai_title: 'Recursos Avançados de IA',
    nextSteps_ai_desc: 'Análise de documentos mais inteligente',
    nextSteps_ai_feat1: 'Resumos por disciplina',
    nextSteps_ai_feat2: 'Perguntas por dificuldade',
    nextSteps_ai_feat3: 'Agendas de estudo personalizadas',
    nextSteps_ai_feat4: 'Análise de lacunas de conhecimento',
    nextSteps_smart_title: 'Ferramentas de Estudo Inteligentes',
    nextSteps_smart_desc: 'Experiência de aprendizado personalizada',
    nextSteps_smart_feat1: 'Acompanhamento de progresso',
    nextSteps_smart_feat2: 'Repetição espaçada',
    nextSteps_smart_feat3: 'Análises de desempenho',
    nextSteps_smart_feat4: 'Lembretes de estudo',
    nextSteps_footer1: '🚀 Estamos trabalhando para trazer esses recursos',
    nextSteps_footer2: '✨ Fique ligado para novidades incríveis!',
    
    // Free trial messages
    freeTrialUsed: 'Você já usou sua avaliação gratuita',
    freeTrialSignupPrompt: 'Crie uma conta para continuar usando nossos recursos de IA!',
    freeTrialSignupButton: 'Criar Conta',
    freeTrialBenefits: 'Obtenha 3 usos gratuitos e desbloqueie todos os recursos',
    
    // Duplicate warning modal
    duplicateWarning_title: 'Documento Já Existe',
    duplicateWarning_subtitle: 'Detectamos um documento similar',
    duplicateWarning_message: 'Este documento parece ser similar a um que você já salvou. O que você gostaria de fazer?',
    duplicateWarning_existing: 'Documento Existente:',
    duplicateWarning_new: 'Novo Documento:',
    duplicateWarning_cancel: 'Cancelar',
    duplicateWarning_replace: 'Substituir'
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
    heroDescription: 'Upload PDFs and images and get AI-powered summaries and study questions in seconds. No manual work required.',
    
    // Mode toggle
    openaiMode: '🚀 OPENAI MODE',
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
    multipleFormatsDesc: 'Works with PDFs and images. Upload and get results instantly',
    
    exportReadyTitle: 'Export Ready',
    exportReadyDesc: 'Export your study materials as text files or PDFs. Perfect for sharing and printing',
    
    // Trust indicators
    trustedBy: 'Trusted by students at',
    universities: 'Universities',
    highSchools: 'High Schools',
    researchLabs: 'Research Labs',
    studyGroups: 'Study Groups',
    
    // Edit section
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
    english: 'English',

    // Next Steps Modal
    nextSteps_title: "What's Next?",
    nextSteps_subtitle: "Exciting features coming to your study helper",
    nextSteps_imageOCR_title: "Image Recognition",
    nextSteps_imageOCR_desc: "Process images and scanned documents with advanced OCR",
    nextSteps_inDevelopment: "In Development",
    nextSteps_imageOCR_feat1: "Extract text from photos",
    nextSteps_imageOCR_feat2: "Support for JPG, PNG, GIF, WebP",
    nextSteps_imageOCR_feat3: "High accuracy recognition",
    nextSteps_imageOCR_feat4: "Processing via Google Cloud Vision",
    nextSteps_batch_title: "Batch Processing",
    nextSteps_batch_desc: "Upload multiple documents at once",
    nextSteps_batch_feat1: "Process up to 10 files at once",
    nextSteps_batch_feat2: "Bulk summary generation",
    nextSteps_batch_feat3: "Combined study materials",
    nextSteps_batch_feat4: "Export all results together",
    nextSteps_ai_title: "Advanced AI Features",
    nextSteps_ai_desc: "More intelligent document analysis",
    nextSteps_ai_feat1: "Subject-specific summaries",
    nextSteps_ai_feat2: "Difficulty-based questions",
    nextSteps_ai_feat3: "Custom study schedules",
    nextSteps_ai_feat4: "Knowledge gap analysis",
    nextSteps_smart_title: "Smart Study Tools",
    nextSteps_smart_desc: "Personalized learning experience",
    nextSteps_smart_feat1: "Progress tracking",
    nextSteps_smart_feat2: "Spaced repetition",
    nextSteps_smart_feat3: "Performance analytics",
    nextSteps_smart_feat4: "Study reminders",
    nextSteps_footer1: "🚀 We're working hard to bring you these features",
    nextSteps_footer2: "✨ Stay tuned for exciting updates!",
    
    // Free trial messages
    freeTrialUsed: "You've used your free trial",
    freeTrialSignupPrompt: "Create an account to continue using our AI features!",
    freeTrialSignupButton: "Create Account",
    freeTrialBenefits: "Get 3 free uses and unlock all features",
    
    // Duplicate warning modal
    duplicateWarning_title: 'Document Already Exists',
    duplicateWarning_subtitle: 'We detected a similar document',
    duplicateWarning_message: 'This document appears to be similar to one you\'ve already saved. What would you like to do?',
    duplicateWarning_existing: 'Existing Document:',
    duplicateWarning_new: 'New Document:',
    duplicateWarning_cancel: 'Cancel',
    duplicateWarning_replace: 'Replace'
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
  
  // Free trial state
  const [freeTrialUsed, setFreeTrialUsed] = useState(false)
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false)
  
  // Duplicate detection state
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [duplicateDocument, setDuplicateDocument] = useState<SavedDocument | null>(null)
  
  // Language state
  const [language, setLanguage] = useState<'pt' | 'en'>('pt') // Default to Portuguese
  const t = translations[language]
  
  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Simplified maintenance mode check - only run on client
  useEffect(() => {


    // Check free trial status
    const freeTrialStatus = checkFreeTrialStatus()
    setFreeTrialUsed(freeTrialStatus.hasUsedFreeTrial)

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
    // Check free trial status before allowing upload
    const freeTrialStatus = checkFreeTrialStatus()
    console.log('🔍 File upload - Free trial status:', freeTrialStatus)
    
    if (!isSignedIn && freeTrialStatus.hasUsedFreeTrial) {
      console.log('❌ Free trial already used - should show signup prompt')
      setShowFreeTrialModal(true)
      return
    }
    
    setUploadedFile(file)
    setCurrentStep('extract')
  }, [isSignedIn])

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
    
    // Mark free trial as used if user is not signed in
    if (!isSignedIn && !freeTrialUsed) {
      markFreeTrialUsed()
      setFreeTrialUsed(true)
      console.log('✅ Free trial marked as used after AI generation')
    }
  }, [isSignedIn, freeTrialUsed])

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

  // Clear free trial flag when user signs up
  useEffect(() => {
    if (isSignedIn && freeTrialUsed) {
      clearFreeTrialFlag()
      setFreeTrialUsed(false)
      console.log('✅ User signed up - free trial flag cleared')
    }
  }, [isSignedIn, freeTrialUsed])

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

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

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

  // Perform the actual save operation
  const performSave = useCallback(async () => {
    try {
      const documentData = {
        file_name: uploadedFile!.name,
        summary,
        questions,
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
  }, [uploadedFile, summary, questions, user?.id])

  // Save current document to Supabase
  const saveCurrentDocument = useCallback(async () => {
    console.log('💾 Save button clicked')
    console.log('🔍 Current state:', {
      uploadedFile: uploadedFile?.name,
      summaryLength: summary?.length,
      questionsCount: questions?.length,
      isSignedIn,
      userId: user?.id,
      currentStep
    })
    console.log('🔍 Checking save conditions:', {
      hasFile: !!uploadedFile,
      hasSummary: !!summary && summary.trim().length > 0,
      hasQuestions: questions.length > 0,
      userId: user?.id
    })

    if (!uploadedFile || !summary || questions.length === 0) {
      console.log('❌ Save conditions not met')
      console.log('❌ Missing:', {
        file: !uploadedFile,
        summary: !summary,
        questions: questions.length === 0
      })
      return
    }

    if (!isSignedIn) {
      console.log('❌ User not signed in')
      return
    }

    try {
      // Check for duplicate documents first
      console.log('🔍 Checking for duplicate documents...')
      const duplicate = await checkForDuplicateDocument(summary, questions, user?.id)
      
      if (duplicate) {
        console.log('⚠️  Duplicate document found:', duplicate)
        setDuplicateDocument(duplicate)
        setShowDuplicateWarning(true)
        return
      }

      // No duplicate found, proceed with normal save
      console.log('✅ No duplicates found, proceeding with save...')
      await performSave()
    } catch (error) {
      console.error('❌ Error in save process:', error)
    }
  }, [uploadedFile, summary, questions, user?.id, performSave, isSignedIn, currentStep])

  // Handle duplicate replacement
  const handleReplaceDuplicate = useCallback(async () => {
    if (!duplicateDocument || !uploadedFile) return

    try {
      // Delete the existing document
      const deleteSuccess = await deleteDocument(duplicateDocument.id)
      if (!deleteSuccess) {
        console.error('❌ Failed to delete duplicate document')
        return
      }

      // Remove from local state
      setSavedDocuments(prev => prev.filter(doc => doc.id !== duplicateDocument.id))

      // Save the new document
      await performSave()

      // Close the modal
      setShowDuplicateWarning(false)
      setDuplicateDocument(null)

      console.log('✅ Duplicate document replaced successfully')
    } catch (error) {
      console.error('❌ Error replacing duplicate document:', error)
    }
  }, [duplicateDocument, uploadedFile, performSave])

  // Handle duplicate cancellation
  const handleCancelDuplicate = useCallback(() => {
    setShowDuplicateWarning(false)
    setDuplicateDocument(null)
    console.log('❌ Duplicate save cancelled by user')
  }, [])

  // Load a saved document
  const loadSavedDocument = useCallback((doc: SavedDocument) => {
    setSummary(doc.summary)
    setQuestions(doc.questions)
    
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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 max-w-7xl mx-auto w-full">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">StudyHelper</span>
        </div>

        {/* Center: Navigation Links (Desktop only) */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-3 py-1 rounded-lg text-gray-200 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {t.features}
          </button>
          <button
            onClick={showHistoryModal}
            className="px-3 py-1 rounded-lg text-gray-200 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-1"
          >
            {t.history}
            {savedDocuments.length > 0 && (
              <span className="ml-1 bg-green-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">{savedDocuments.length}</span>
            )}
          </button>
          <button
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            className="px-4 py-1.5 rounded-lg bg-gray-800 text-white font-bold flex items-center gap-2 shadow hover:bg-gray-700 transition-colors"
          >
            <Globe className="w-5 h-5" />
            {language === 'pt' ? 'PT' : 'EN'}
          </button>
        </div>

        {/* Right: Usage, Plan, Next Steps, Profile (Desktop only) */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {isSignedIn && userUsage && (
            <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-1.5">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-white font-semibold text-sm">{userUsage.uses_remaining === -1 ? t.unlimited : `${userUsage.uses_remaining} ${t.uses}`}</span>
              {userUsage.plan_type === 'unlimited' ? (
                <button
                  onClick={handleManageSubscription}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-400 transition-colors ml-2"
                >
                  {t.manageplan}
                </button>
              ) : (
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="px-3 py-1 bg-green-500 text-black rounded-lg text-sm font-semibold hover:bg-green-400 transition-colors ml-2"
                >
                  {t.upgrade}
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => setShowNextStepsModal(true)}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-base font-bold hover:bg-blue-500 transition-colors ml-2 flex items-center gap-2 shadow"
          >
            <Rocket className="w-5 h-5" />
            {t.whatsnext}
          </button>
          {!isSignedIn && (
            <SignInButton mode="modal">
              <button
                className="px-5 py-1.5 bg-green-500 text-black rounded-lg text-base font-bold hover:bg-green-400 transition-colors ml-2"
              >
                {t.signin}
              </button>
            </SignInButton>
          )}
          {isSignedIn && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg text-sm ml-2">
              <UserButton />
              <span className="text-white font-medium ml-1">{user?.username || user?.firstName}</span>
            </div>
          )}
        </div>

        {/* Right: Profile + Hamburger (Mobile only) */}
        <div className="flex md:hidden items-center gap-3 flex-shrink-0">
          {isSignedIn && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg text-sm">
              <UserButton />
            </div>
          )}
          {/* Hamburger menu - Mobile only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Usage Bar - Mobile only */}
      {isSignedIn && userUsage && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 animate-fade-in">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {userUsage.uses_remaining === -1 
                      ? t.unlimited 
                      : `${userUsage.uses_remaining} ${t.uses} ${t.usesLeft}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    {userUsage.plan_type === 'unlimited' ? t.unlimitedPlan : 'Current Plan'}
                  </div>
                </div>
              </div>
              {/* Quick action button */}
              {userUsage.plan_type === 'unlimited' ? (
                <button 
                  onClick={handleManageSubscription}
                  className="px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-lg text-sm font-medium border border-purple-600/30 hover:bg-purple-600/30 transition-all active:scale-95"
                >
                  {t.manageplan}
                </button>
              ) : (
                <button 
                  onClick={() => setShowPricingModal(true)}
                  className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium border border-green-500/30 hover:bg-green-500/30 transition-all active:scale-95"
                >
                  {t.upgrade}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Menu - Full Screen */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black animate-fade-in"
             onClick={() => setMobileMenuOpen(false)}>
          <div className="flex flex-col h-full w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">StudyHelper</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900/50">
              <div className="space-y-3">
                {/* Features */}
                <button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-4 w-full p-5 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-xl transition-all active:scale-95 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-xl font-semibold">{t.features}</span>
                </button>
                
                {/* History */}
                <button
                  onClick={() => {
                    showHistoryModal()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center justify-between w-full p-5 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-xl transition-all active:scale-95 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <History className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xl font-semibold">{t.history}</span>
                  </div>
                  {savedDocuments.length > 0 && (
                    <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                      {savedDocuments.length}
                    </span>
                  )}
                </button>
                
                {/* What's Next */}
                <button
                  onClick={() => {
                    setShowNextStepsModal(true)
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-4 w-full p-5 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-xl transition-all active:scale-95 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xl font-semibold">{t.whatsnext}</span>
                </button>
                
                {/* Language Switcher */}
                <button
                  onClick={() => {
                    setLanguage(language === 'pt' ? 'en' : 'pt')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center justify-between w-full p-5 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-xl transition-all active:scale-95 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-xl font-semibold">{t.language}</span>
                  </div>
                  <span className="text-lg text-gray-300 font-bold">
                    {language === 'pt' ? 'PT' : 'EN'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Bottom Section - User Actions */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
              <div className="space-y-3">
                {isSignedIn ? (
                  <>
                    {/* Plan Management */}
                    {userUsage && userUsage.plan_type === 'unlimited' ? (
                      <button 
                        onClick={() => {
                          handleManageSubscription()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center justify-center gap-3 w-full p-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all active:scale-95 font-semibold text-lg"
                      >
                        <CreditCard className="w-6 h-6" />
                        {t.manageplan}
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setShowPricingModal(true)
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center justify-center gap-3 w-full p-5 bg-green-500 text-black rounded-xl hover:bg-green-400 transition-all active:scale-95 font-semibold text-lg"
                      >
                        <CreditCard className="w-6 h-6" />
                        {t.upgrade}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <SignInButton mode="modal">
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full p-5 bg-green-500 text-black rounded-xl hover:bg-green-400 transition-all active:scale-95 font-semibold text-lg"
                      >
                        {t.signin}
                      </button>
                    </SignInButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {showStatusMessage && isLocalMode && (
        <div className="mb-3 md:mb-4 max-w-4xl mx-auto px-4 md:px-6">
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
        <div className="mb-3 md:mb-4 max-w-4xl mx-auto px-4 md:px-6">
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

      {/* Hero Section - Mobile Optimized */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-6 pt-4 md:pt-8 lg:pt-16 text-center">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {t.heroTitle}
          <br />
          <span className="text-green-400">{t.heroSubtitle}</span>
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl">{t.heroTagline}</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto">
          {t.heroDescription}
        </p>



        {/* Main Upload Area or CTA */}
        <div className="mb-8 md:mb-16">
          {currentStep === 'upload' && (
            <div className="max-w-xl mx-auto">
              <FileUpload onFileUpload={handleFileUpload} language={language} />
            </div>
          )}
          
          {currentStep !== 'upload' && (
            <button
              onClick={resetApp}
              className="px-8 sm:px-12 py-3 sm:py-4 bg-green-500 text-black rounded-lg font-semibold text-base sm:text-lg hover:bg-green-400 transition-all duration-200 shadow-lg"
            >
              {t.startNewDocument}
            </button>
          )}
        </div>

        {/* Progress Steps - Cleaner */}
        {currentStep !== 'upload' && (
          <div className="flex justify-center mb-12">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 max-w-full overflow-x-auto">
              <div className="flex items-center space-x-4 min-w-max">
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
                  <BookOpen size={16} />
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

      {/* Features Section - Mobile Optimized */}
      {currentStep === 'upload' && (
        <div id="features" className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 lg:py-16">
          <div className="text-center mb-6 md:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">
              {t.featuresTitle}
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              {t.featuresSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
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

      {/* Trust Indicators - Always at the bottom */}
      {currentStep === 'upload' && (
        <div className="w-full px-2 md:px-6 pb-6 md:pb-8">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-3 uppercase tracking-wide">
              {t.trustedBy}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-1 md:gap-4 text-gray-600 text-sm mt-2">
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
      <div className="flex-1 max-w-5xl mx-auto px-6 pb-8 w-full">
        {/* Content Steps */}
        <div className="space-y-6">
          {currentStep === 'extract' && uploadedFile && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <TextExtraction 
                file={uploadedFile} 
                onTextExtracted={handleTextExtracted}
                language={language}
                freeTrialUsed={freeTrialUsed}
              />
            </div>
          )}

          {currentStep === 'generate' && extractedText && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <AIGeneration 
                text={extractedText} 
                onAIGenerated={handleAIGenerated}
                language={language}
                freeTrialUsed={freeTrialUsed}
              />
            </div>
          )}

          {currentStep === 'edit' && (
            <div className="space-y-6">

              
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
                  <div className="flex flex-col items-end gap-2">
                    {!isSignedIn && (
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        💡 Crie uma conta para salvar documentos
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button 
                        onClick={saveCurrentDocument}
                        disabled={!isSignedIn}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors text-sm ${
                          isSignedIn 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        title={!isSignedIn ? 'Crie uma conta para salvar documentos' : ''}
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
      
      {/* Free Trial Modal */}
      {showFreeTrialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full border border-gray-700 relative">
            {/* Close button */}
            <button
              onClick={() => setShowFreeTrialModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-orange-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                {t.freeTrialUsed}
              </h2>
              
              <p className="text-gray-400 mb-6">
                {t.freeTrialSignupPrompt}
              </p>
              
              <div className="space-y-3">
                <SignUpButton mode="modal">
                  <button
                    onClick={() => setShowFreeTrialModal(false)}
                    className="w-full px-6 py-3 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors"
                  >
                    {t.freeTrialSignupButton}
                  </button>
                </SignUpButton>
                

              </div>
              
              <p className="text-gray-500 text-sm mt-4">
                {t.freeTrialBenefits}
              </p>
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
        t={t}
      />
      
      {/* Duplicate Warning Modal */}
      {duplicateDocument && (
        <DuplicateWarningModal
          isOpen={showDuplicateWarning}
          onClose={() => setShowDuplicateWarning(false)}
          onReplace={handleReplaceDuplicate}
          onCancel={handleCancelDuplicate}
          existingDocument={duplicateDocument}
          newFileName={uploadedFile?.name || ''}
          t={t}
        />
      )}
    </div>
  )
} 