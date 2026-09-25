/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ssscaner: {
          dark: '#1a2332',
          darker: '#0f1419',
          primary: '#00d4ff',
          secondary: '#ff6b35',
          success: '#00ff88',
          warning: '#ffd700',
          danger: '#ff3366',
          accent: '#00d4ff'
        }
      }
    },
  },
  plugins: [],
}
