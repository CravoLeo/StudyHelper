import React from 'react'

export default function MaintenanceMode() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            StudyHelper
          </h1>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          We're Getting Ready! 🚀
        </h2>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          StudyHelper is currently under maintenance as we prepare an amazing experience for you. 
          We're setting up secure payments and adding final touches.
        </p>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Coming Soon:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>📄 AI-powered document analysis</li>
            <li>📝 Smart study summaries</li>
            <li>❓ Intelligent question generation</li>
            <li>💳 Secure payment processing</li>
          </ul>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>Expected launch: <strong>Soon</strong></p>
          <p className="mt-2">
            Questions? Contact us at{' '}
            <a href="mailto:support@studyhelper.com" className="text-blue-600 hover:underline">
              support@studyhelper.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 