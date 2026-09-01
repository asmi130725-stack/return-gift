'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Event } from '@/types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface ModernCalendarProps {
  events: Event[]
  loading?: boolean
}

export default function ModernCalendar({ events, loading = false }: ModernCalendarProps) {
  const router = useRouter()
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null)

  const isCurrentMonthView = 
    selectedMonth === today.getMonth() && selectedYear === today.getFullYear()

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getEventForDate = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.find(event => {
      const eventDateStr = event.date instanceof Date ? event.date.toISOString().split('T')[0] : String(event.date)
      return eventDateStr.startsWith(dateStr)
    })
  }

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

  const resetToToday = () => {
    setSelectedMonth(today.getMonth())
    setSelectedYear(today.getFullYear())
  }

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  // Current month's events
  const currentMonthEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear
  })

  return (
    <div className="w-full space-y-4">
      {/* Main Calendar Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl shadow-pink-500/5 border border-pink-100/90 overflow-hidden"
      >
        {/* Soft Ambient Corner Glows */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-pink-200/40 to-rose-200/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-gradient-to-tr from-amber-200/30 to-pink-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Header / Month Navigation */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                {MONTHS[selectedMonth]}
              </h3>
              <span className="text-lg sm:text-xl font-semibold text-pink-600 font-sans">
                {selectedYear}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {currentMonthEvents.length === 1
                ? '1 memory this month'
                : `${currentMonthEvents.length} memories this month`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-pink-50/70 p-1 rounded-2xl border border-pink-100">
            {!isCurrentMonthView && (
              <button
                onClick={resetToToday}
                className="px-2.5 py-1 text-xs font-semibold text-pink-600 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"
              >
                Today
              </button>
            )}
            <button
              onClick={previousMonth}
              aria-label="Previous Month"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-white transition-all active:scale-90 shadow-none hover:shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              aria-label="Next Month"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-white transition-all active:scale-90 shadow-none hover:shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day Name Headers */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center">
          {DAYS.map((day, idx) => (
            <div
              key={day}
              className={`text-[11px] font-bold tracking-wider uppercase py-1 ${
                idx === 0 || idx === 6 ? 'text-rose-400' : 'text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {days.map(day => {
            const event = getEventForDate(day)
            const isToday =
              day === today.getDate() &&
              selectedMonth === today.getMonth() &&
              selectedYear === today.getFullYear()

            return (
              <div key={day} className="aspect-square relative">
                {event ? (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/scrapbook/${event.id}`)}
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    className={`
                      w-full h-full rounded-2xl flex flex-col items-center justify-center relative
                      bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white font-bold
                      shadow-md shadow-pink-500/25 ring-2
                      ${isToday ? 'ring-pink-300 ring-offset-2' : 'ring-pink-200/60'}
                      transition-shadow hover:shadow-lg hover:shadow-pink-500/40
                    `}
                  >
                    <span className="text-xs sm:text-sm">{day}</span>
                    <span className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-current animate-pulse" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </span>
                  </motion.button>
                ) : isToday ? (
                  <div className="w-full h-full rounded-2xl bg-pink-50/90 border-2 border-pink-400 text-pink-600 font-bold flex flex-col items-center justify-center relative shadow-sm">
                    <span className="text-xs sm:text-sm">{day}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-0.5" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-2xl bg-slate-50/70 hover:bg-pink-50/60 text-slate-700 hover:text-pink-600 font-medium text-xs sm:text-sm flex items-center justify-center transition-colors">
                    {day}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-pink-100/80 flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-[8px] shadow-sm">
              ♥
            </span>
            <span className="font-medium text-gray-600">Memory Saved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-pink-400 bg-pink-50" />
            <span className="font-medium text-gray-600">Today</span>
          </div>
        </div>
      </motion.div>

      {/* Hover / Month Memory Spotlight */}
      <AnimatePresence>
        {hoveredEvent && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="p-3 bg-pink-50/90 border border-pink-200 rounded-2xl flex items-center justify-between text-xs text-pink-900 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">💝</span>
              <div>
                <p className="font-bold text-gray-800">{hoveredEvent.title}</p>
                <p className="text-gray-500 text-[11px]">
                  {new Date(hoveredEvent.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-pink-600 underline">View Scrapbook →</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
