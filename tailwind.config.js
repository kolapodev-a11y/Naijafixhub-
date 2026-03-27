/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
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
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        brand: {
          purple: '#7C3AED',
          magenta: '#A855F7',
          lavender: '#F3E8FF',
          gray: '#F8FAFC',
          dark: '#1F2937',
          success: '#10B981',
          danger: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 15px -3px rgba(124, 58, 237, 0.1), 0 10px 20px -2px rgba(124, 58, 237, 0.04)',
        'card-hover': '0 10px 40px -3px rgba(124, 58, 237, 0.2), 0 4px 6px -2px rgba(124, 58, 237, 0.05)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)',
        'card-gradient': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      },
    },
  },
  plugins: [],
}
