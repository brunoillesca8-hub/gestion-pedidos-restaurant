/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf7f4',
          100: '#f6ede6',
          200: '#eed9cb',
          300: '#e1bdab',
          400: '#d19983',
          500: '#c27961',
          600: '#b0604a',
          700: '#934d3b',
          800: '#794034',
          900: '#64382f',
          950: '#361b17',
        },
        warmgray: {
          50: '#faf9f8',
          100: '#f3f1ee',
          200: '#e6e3df',
          300: '#d3ceca',
          400: '#b4ada7',
          500: '#968e87',
          600: '#7c736c',
          700: '#665d57',
          800: '#544d48',
          900: '#47413d',
          950: '#262220',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif']
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.5s ease-in-out 2',
      }
    },
  },
  plugins: [],
}
