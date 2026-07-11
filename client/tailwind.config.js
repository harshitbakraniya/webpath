/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        palette: {
          'bright-grey': '#EBEDF1',
          'shy-blunt': '#D4D8DF',
          'timber-wolf': '#ACADB1',
          'smoked-pearl': '#706F70',
          'jet-black': '#353536',
          'reversed-grey': '#080808',
        },
      },
    },
  },
  plugins: [],
};
