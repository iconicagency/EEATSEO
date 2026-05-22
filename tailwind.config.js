/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-mono)', 'monospace'],
      },
      colors: {
        brand: {
          blue: '#1d5fa8',
          'blue-light': '#e8f0fb',
          green: '#1a7a4a',
          'green-light': '#e6f4ec',
          amber: '#996010',
          'amber-light': '#fdf2db',
          red: '#b83030',
          'red-light': '#fce8e8',
        }
      }
    },
  },
  plugins: [],
}
