'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const BackArrowIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function NotificationsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const notifications = [
    {
      id: 'apology',
      title: 'A Message for You',
      preview: "I know this issue has been hurting you...",
      fullContent: (
        <div>
          <p className="text-base leading-relaxed">
            I know this issue has been hurting you, and I'm really sorry for the times I made you feel like you weren't my priority. That was never what I wanted you to feel. You mean a lot to me, even if I haven't always shown it in the way you needed.
          </p>
          
          <p className="text-base leading-relaxed pt-4">
            I'm not bored of you, and I'm not tired of us. I sometimes struggle with how I manage my energy and time, but that doesn't change how much I care about you. I'm trying to be more intentional and more aware, not because I have to, but because you matter to me.
          </p>

          <p className="text-base leading-relaxed pt-4 font-medium text-rose-600">
            I don't want us to keep going in circles over this. I just want us to feel good with each other again. I care about what we have, and I'm here, trying, because I want this to work. I love you so so so much.
          </p>
        </div>
      ),
      color: 'from-rose-400 to-rose-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-4 px-4 py-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            <BackArrowIcon />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 py-6">
        <div className="space-y-4">
          {notifications.map((notif) => (
            <motion.button
              key={notif.id}
              onClick={() => setExpandedId(expandedId === notif.id ? null : notif.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-left"
            >
              <div className={`bg-gradient-to-r ${notif.color} rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 text-white`}>
                <h3 className="font-bold text-lg mb-1">{notif.title}</h3>
                <p className="text-sm opacity-90">{notif.preview}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {expandedId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedId(null)}
              className="fixed inset-0 bg-black bg-opacity-40 z-50"
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setExpandedId(null)
              }}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                {notifications.find((n) => n.id === expandedId) && (
                  <>
                    <div className={`bg-gradient-to-r ${notifications.find((n) => n.id === expandedId)?.color} px-6 py-8 relative`}>
                      <button
                        onClick={() => setExpandedId(null)}
                        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                      >
                        <XIcon />
                      </button>
                      <h2 className="text-2xl font-bold text-white">
                        {notifications.find((n) => n.id === expandedId)?.title}
                      </h2>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-8 text-gray-700 overflow-y-auto flex-1">
                      {notifications.find((n) => n.id === expandedId)?.fullContent}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex gap-3">
                      <button
                        onClick={() => setExpandedId(null)}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
