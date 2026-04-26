/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#111318',
        surface: '#1c1e26',
        elevated: '#272a35',
        accent: '#7c3aed',
        'accent-light': '#a78bfa',
        primary: '#eeeef2',
        muted: '#8888a0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
