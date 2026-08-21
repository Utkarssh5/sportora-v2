/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          neon: '#00FF66',
          dark: '#0A0E17',
          card: '#121824',
          accent: '#FF3366',
        },
      },
    },
  },
  plugins: [],
}
