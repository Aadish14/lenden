/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0F1117',
        card: '#1A1D27',
        input: '#252836',
        border: '#2E3248',
        'text-primary': '#F0F2FF',
        'text-muted': '#8B8FA8',
        'accent-green': '#22C55E',
        'accent-green-dim': '#14532D',
        'accent-red': '#EF4444',
        'accent-red-dim': '#450A0A',
        'accent-blue': '#6366F1',
        'accent-blue-hover': '#4F46E5',
        'accent-yellow': '#FBBF24',
        'accent-yellow-hover': '#D97706',
        'accent-teal': '#14B8A6',
        'settled-bg': '#1C2A24',
        'settled-text': '#4ADE80',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
