'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MessageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

export function ApologyCard() {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [hasShownOnce, setHasShownOnce] = useState(false)

  // Check if card has been shown before on first load
  useEffect(() => {
    setIsClient(true)
    const hasShown = localStorage.getItem('apology-card-shown')
    if (!hasShown) {
      localStorage.setItem('apology-card-shown', 'true')
    }
    setHasShownOnce(true)
  }, [])

  // Only show message button on main page
  if (!isClient || pathname !== '/') return null
  
  return (
    <>
      {/* Message Button */}
      {hasShownOnce && (
        <Link href="/notifications">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 z-40 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
            title="View message"
          >
            <MessageIcon />
          </motion.button>
        </Link>
      )}
    </>
  )
}
