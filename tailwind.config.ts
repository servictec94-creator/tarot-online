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
        midnight: '#0B0B1A',
        cosmos: '#13132B',
        nebula: '#1E1E3F',
        violet: {
          deep: '#2D1B69',
          soft: '#7C3AED',
          glow: '#A78BFA',
          light: '#C4B5FD',
        },
        gold: {
          dark: '#78350F',
          DEFAULT: '#D97706',
          light: '#FCD34D',
          pale: '#FEF3C7',
        },
        mystic: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        star: '#E2D9F3',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Raleway', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'cosmic': 'radial-gradient(ellipse at top, #1E1E3F 0%, #0B0B1A 70%)',
        'card-glow': 'radial-gradient(circle at center, rgba(167,139,250,0.15) 0%, transparent 70%)',
        'gold-shimmer': 'linear-gradient(135deg, #D97706 0%, #FCD34D 50%, #D97706 100%)',
      },
      boxShadow: {
        'mystic': '0 0 30px rgba(124, 58, 237, 0.3)',
        'gold': '0 0 20px rgba(217, 119, 6, 0.4)',
        'card': '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}
export default config
