/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0C0F14',
          2: '#141922',
          3: '#1C2333',
        },
        primary: {
          DEFAULT: '#3B82F6',
          glow: '#60A5FA',
        },
        accent: '#06B6D4',
        danger: '#EF4444',
        neutral: '#94A3B8',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}