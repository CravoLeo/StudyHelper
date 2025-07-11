'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('')
    
    if (acceptedFiles.length === 0) {
      setError('Please select a valid PDF file')
      return
    }

    const file = acceptedFiles[0]
    
    // Validate file type - only PDFs supported
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file. Image OCR is currently unavailable - try converting your image to PDF first.')
      return
    }

    // Validate file size (15MB limit)
    const maxSize = 15 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 15MB')
      return
    }

    onFileUpload(file)
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive: dropzoneIsDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
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
                ? 'Drop your file here'
                : 'Upload your document'}
            </h3>
            <p className="text-gray-400">
              Drag & drop or click to select • PDF only • Max 15MB
            </p>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1 bg-gray-800 text-green-400 px-3 py-1 rounded">
              <FileText size={14} />
              <span>PDF Only</span>
            </div>
            <div className="flex items-center space-x-1 bg-gray-700 text-gray-400 px-3 py-1 rounded">
              <Image size={14} />
              <span>Images: Convert to PDF</span>
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