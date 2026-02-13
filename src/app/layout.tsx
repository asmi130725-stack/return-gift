import type { Metadata, Viewport } from 'next'
import { Inter, Lora, Caveat, Dancing_Script } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
})

const dancing = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Return Gift - AI-Powered Digital Scrapbook',
  description: 'Create beautiful, AI-generated scrapbook pages from your cherished memories',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Return Gift',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#FF6B9D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} ${caveat.variable} ${dancing.variable}`}>
      <body className="font-sans antialiased bg-gray-50">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#FF6B9D',
                secondary: '#fff',
              },
            },
          }}
        />
        {/* Safe area for notched devices */}
        <div className="min-h-screen pt-safe-top pb-safe-bottom">
          {children}
        </div>
      </body>
    </html>
  )
}
