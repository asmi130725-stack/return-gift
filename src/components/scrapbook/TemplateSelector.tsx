'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { SCRAPBOOK_TEMPLATES } from './ScrapbookLayout'

interface TemplateSelectorProps {
  selectedTemplate: string
  onSelectTemplate: (templateId: string) => void
  photoCount?: number
}

export default function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SCRAPBOOK_TEMPLATES.map((template, index) => {
          const isSelected = selectedTemplate === template.id
          
          return (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => onSelectTemplate(template.id)}
              className={`
                relative text-left rounded-2xl overflow-hidden
                transition-all flex flex-col border-2 bg-white shadow-xs
                ${isSelected 
                  ? 'border-pink-500 ring-2 ring-pink-300 shadow-md scale-[1.02]' 
                  : 'border-gray-200 hover:border-pink-300 hover:shadow-sm'
                }
              `}
            >
              {/* Template Thumbnail Preview */}
              <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                <Image
                  src={template.imageSrc}
                  alt={template.name}
                  fill
                  className="object-contain p-1.5"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="p-2.5 bg-white border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-gray-900">
                  {template.name}
                </span>
                {isSelected && (
                  <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Preview hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          💡 You can change the template anytime from your memory view 💕
        </p>
      </div>
    </div>
  )
}
