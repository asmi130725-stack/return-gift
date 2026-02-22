'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

export function ApologyCard() {
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

  // Only show notification button if card has been shown at least once
  if (!isClient) return null
  
  return (
    <>
      {/* Notification Button */}
      {hasShownOnce && (
        <Link href="/notifications">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 z-40 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:shadow-xl"
            title="View notifications"
          >
            <BellIcon />
          </motion.button>
        </Link>
      )}
    </>
  )
}
