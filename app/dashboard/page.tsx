'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Crown, User, Calendar, RefreshCw, CreditCard, Rocket } from 'lucide-react'
import { PRICING_PLANS } from '@/lib/database'
import PricingModal from '@/components/PricingModal'
import NextStepsModal from '@/components/NextStepsModal'

// Language translations (copy from app/page.tsx)
const translations = {
  pt: {
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
    // ... (copy all other keys from app/page.tsx, including Next Steps Modal keys)
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
    // ... (copy all other keys from app/page.tsx, including Next Steps Modal keys)
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

interface UserUsage {
  uses_remaining: number
  plan_type: 'free' | 'starter' | 'pro' | 'unlimited'
  plan_expires_at: string | null
  created_at: string
}

export default function Dashboard() {
  const { user } = useUser()
  const [usage, setUsage] = useState<UserUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showNextStepsModal, setShowNextStepsModal] = useState(false)
  const [language, setLanguage] = useState<'pt' | 'en'>('pt') // Default to Portuguese
  const t = translations[language]

  useEffect(() => {
    if (user) {
      fetchUsage()
    }
  }, [user])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/user-usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUsage = () => {
    setLoading(true)
    fetchUsage()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h1>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const currentPlan = usage ? PRICING_PLANS[usage.plan_type] : PRICING_PLANS.free
  const isUnlimited = usage?.plan_type === 'unlimited'
  const planExpired = usage?.plan_expires_at && new Date(usage.plan_expires_at) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
          <button
            onClick={refreshUsage}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            title="Refresh usage data"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="text-yellow-400" size={24} />
              <h2 className="text-xl font-bold">Current Plan</h2>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-white">
                  {isUnlimited ? 'Unlimited Plan' : 'Usage Credits'}
                </span>
                {isUnlimited && (
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-gray-400 mb-4">
                {isUnlimited ? currentPlan.description : 'Purchase usage credits to continue using the app'}
              </p>

              {/* Usage Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Uses Remaining:</span>
                  <span className="font-bold text-lg">
                    {usage?.uses_remaining === -1 ? (
                      <span className="text-green-400">Unlimited</span>
                    ) : (
                      <span className={usage?.uses_remaining === 0 ? 'text-red-400' : 'text-green-400'}>
                        {usage?.uses_remaining || 0}
                      </span>
                    )}
                  </span>
                </div>

                {usage?.plan_expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Plan Expires:</span>
                    <span className={`font-medium ${planExpired ? 'text-red-400' : 'text-blue-400'}`}>
                      {new Date(usage.plan_expires_at).toLocaleDateString()}
                      {planExpired && ' (Expired)'}
                    </span>
                  </div>
                )}

                {usage?.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Member Since:</span>
                    <span className="text-gray-400">
                      {new Date(usage.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPricingModal(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                {isUnlimited ? 'Manage Plan' : 'Buy Credits'}
              </button>
              <button
                onClick={() => setShowNextStepsModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Rocket size={20} />
                {t.whatsnext}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Back to App
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="font-bold mb-2 text-green-400">Plan Benefits</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  AI-powered summaries
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  PDF & image support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Study questions generation
                </li>
                {isUnlimited && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Priority processing
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="font-bold mb-2 text-blue-400">Usage Tips</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Upload clear, high-quality documents</li>
                <li>• Use PDF format or clear images for best results</li>
                <li>• Check your usage regularly</li>
                <li>• Upgrade for unlimited access</li>
              </ul>
            </div>

            {(usage?.uses_remaining === 0 || planExpired) && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
                <h3 className="font-bold mb-2 text-red-400">Action Required</h3>
                <p className="text-sm text-gray-300 mb-3">
                  {planExpired ? 'Your plan has expired.' : 'You\'ve used all your credits.'}
                  {' '}Upgrade to continue using the app.
                </p>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentUsage={usage ? {
          uses_remaining: usage.uses_remaining,
          plan_type: usage.plan_type
        } : undefined}
        onPaymentSuccess={() => {
          setShowPricingModal(false)
          refreshUsage()
        }}
        language="pt"
      />
      
      {/* Next Steps Modal */}
      <NextStepsModal 
        isOpen={showNextStepsModal}
        onClose={() => setShowNextStepsModal(false)}
        t={t}
      />
    </div>
  )
} 