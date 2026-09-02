'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Event } from '@/types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MOOD_EMOJIS: Record<string, string> = {
  romantic: '💖',
  playful: '🎉',
  nostalgic: '☕',
  adventurous: '🚀',
  joyful: '✨',
  peaceful: '🌿',
}

interface ModernCalendarProps {
  events: Event[]
  loading?: boolean
}

export default function ModernCalendar({ events, loading = false }: ModernCalendarProps) {
  const router = useRouter()
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate())

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
    setSelectedDay(today.getDate())
  }

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const selectedEvent = selectedDay ? getEventForDate(selectedDay) : null
  const formatSelectedDate = (includeYear = false) => {
    const d = new Date(selectedYear, selectedMonth, selectedDay)
    const dayName = DAYS[d.getDay()]
    const monthName = MONTHS[selectedMonth].slice(0, 3)
    return includeYear ? `${dayName}, ${monthName} ${selectedDay}, ${selectedYear}` : `${dayName}, ${monthName} ${selectedDay}`
  }

  return (
    <div className="w-full space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 lg:items-start">
      {/* Calendar Card Container (Left on desktop, wider horizontal) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 lg:p-5 lg:pb-3.5 shadow-lg shadow-pink-500/5 border border-pink-100 lg:col-span-8"
      >
        {/* Header: Month & Navigation */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-100/70">
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {MONTHS[selectedMonth]}
              </h3>
              <span className="text-base font-bold text-pink-600">
                {selectedYear}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              {events.filter(e => new Date(e.date).getMonth() === selectedMonth && new Date(e.date).getFullYear() === selectedYear).length} memories recorded
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-pink-50/80 p-1 rounded-2xl border border-pink-100">
            {!isCurrentMonthView && (
              <button
                onClick={resetToToday}
                className="px-2 py-1 text-[11px] font-bold text-pink-600 hover:bg-white rounded-xl transition-all"
              >
                Today
              </button>
            )}
            <button
              onClick={previousMonth}
              aria-label="Previous Month"
              className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-white transition-all active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              aria-label="Next Month"
              className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day Name Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 text-center">
          {DAYS.map((day, idx) => (
            <div
              key={day}
              className={`text-[11px] font-bold uppercase tracking-wider py-0.5 select-none ${
                idx === 0 || idx === 6 ? 'text-rose-500 font-extrabold' : 'text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-2">
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="aspect-square sm:aspect-[1.15/1] lg:aspect-[1.35/1]" />
          ))}

          {days.map(day => {
            const event = getEventForDate(day)
            const isToday =
              day === today.getDate() &&
              selectedMonth === today.getMonth() &&
              selectedYear === today.getFullYear()
            const isSelected = selectedDay === day

            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedDay(day)}
                className={`
                  aspect-square sm:aspect-[1.15/1] lg:aspect-[1.35/1] rounded-xl relative flex flex-col items-center justify-center transition-all
                  ${
                    event
                      ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white font-bold shadow-md shadow-pink-500/25 ring-2 ring-pink-300'
                      : isToday
                      ? 'bg-pink-50 border-2 border-pink-500 text-pink-600 font-extrabold shadow-sm'
                      : isSelected
                      ? 'bg-pink-100 text-pink-900 font-bold border-2 border-pink-300'
                      : 'bg-slate-50/70 hover:bg-pink-50/80 text-gray-700 hover:text-pink-600 font-medium'
                  }
                `}
              >
                <span className="text-xs sm:text-sm font-semibold">{day}</span>

                {/* Event Heart Icon */}
                {event && (
                  <span className="absolute bottom-1 right-1.5">
                    <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </span>
                )}

                {/* Today Dot */}
                {isToday && !event && (
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-0.5" />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-2.5 border-t border-pink-100/70 flex items-center justify-center gap-5 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-[8px] shadow-sm">
              ♥
            </span>
            <span className="font-semibold text-gray-700">Memory Saved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-pink-500 bg-pink-50" />
            <span className="font-semibold text-gray-700">Today</span>
          </div>
        </div>
      </motion.div>

      {/* Selected Day Spotlight Preview Card (Right Column on Desktop) */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
        <AnimatePresence mode="wait">
          {selectedEvent ? (
            <motion.div
              key={`event-${selectedEvent.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-200 shadow-md shadow-pink-500/5 relative"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p suppressHydrationWarning className="text-[11px] font-semibold text-pink-600 uppercase tracking-wide">
                    {formatSelectedDate(true)}
                  </p>
                  <h4 className="text-lg font-bold text-gray-900">
                    {selectedEvent.title}
                  </h4>
                </div>
                <span className="text-xs bg-pink-50 border border-pink-200 text-pink-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 shrink-0">
                  <span>{MOOD_EMOJIS[selectedEvent.mood || 'romantic'] || '💖'}</span>
                  <span className="capitalize">{selectedEvent.mood || 'Memory'}</span>
                </span>
              </div>

              {selectedEvent.notes && (
                <p className="text-xs text-gray-600 italic bg-pink-50/50 p-3 rounded-2xl border border-pink-100 mb-4 leading-relaxed font-serif">
                  "{selectedEvent.notes}"
                </p>
              )}

              <button
                onClick={() => router.push(`/scrapbook/${selectedEvent.id}`)}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-500/20 hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>📖 Open Scrapbook</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${selectedDay}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 border border-pink-100 shadow-sm flex items-center justify-between gap-4"
            >
              <div>
                <p suppressHydrationWarning className="text-[11px] font-semibold text-gray-400">
                  {formatSelectedDate(false)}
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-800">
                  No memories recorded yet
                </p>
              </div>

              <Link
                href="/create"
                className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 leading-none"
              >
                <span>+ Add Memory</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
