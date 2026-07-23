/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6c5ce7',
        secondary: '#a78bfa',
        accent: '#ff69b4',
        dark: '#0b0e14',
        card: '#151e2a',
        border: '#2a3548',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
