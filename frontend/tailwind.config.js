/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fbfb',
          100: '#dcf7f6',
          200: '#bcefed',
          300: '#8ce1df',
          400: '#54cbca',
          500: '#0ea5a4',
          600: '#0b8483',
          700: '#096a69',
          800: '#085554',
          900: '#074746',
          950: '#032727',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 10px -1px rgba(15, 23, 42, 0.03)',
        'premium-hover': '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 15px -3px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
