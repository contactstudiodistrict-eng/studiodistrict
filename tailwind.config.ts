/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FFF5EE',
          100: '#FFE8D1',
          200: '#FFCDA3',
          300: '#FFAD5C',
          400: '#F07020',
          500: '#D05010',
          600: '#A83D0C',
          700: '#7A2D09',
        },
      },
      fontFamily: {
        sans:  ['var(--font-dm-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-dm-serif)', 'ui-serif', 'Georgia', 'serif'],
        mono:  ['var(--font-space-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [
    // Safe load — works whether or not tailwindcss-animate is installed
    ...(() => {
      try { return [require('tailwindcss-animate')] }
      catch { return [] }
    })(),
  ],
}
