'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  language?: 'pt' | 'en'
}

const translations = {
  pt: {
    selectValidFile: 'Por favor, selecione um arquivo válido',
    uploadFile: 'Por favor, carregue um arquivo PDF ou imagem (JPG, PNG)',
    fileSizeLimit: 'O tamanho do arquivo deve ser inferior a 4.5MB',
    dropFileHere: 'Solte seu arquivo aqui',
    uploadDocument: 'Carregue seu documento',
    dragDropText: 'Arraste e solte ou clique para selecionar • PDF ou Imagens • Máx 4.5MB',
    pdfSupported: 'PDF',
    imagesSupported: 'Imagens (OCR)'
  },
  en: {
    selectValidFile: 'Please select a valid file',
    uploadFile: 'Please upload a PDF file or image (JPG, PNG)',
    fileSizeLimit: 'File size must be less than 4.5MB',
    dropFileHere: 'Drop your file here',
    uploadDocument: 'Upload your document',
    dragDropText: 'Drag & drop or click to select • PDF or Images • Max 4.5MB',
    pdfSupported: 'PDF',
    imagesSupported: 'Images (OCR)'
  }
}

export default function FileUpload({ onFileUpload, language = 'pt' }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState<string>('')
  const t = translations[language]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('')
    
    if (acceptedFiles.length === 0) {
      setError(t.selectValidFile)
      return
    }

    const file = acceptedFiles[0]
    
    // Validate file type - PDFs and images supported
    const isPDF = file.type === 'application/pdf'
    const isImage = file.type.startsWith('image/')
    
    if (!isPDF && !isImage) {
      setError(t.uploadFile)
      return
    }

    // Validate file size (4.5MB limit)
    const maxSize = 4.5 * 1024 * 1024
    if (file.size > maxSize) {
      setError(t.fileSizeLimit)
      return
    }

    onFileUpload(file)
  }, [onFileUpload, t])

  const { getRootProps, getInputProps, isDragActive: dropzoneIsDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false)
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragActive || dropzoneIsDragActive
            ? 'border-green-400 bg-green-500/10 scale-105'
            : 'border-gray-600 bg-gray-900/50 hover:border-green-500/50 hover:bg-gray-800/50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-lg transition-all duration-300 ${
            isDragActive || dropzoneIsDragActive
              ? 'bg-green-500 text-black'
              : 'bg-gray-800 text-green-400'
          }`}>
            <Upload size={32} />
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              {isDragActive || dropzoneIsDragActive
                ? t.dropFileHere
                : t.uploadDocument}
            </h3>
            <p className="text-gray-400">
              {t.dragDropText}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1 bg-gray-800 text-green-400 px-3 py-1 rounded">
              <FileText size={14} />
              <span>{t.pdfSupported}</span>
            </div>
            <div className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded border border-blue-500/30">
              <Image size={14} />
              <span>{t.imagesSupported}</span>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
          <X size={16} className="text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}
    </div>
  )
} 