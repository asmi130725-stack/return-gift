'use client'

import { motion } from 'framer-motion'
import { SCRAPBOOK_TEMPLATES } from './ScrapbookLayout'

interface TemplateSelectorProps {
  selectedTemplate: string
  onSelectTemplate: (templateId: string) => void
  photoCount?: number
}

export default function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  photoCount = 0,
}: TemplateSelectorProps) {
  return (
    <div className="w-full">
      <div className="space-y-3">
        {SCRAPBOOK_TEMPLATES.map((template, index) => {
          const isSelected = selectedTemplate === template.id
          
          return (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectTemplate(template.id)}
              className={`
                relative w-full text-left p-4 rounded-xl
                transition-all flex items-center gap-4
                ${isSelected 
                  ? 'ring-2 ring-pink-500 shadow-lg bg-pink-50' 
                  : 'ring-1 ring-gray-200 bg-white'
                }
              `}
            >
              {/* Icon */}
              <div className="text-4xl flex-shrink-0">
                {template.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-0.5">
                  {template.name}
                </h3>
                <p className="text-xs text-gray-600 mb-1.5 line-clamp-2">
                  {template.description}
                </p>
                <div className={`
                  inline-block text-xs px-2 py-0.5 rounded-full
                  ${isSelected 
                    ? 'bg-pink-100 text-pink-700 font-medium' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {template.bestFor}
                </div>
              </div>
              
              {/* Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Preview hint */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Don't worry! You can change the template anytime 💕
        </p>
      </div>
    </div>
  )
}
