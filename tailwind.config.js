/***** Tailwind CSS v3.3.3 config *****/
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Desktop-first aliases (apply styles from large -> down)
      // Use: 'xl-down:...', 'lg-down:...', etc.
      screens: {
        '2xl-down': { max: '1535px' }, // ≤ 1535px
        'xl-down': { max: '1279px' },  // ≤ 1279px
        'lg-down': { max: '1023px' },  // ≤ 1023px
        'md-down': { max: '767px' },   // ≤ 767px
        'sm-down': { max: '639px' },   // ≤ 639px
      },
    },
  },
  plugins: [],
}
