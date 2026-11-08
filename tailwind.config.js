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
        // Native SwiftUI Monochromatic System Colors
        bg: '#000000',
        side: '#08080A',
        panel: 'rgba(255, 255, 255, 0.04)',
        raised: 'rgba(255, 255, 255, 0.08)',
        line: 'rgba(255, 255, 255, 0.12)',
        lineSoft: 'rgba(255, 255, 255, 0.08)',
        dim: 'rgba(255, 255, 255, 0.40)',
        textSecondary: 'rgba(255, 255, 255, 0.65)',
        textPrimary: '#FFFFFF',
        accent: '#FFFFFF',
        sage: '#FFFFFF',

        opred: {
          DEFAULT: '#FFFFFF',
          hover: '#E5E5E9',
          dark: '#E5E5E9',
          glow: 'rgba(255, 255, 255, 0.20)',
          subtle: 'rgba(255, 255, 255, 0.10)'
        },
        slate: {
          950: '#000000',
          900: '#08080A',
          850: 'rgba(255, 255, 255, 0.04)',
          800: 'rgba(255, 255, 255, 0.08)',
          750: 'rgba(255, 255, 255, 0.10)',
          700: 'rgba(255, 255, 255, 0.14)',
          600: 'rgba(255, 255, 255, 0.25)',
          500: 'rgba(255, 255, 255, 0.40)',
          400: 'rgba(255, 255, 255, 0.55)',
          300: 'rgba(255, 255, 255, 0.70)',
          200: 'rgba(255, 255, 255, 0.85)',
          100: '#FFFFFF',
        }
      },
      fontFamily: {
        serif: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'sans-serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'apple-card': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 4px 20px rgba(0, 0, 0, 0.35)',
        'apple-glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'apple-active': '0 2px 8px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}
