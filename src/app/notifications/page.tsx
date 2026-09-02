'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface MessageItem {
  id: string
  title: string
  content: string
  color: string
  createdAt?: string
}

const COLOR_OPTIONS = [
  { label: 'Rose Pink', value: 'from-rose-500 to-pink-600' },
  { label: 'Sunset Coral', value: 'from-pink-500 to-orange-400' },
  { label: 'Lavender Violet', value: 'from-purple-500 to-pink-500' },
  { label: 'Ruby Red', value: 'from-red-500 to-rose-600' },
]

export default function NotificationsPage() {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].value)

  // Load messages from Supabase API & localStorage fallback
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch('/api/messages')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.messages)) {
            setMessages(data.messages)
            localStorage.setItem('user_apology_messages', JSON.stringify(data.messages))
            if (data.messages.length > 0) {
              setExpandedId(data.messages[0].id)
            }
            return
          }
        }
      } catch (e) {
        console.warn('Could not fetch remote messages, falling back to local:', e)
      }

      // Local storage fallback
      try {
        const saved = localStorage.getItem('user_apology_messages')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setMessages(parsed)
            if (parsed.length > 0) {
              setExpandedId(parsed[0].id)
            }
          }
        }
      } catch (e) {
        console.error('Error loading messages from cache:', e)
      }
    }

    loadMessages()
  }, [])

  // Save to localStorage & state
  const saveMessages = (updated: MessageItem[]) => {
    setMessages(updated)
    try {
      localStorage.setItem('user_apology_messages', JSON.stringify(updated))
    } catch (e) {
      console.error('Error saving messages:', e)
    }
  }

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    const tempId = `msg-${Date.now()}`
    const newMessage: MessageItem = {
      id: tempId,
      title: newTitle.trim(),
      content: newContent.trim(),
      color: newColor,
      createdAt: new Date().toISOString(),
    }

    // Optimistic UI update
    const updated = [newMessage, ...messages]
    saveMessages(updated)
    setNewTitle('')
    setNewContent('')
    setIsAdding(false)
    setExpandedId(newMessage.id)

    // Save to Supabase API
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMessage.title,
          content: newMessage.content,
          color: newMessage.color,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.message && data.message.id) {
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: data.message.id } : m))
        }
      }
    } catch (err) {
      console.warn('Saved locally, remote sync pending:', err)
    }
  }

  const handleDeleteMessage = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const updated = messages.filter((m) => m.id !== id)
    saveMessages(updated)
    if (expandedId === id) {
      setExpandedId(updated[0]?.id || null)
    }

    if (!id.startsWith('msg-')) {
      try {
        await fetch(`/api/messages?id=${id}`, { method: 'DELETE' })
      } catch (err) {
        console.warn('Could not delete from server:', err)
      }
    }
  }

  const activeMessage = messages.find((m) => m.id === expandedId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/80 via-pink-50/40 to-slate-50 pb-24 md:pb-12">
      {/* Header - Unified Desktop & Mobile */}
      {/* Header - Centered Upper Tab */}
      <header className="bg-white/90 backdrop-blur-md border-b border-pink-100/80 sticky top-0 z-50 shrink-0 h-16">
        <div className="relative h-full px-4 sm:px-6 flex items-center justify-between max-w-6xl mx-auto">
          {/* Brand - Always Bookmarks */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="p-1.5 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors md:hidden"
              title="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🔖</span>
              <span className="text-2xl font-handwriting font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
                Bookmarks
              </span>
            </Link>
          </div>

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
              className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-full flex items-center gap-1.5 transition-all"
            >
              <span>💝</span>
              <span>Memories</span>
            </Link>
            <Link
              href="/notifications"
              className="px-4 py-1.5 text-xs font-bold text-pink-600 bg-white rounded-full shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>💌</span>
              <span>Messages</span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/create"
              className="hidden lg:inline-flex items-center justify-center text-xs font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100 px-3.5 py-1.5 rounded-full border border-pink-200 transition-all"
            >
              + New Memory
            </Link>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all"
              title="Write new letter"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Write Note</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Responsive Dual Viewport */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Messages List (Full on Mobile, 5 Cols on Desktop) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                All Letters ({messages.length})
              </h2>
            </div>

            {messages.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 text-center border border-pink-100 shadow-sm space-y-3">
                <span className="text-4xl block">💌</span>
                <h3 className="text-base font-bold text-gray-800">No notes written yet</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Write your first apology note, secret letter, or loving message here.
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-md shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  + Write First Note
                </button>
              </div>
            ) : (
              messages.map((notif) => {
                const isSelected = expandedId === notif.id
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                  >
                    <button
                      onClick={() => {
                        setExpandedId(notif.id)
                        setIsAdding(false)
                      }}
                      className="w-full text-left"
                    >
                      <div
                        className={`bg-gradient-to-r ${notif.color} rounded-2xl p-4 sm:p-5 shadow-md transition-all text-white relative overflow-hidden ${
                          isSelected ? 'ring-4 ring-pink-300 shadow-xl scale-[1.01]' : 'hover:opacity-95 hover:scale-[1.005]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 pr-6">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">💌</span>
                              <h3 className="font-bold text-base sm:text-lg leading-tight truncate">
                                {notif.title}
                              </h3>
                            </div>
                            <p className="text-xs opacity-90 line-clamp-2 leading-relaxed">
                              {notif.content}
                            </p>
                            {notif.createdAt && (
                              <p className="text-[10px] opacity-75 pt-1">
                                {new Date(notif.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                          </div>

                          <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full shrink-0">
                            Read →
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteMessage(notif.id, e)}
                      title="Delete note"
                      className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/40 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Right Column: Desktop Stationery Reading & Writing Desk (Hidden on mobile) */}
          <div className="hidden md:block md:col-span-7 sticky top-20">
            {isAdding ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-100 space-y-5">
                <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✍️</span>
                    <h3 className="text-xl font-handwriting font-bold text-gray-900">
                      Write a New Love Note
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1 rounded-full hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateMessage} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Note Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Thinking of You, From the bottom of my heart..."
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Message Content
                    </label>
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Write your heart out..."
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/30 resize-none font-serif leading-relaxed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Card Theme
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setNewColor(c.value)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                            newColor === c.value
                              ? 'border-pink-500 ring-2 ring-pink-300 bg-pink-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${c.value}`} />
                          <span className="text-gray-700">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold rounded-full shadow-md shadow-pink-500/25 transition-all"
                    >
                      Save Letter
                    </button>
                  </div>
                </form>
              </div>
            ) : activeMessage ? (
              <div className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
                {/* Desktop Stationery Top Header */}
                <div className={`bg-gradient-to-r ${activeMessage.color} p-6 sm:p-8 text-white relative`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">💌</span>
                    <button
                      onClick={() => handleDeleteMessage(activeMessage.id)}
                      className="text-xs bg-white/20 hover:bg-red-500/80 px-3 py-1 rounded-full text-white transition-colors"
                      title="Delete letter"
                    >
                      Delete Note
                    </button>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-1">
                    {activeMessage.title}
                  </h3>
                  {activeMessage.createdAt && (
                    <p className="text-xs text-white/80">
                      📅 {new Date(activeMessage.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* Desktop Stationery Content Parchment */}
                <div className="p-8 sm:p-10 text-gray-800 text-base leading-relaxed space-y-4 whitespace-pre-wrap font-serif bg-gradient-to-b from-white to-pink-50/20 max-h-[60vh] overflow-y-auto">
                  {activeMessage.content}
                </div>
              </div>
            ) : (
              <div className="bg-white/60 rounded-3xl p-12 text-center border border-dashed border-pink-200">
                <span className="text-4xl mb-2 block">📖</span>
                <p className="text-sm font-semibold text-gray-600">Select a letter from the left to read</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Modal for Reading (Mobile only: < md) */}
      <div className="md:hidden">
        <AnimatePresence>
          {expandedId && activeMessage && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setExpandedId(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />

              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] border border-pink-100"
                >
                  {/* Modal Header */}
                  <div className={`bg-gradient-to-r ${activeMessage.color} px-6 py-6 text-white relative`}>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                    <span className="text-2xl mb-1 block">💌</span>
                    <h2 className="text-2xl font-bold font-serif tracking-tight">
                      {activeMessage.title}
                    </h2>
                  </div>

                  {/* Modal Content */}
                  <div className="px-6 py-6 text-gray-700 overflow-y-auto flex-1 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-wrap font-serif">
                    {activeMessage.content}
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        handleDeleteMessage(activeMessage.id)
                        setExpandedId(null)
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                      Delete Note
                    </button>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold rounded-full shadow-md shadow-pink-500/20 transition-all"
                    >
                      Close Note
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Modal for Composing (Mobile only: < md) */}
      <div className="md:hidden">
        <AnimatePresence>
          {isAdding && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAdding(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />

              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] border border-pink-100"
                >
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✍️</span>
                      <h2 className="text-xl font-bold tracking-tight">Write Love Note</h2>
                    </div>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full w-7 h-7 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateMessage} className="p-6 overflow-y-auto space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. For Asmin, Thinking of You..."
                        className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Message Content
                      </label>
                      <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Write your note..."
                        rows={5}
                        className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none font-serif"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Card Color
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {COLOR_OPTIONS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setNewColor(c.value)}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                              newColor === c.value
                                ? 'border-pink-500 ring-2 ring-pink-300 bg-pink-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${c.value}`} />
                            <span className="text-gray-700">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold rounded-full shadow-md shadow-pink-500/20 transition-all"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
