'use client'


import { X, FileStack, Brain, Target } from 'lucide-react'

interface NextStepsModalProps {
  isOpen: boolean
  onClose: () => void
  t: any // translation object
}

interface Feature {
  id: string
  title: string
  description: string
  icon: any
  color: string
  status?: string
  features: string[]
}

export default function NextStepsModal({ isOpen, onClose, t }: NextStepsModalProps) {
  if (!isOpen) return null

  const upcomingFeatures: Feature[] = [
    {
      id: 'batch-processing',
      title: t.nextSteps_batch_title,
      description: t.nextSteps_batch_desc,
      icon: FileStack,
      color: 'green',
      status: t.nextSteps_inDevelopment,
      features: [
        t.nextSteps_batch_feat1,
        t.nextSteps_batch_feat2,
        t.nextSteps_batch_feat3,
        t.nextSteps_batch_feat4
      ]
    },
    {
      id: 'advanced-ai',
      title: t.nextSteps_ai_title,
      description: t.nextSteps_ai_desc,
      icon: Brain,
      color: 'purple',
      features: [
        t.nextSteps_ai_feat1,
        t.nextSteps_ai_feat2,
        t.nextSteps_ai_feat3,
        t.nextSteps_ai_feat4
      ]
    },
    {
      id: 'smart-study',
      title: t.nextSteps_smart_title,
      description: t.nextSteps_smart_desc,
      icon: Target,
      color: 'orange',
      features: [
        t.nextSteps_smart_feat1,
        t.nextSteps_smart_feat2,
        t.nextSteps_smart_feat3,
        t.nextSteps_smart_feat4
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        border: 'border-blue-500/50',
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      green: {
        border: 'border-green-500/50',
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        button: 'bg-green-600 hover:bg-green-700'
      },
      purple: {
        border: 'border-purple-500/50',
        bg: 'bg-purple-500/20',
        text: 'text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      orange: {
        border: 'border-orange-500/50',
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700'
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getStatusColor = (status: string) => {
    if (status === '✅ Available Now') {
      return 'bg-green-500/20 text-green-400'
    }
    return 'bg-blue-500/20 text-blue-400'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">{t.nextSteps_title}</h2>
            <p className="text-gray-400 mt-1">{t.nextSteps_subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingFeatures.map((feature) => {
            const colors = getColorClasses(feature.color)
            const IconComponent = feature.icon
            
            return (
              <div
                key={feature.id}
                className={`bg-gray-800/50 rounded-xl p-6 border ${colors.border} relative`}
              >
                {feature.status && (
                  <div className={`absolute -top-3 left-6 ${getStatusColor(feature.status)} px-3 py-1 rounded-full`}>
                    <span className={`text-xs font-medium ${colors.text}`}>
                      {feature.status}
                    </span>
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}>
                    <IconComponent className={colors.text} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {feature.features.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                      <div className={`w-1.5 h-1.5 ${colors.bg} rounded-full`}></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>{t.nextSteps_footer1}</p>
          <p>{t.nextSteps_footer2}</p>
        </div>
      </div>
    </div>
  )
} 