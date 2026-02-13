import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Romantic theme
        romantic: {
          primary: '#FF6B9D',
          secondary: '#C44569',
          accent: '#FFE66D',
          background: '#FFF5F7',
          text: '#2C1810',
        },
        // Playful theme
        playful: {
          primary: '#4ECDC4',
          secondary: '#FF6B6B',
          accent: '#FFE66D',
          background: '#F7FFF7',
          text: '#1A1A2E',
        },
        // Nostalgic theme
        nostalgic: {
          primary: '#D4A574',
          secondary: '#8B7355',
          accent: '#E8D5C4',
          background: '#FAF7F2',
          text: '#3E2723',
        },
        // Adventurous theme
        adventurous: {
          primary: '#2E86AB',
          secondary: '#A23B72',
          accent: '#F18F01',
          background: '#F6F8FF',
          text: '#1B263B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
        handwriting: ['var(--font-caveat)', 'cursive'],
        script: ['var(--font-dancing)', 'cursive'],
      },
      spacing: {
        // Touch-friendly spacing
        'touch': '44px', // Minimum touch target
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
