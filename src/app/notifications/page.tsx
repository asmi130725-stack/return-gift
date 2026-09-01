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

const DEFAULT_MESSAGES: MessageItem[] = [
  {
    id: 'apology-default',
    title: 'A Message for You',
    content: `I know this issue has been hurting you, and I'm really sorry for the times I made you feel like you weren't my priority. That was never what I wanted you to feel. You mean a lot to me, even if I haven't always shown it in the way you needed.

I'm not bored of you, and I'm not tired of us. I sometimes struggle with how I manage my energy and time, but that doesn't change how much I care about you. I'm trying to be more intentional and more aware, not because I have to, but because you matter to me.

I don't want us to keep going in circles over this. I just want us to feel good with each other again. I care about what we have, and I'm here, trying, because I want this to work. I love you so so so much.`,
    color: 'from-rose-500 to-pink-600',
    createdAt: new Date().toISOString(),
  },
]

const COLOR_OPTIONS = [
  { label: 'Rose Pink', value: 'from-rose-500 to-pink-600' },
  { label: 'Sunset Coral', value: 'from-pink-500 to-orange-400' },
  { label: 'Lavender Violet', value: 'from-purple-500 to-pink-500' },
  { label: 'Ruby Red', value: 'from-red-500 to-rose-600' },
]

export default function NotificationsPage() {
  const [messages, setMessages] = useState<MessageItem[]>(DEFAULT_MESSAGES)
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
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            // Merge default apology with database messages
            const merged = [...data.messages]
            if (!merged.some(m => m.id === 'apology-default')) {
              merged.push(DEFAULT_MESSAGES[0])
            }
            setMessages(merged)
            localStorage.setItem('user_apology_messages', JSON.stringify(merged))
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
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
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

  const handleDeleteMessage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = messages.filter((m) => m.id !== id)
    saveMessages(updated)
    if (expandedId === id) {
      setExpandedId(null)
    }

    if (id !== 'apology-default' && !id.startsWith('msg-')) {
      try {
        await fetch(`/api/messages?id=${id}`, { method: 'DELETE' })
      } catch (err) {
        console.warn('Could not delete from server:', err)
      }
    }
  }

  const activeMessage = messages.find((m) => m.id === expandedId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/80 via-pink-50/40 to-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-pink-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Messages & Notes
            </h1>
          </div>

          {/* Add Message Button */}
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all"
            title="Write new message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Write Note</span>
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-w-lg mx-auto px-4 py-5 space-y-3.5">
        {messages.length === 0 ? (
          <div className="bg-white/80 rounded-3xl p-8 text-center border border-pink-100 shadow-sm space-y-3">
            <span className="text-3xl">💌</span>
            <h3 className="text-base font-bold text-gray-800">No notes written yet</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Tap "Write Note" above to write an apology, appreciation note, or loving message.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full shadow-sm hover:bg-pink-600 transition-colors"
            >
              + Write First Note
            </button>
          </div>
        ) : (
          messages.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <button
                onClick={() => setExpandedId(expandedId === notif.id ? null : notif.id)}
                className="w-full text-left"
              >
                <div
                  className={`bg-gradient-to-r ${notif.color} rounded-2xl p-4 sm:p-5 shadow-md shadow-rose-500/10 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all text-white relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">💌</span>
                        <h3 className="font-bold text-base sm:text-lg leading-tight">
                          {notif.title}
                        </h3>
                      </div>
                      <p className="text-xs opacity-90 line-clamp-2 leading-relaxed">
                        {notif.content}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full shrink-0">
                      Read →
                    </span>
                  </div>
                </div>
              </button>

              {/* Delete Button */}
              {messages.length > 1 && (
                <button
                  onClick={(e) => handleDeleteMessage(notif.id, e)}
                  title="Delete message"
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ✕
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Expanded Message Modal */}
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
                {/* Modal Header Banner */}
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
                <div className="px-6 py-6 text-gray-700 overflow-y-auto flex-1 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-wrap">
                  {activeMessage.content}
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end">
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

      {/* Add New Message Modal */}
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
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] border border-pink-100"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✍️</span>
                    <h2 className="text-lg font-bold">Write a Heartfelt Note</h2>
                  </div>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full w-7 h-7 flex items-center justify-center transition-colors text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleCreateMessage} className="p-5 overflow-y-auto space-y-4 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Note Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., A Message from My Heart"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Message Content
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Write what you really feel..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Card Color Theme
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {COLOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setNewColor(opt.value)}
                          className={`p-2.5 rounded-xl text-left border flex items-center gap-2 transition-all ${
                            newColor === opt.value
                              ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-300/50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${opt.value} shrink-0`} />
                          <span className="text-xs font-medium text-gray-700">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTitle.trim() || !newContent.trim()}
                      className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/25 transition-all"
                    >
                      Save Note 💌
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
