/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': 'var(--color-neon-blue)',
        'neon-yellow': 'var(--color-neon-yellow)',
        'dash-bg': 'var(--color-dash-bg)',
        'dash-card': 'var(--color-dash-card)',
        'dash-border': 'var(--color-dash-border)',
        'primary': 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 4s ease infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};