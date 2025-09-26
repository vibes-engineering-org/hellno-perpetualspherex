/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'ripple': 'ripple 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        ripple: {
          '0%': {
            transform: 'scale(0)',
            opacity: '1',
            filter: 'hue-rotate(0deg) brightness(1.2)'
          },
          '50%': {
            opacity: '0.8',
            filter: 'hue-rotate(60deg) brightness(1.4)'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '0',
            filter: 'hue-rotate(120deg) brightness(1.6)'
          }
        }
      }
    },
  },
  plugins: [],
}