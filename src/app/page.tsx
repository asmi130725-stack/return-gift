'use client'

import { useState, useEffect } from 'react'
import EventCard from '@/components/events/EventCard'
import { Event } from '@/types'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

export default function HomePage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
    
    // Refresh events when page becomes visible (when user comes back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchEvents()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  async function fetchEvents() {
    try {
      setLoading(true)
      const response = await fetch('/api/events', {
        headers: {
          'x-user-id': DEMO_USER_ID,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-center">
          <h1 className="text-2xl font-handwriting font-bold text-pink-600 text-center uppercase">
            Return Gift
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-handwriting text-gray-900 mb-1">
            Your Memories
          </h2>
          <p className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${events.length} beautiful moment${events.length !== 1 ? 's' : ''} captured`}
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/scrapbook/${event.id}`}>
                  <EventCard event={event} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              No memories yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first memory to get started
            </p>
            <Link
              href="/create"
              className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Create Memory
            </Link>
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-3 h-16">
          {/* Memories */}
          <button className="flex flex-col items-center justify-center gap-1 text-pink-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-xs font-medium">Memories</span>
          </button>

          {/* Create - Centered with circular button */}
          <div className="flex items-center justify-center">
            <Link
              href="/create"
              className="w-14 h-14 -mt-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>

          {/* Calendar */}
          <Link href="/calendar" className="flex flex-col items-center justify-center gap-1 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Calendar</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
