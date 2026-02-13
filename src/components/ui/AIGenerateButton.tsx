'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface AIGenerateButtonProps {
  onGenerate: () => Promise<void>
  label?: string
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export default function AIGenerateButton({
  onGenerate,
  label = 'Generate with AI',
  icon,
  variant = 'primary',
  disabled = false,
}: AIGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleClick = async () => {
    if (isGenerating || disabled) return

    setIsGenerating(true)
    try {
      await onGenerate()
    } finally {
      setIsGenerating(false)
    }
  }

  const baseClasses = `
    relative overflow-hidden
    px-6 py-3 sm:px-8 sm:py-4
    rounded-full font-medium
    transition-all duration-200
    flex items-center justify-center gap-2
    min-h-[44px] min-w-[44px]
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-pink-500 to-rose-500
      text-white shadow-lg
      hover:shadow-xl hover:scale-105
      active:scale-95
    `,
    secondary: `
      bg-white text-gray-700 border-2 border-gray-300
      hover:border-pink-400 hover:text-pink-600
      active:scale-95
    `,
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={isGenerating || disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
      whileTap={{ scale: 0.95 }}
    >
      {/* Shimmer Effect */}
      {isGenerating && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Icon */}
      {isGenerating ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </motion.div>
      ) : (
        icon || (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        )
      )}

      {/* Label */}
      <span className="text-sm sm:text-base">
        {isGenerating ? 'Generating...' : label}
      </span>
    </motion.button>
  )
}
