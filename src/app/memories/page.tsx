'use client'

import { useState, useEffect } from 'react'
import { Event } from '@/types'
import EventCard from '@/components/events/EventCard'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { fetchWithCache, preloadImages } from '@/lib/cache'

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

export default function MemoriesPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()

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
      const data = await fetchWithCache<{ events: Event[] }>('/api/events', {
        headers: {
          'x-user-id': DEMO_USER_ID,
        },
      })

      const loadedEvents = data.events || []
      setEvents(loadedEvents)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-16 flex flex-col">
      {/* Header - Centered Upper Tab */}
      <header className="bg-white/90 backdrop-blur-md border-b border-pink-100/80 sticky top-0 z-50 shrink-0 h-16">
        <div className="relative h-full px-4 sm:px-6 flex items-center justify-between max-w-6xl mx-auto">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🔖</span>
            <span className="text-2xl font-handwriting font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
              Bookmarks
            </span>
          </Link>

          {/* Centered Segmented Navigation Tab (Desktop) */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center bg-pink-100/70 p-1 rounded-full border border-pink-200/60 shadow-inner">
            <Link
              href="/"
              className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-full flex items-center gap-1.5 transition-all"
            >
              <span>📅</span>
              <span>Calendar</span>
            </Link>
            <Link
              href="/memories"
              className="px-4 py-1.5 text-xs font-bold text-pink-600 bg-white rounded-full shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>💝</span>
              <span>Memories</span>
            </Link>
            <Link
              href="/notifications"
              className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-full flex items-center gap-1.5 transition-all"
            >
              <span>💌</span>
              <span>Messages</span>
            </Link>
          </nav>

          {/* Right Action */}
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-4 py-2 rounded-full shadow-md shadow-pink-500/20 transition-all active:scale-95 text-center shrink-0"
          >
            <span className="text-sm font-bold leading-none -mt-0.5">+</span>
            <span>New Memory</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full flex-1">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-handwriting font-bold text-gray-900 mb-1">
              Your Memories
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {loading ? 'Loading moments...' : `${events.length} beautiful moment${events.length !== 1 ? 's' : ''} captured`}
            </p>
          </div>
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

        {/* Events Grid (1-Col on Mobile, 2-3 Col Grid on Desktop) */}
        {!loading && !error && events.length > 0 && (
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/scrapbook/${event.id}`} className="block h-full">
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
            className="text-center py-20 bg-white rounded-3xl border border-pink-100 p-8 max-w-md mx-auto"
          >
            <span className="text-4xl mb-3 block">📸</span>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No memories captured yet</h3>
            <p className="text-xs text-gray-500 mb-5">
              Start building your relationship scrapbook by creating your first memory together!
            </p>
            <Link
              href="/create"
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-md shadow-pink-500/20 hover:shadow-lg transition-all inline-block"
            >
              + Create First Memory
            </Link>
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-pink-100/80 z-50">
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
          {/* Calendar */}
          <Link href="/" className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-pink-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-medium">Calendar</span>
          </Link>

          {/* Memories - Active */}
          <button className="flex flex-col items-center justify-center gap-1 text-pink-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-[10px] font-semibold">Memories</span>
          </button>

          {/* Messages */}
          <Link href="/notifications" className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-pink-600 transition-colors">
            <span className="text-lg leading-none">💌</span>
            <span className="text-[10px] font-medium">Messages</span>
          </Link>

          {/* Create */}
          <Link href="/create" className="flex flex-col items-center justify-center gap-1 text-pink-600 hover:text-pink-700 transition-colors">
            <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[10px] font-medium">Create</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
