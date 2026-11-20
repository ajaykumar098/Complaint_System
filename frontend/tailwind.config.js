/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Professional Brand Blue Palette
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Professional Admin Indigo/Violet Palette
        admin: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Sophisticated Dark Surface Palette
        dark: {
          base: '#0e1116',
          surface: '#0f172a',
          card: '#131c31',
          hover: '#1a243d',
          border: '#1e293b',
        },
        // Mapped for backwards-compatibility to modern tones (not harsh neon)
        neon: {
          blue: '#38bdf8', // Elegant Sky 400
          purple: '#818cf8', // Elegant Indigo 400
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(37, 99, 235, 0.25)',
        'glow-admin': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
