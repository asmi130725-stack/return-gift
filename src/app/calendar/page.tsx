'use client'

import { useState, useEffect } from 'react'
import { Event } from '@/types'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

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

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Check if a date has an event
  const getEventForDate = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.find(event => {
      const eventDateStr = event.date instanceof Date ? event.date.toISOString().split('T')[0] : event.date
      return eventDateStr.startsWith(dateStr)
    })
  }

  // Navigate months
  const previousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pb-20">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-handwriting text-gray-900 mb-1">
            Your Calendar
          </h2>
          <p className="text-sm text-gray-600">
            Moments captured in time
          </p>
        </motion.div>

        {/* Vintage Calendar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl shadow-xl p-4 border-4 border-amber-200"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%),
              repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.02) 10px, rgba(0,0,0,.02) 20px)
            `,
          }}
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-amber-300">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-amber-200 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-handwriting font-bold text-gray-800">
              {MONTHS[selectedMonth]} {selectedYear}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-amber-200 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-600 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty days */}
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Days with potential events */}
            {days.map(day => {
              const event = getEventForDate(day)
              const isToday = 
                day === currentDate.getDate() &&
                selectedMonth === currentDate.getMonth() &&
                selectedYear === currentDate.getFullYear()

              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: day * 0.01 }}
                  className="aspect-square"
                >
                  {event ? (
                    <button
                      onClick={() => router.push(`/scrapbook/${event.id}`)}
                      className={`
                        w-full h-full bg-white rounded-lg shadow-md
                        border-2 transition-all relative
                        hover:scale-105 hover:shadow-lg
                        ${isToday ? 'border-pink-500' : 'border-amber-300'}
                      `}
                    >
                      <span className={`
                        text-sm font-semibold
                        ${isToday ? 'text-pink-600' : 'text-gray-800'}
                      `}>
                        {day}
                      </span>
                      {/* Heart indicator */}
                      <div className="absolute bottom-0.5 right-0.5">
                        <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                    </button>
                  ) : (
                    <div className={`
                      w-full h-full flex items-center justify-center rounded-lg
                      ${isToday ? 'bg-pink-100 border-2 border-pink-500 font-bold text-pink-600' : 'text-gray-600'}
                    `}>
                      <span className="text-sm">{day}</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600"
        >
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Memory</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span>Today</span>
          </div>
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-3 h-16">
          {/* Calendar - Active */}
          <button className="flex flex-col items-center justify-center gap-1 text-pink-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Calendar</span>
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

          {/* Memories */}
          <Link href="/" className="flex flex-col items-center justify-center gap-1 text-gray-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-xs font-medium">Memories</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
