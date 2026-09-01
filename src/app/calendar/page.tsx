'use client'

import { useState, useEffect } from 'react'
import { Event } from '@/types'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ModernCalendar from '@/components/calendar/ModernCalendar'

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/70 via-pink-50/30 to-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="px-4 py-3.5 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <h1 className="text-2xl font-handwriting font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
              Return Gift
            </h1>
          </div>
          <Link
            href="/create"
            className="text-xs font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-full transition-colors"
          >
            + New Memory
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-5 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-handwriting font-bold text-gray-900">
              Your Memory Calendar
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Every day with you is a gift
            </p>
          </div>
        </motion.div>

        {/* Modern Calendar */}
        <ModernCalendar events={events} loading={loading} />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-pink-100/80 z-50">
        <div className="grid grid-cols-3 h-16 max-w-lg mx-auto">
          {/* Calendar - Active */}
          <button className="flex flex-col items-center justify-center gap-1 text-pink-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[11px] font-semibold">Calendar</span>
          </button>

          {/* Create - Centered Floating Pill Button */}
          <div className="flex items-center justify-center">
            <Link
              href="/create"
              aria-label="Create new memory"
              className="w-13 h-13 -mt-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full shadow-lg shadow-pink-500/30 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>

          {/* Memories */}
          <Link href="/memories" className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-pink-600 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-[11px] font-medium">Memories</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
