/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        opred: {
          DEFAULT: '#EB0028',
          hover: '#FF1E38',
          dark: '#B8001F',
          glow: 'rgba(235, 0, 40, 0.25)',
          subtle: 'rgba(235, 0, 40, 0.08)'
        },
        slate: {
          950: '#080809',
          900: '#0F0F12',
          850: '#151519',
          800: '#1C1C22',
          750: '#23232B',
          700: '#2E2E38',
          600: '#454552',
          500: '#6B6B7B',
          400: '#9E9EB0',
          300: '#D0D0DC',
          200: '#E8E8F0',
          100: '#F4F4F8',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
