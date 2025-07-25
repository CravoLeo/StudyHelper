'use client'

import { X, AlertTriangle, RefreshCw } from 'lucide-react'
import { SavedDocument } from '@/lib/supabase'

interface DuplicateWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onReplace: () => void
  onCancel: () => void
  existingDocument: SavedDocument
  newFileName: string
  t: any // translation object
}

export default function DuplicateWarningModal({ 
  isOpen, 
  onClose, 
  onReplace, 
  onCancel, 
  existingDocument, 
  newFileName,
  t 
}: DuplicateWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-yellow-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t.duplicateWarning_title}</h2>
              <p className="text-gray-400 text-sm">{t.duplicateWarning_subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            {t.duplicateWarning_message}
          </p>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="font-medium text-white mb-2">{t.duplicateWarning_existing}</h3>
            <p className="text-gray-400 text-sm">{existingDocument.file_name}</p>
            <p className="text-gray-500 text-xs mt-1">
              {new Date(existingDocument.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700 mt-3">
            <h3 className="font-medium text-blue-400 mb-2">{t.duplicateWarning_new}</h3>
            <p className="text-gray-300 text-sm">{newFileName}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {t.duplicateWarning_cancel}
          </button>
          <button
            onClick={onReplace}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            {t.duplicateWarning_replace}
          </button>
        </div>
      </div>
    </div>
  )
} 