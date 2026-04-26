/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C8A84B',
        bg: '#0D0D0D',
        card: '#111111',
        surface: '#1A1A1A',
        border: '#2A2A2A',
        text: '#FFFFFF',
        muted: '#888888',
        dim: '#555555',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
    },
  },
  plugins: [],
}
