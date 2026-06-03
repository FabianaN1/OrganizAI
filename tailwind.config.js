/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0e3657',
        secondary: '#097ab5',
        accent: '#08c8ff',
        highlight: '#0ffff8',
        dark: '#140f08',
      },
    },
  },
  plugins: [],
};
