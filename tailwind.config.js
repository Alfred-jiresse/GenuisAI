/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '14px',
      },
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          dark: '#818CF8',
        },
        secondary: {
          DEFAULT: '#10B981',
          dark: '#34D399',
        },
        accent: {
          DEFAULT: '#FBBF24',
        },
        background: {
          light: '#F9FAFB',
          dark: '#111827',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1F2937',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}