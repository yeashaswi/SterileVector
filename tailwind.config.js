/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Peaceful low-contrast academic theme (inspired by evs-vit.vercel.app)
        bg: '#18181A',
        side: '#1E1E21',
        panel: '#232326',
        raised: '#2C2C30',
        line: '#36363B',
        lineSoft: '#2A2A2E',
        dim: '#85858D',
        textSecondary: '#BFBFC5',
        textPrimary: '#F4F4F6',
        accent: '#E05656',
        sage: '#5BA887',

        opred: {
          DEFAULT: '#E05656',
          hover: '#C94545',
          dark: '#B83838',
          glow: 'rgba(224, 86, 86, 0.15)',
          subtle: 'rgba(224, 86, 86, 0.12)'
        },
        slate: {
          950: '#18181A',
          900: '#1E1E21',
          850: '#232326',
          800: '#2C2C30',
          750: '#323238',
          700: '#36363B',
          600: '#47474E',
          500: '#6A6A72',
          400: '#85858D',
          300: '#BFBFC5',
          200: '#D5D5DB',
          100: '#F4F4F6',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Figtree', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
