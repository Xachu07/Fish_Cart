/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sea: {
          50: '#f7fbfb',
          100: '#eef7f6',
          200: '#dff0ef',
          300: '#bfe6dc',
          400: '#7fcfb1',
          500: '#38b78f',
          600: '#0f766e', // primary sea teal
          700: '#0e6b64',
          800: '#0d5f58',
          900: '#0b4f47',
        },
        brand: {
          primary: '#0f766e',
          accent: '#f97316',
          background: '#ffffff',
          text: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};

