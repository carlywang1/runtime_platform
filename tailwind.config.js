/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: {
          DEFAULT: '#4B0082',
          50: '#E8E0F0',
          100: '#D4C4E3',
          200: '#B899D1',
          300: '#9C6EBF',
          400: '#7F43AD',
          500: '#4B0082',
          600: '#3D006A',
          700: '#2F0052',
          800: '#21003A',
          900: '#130022',
        },
        dark: {
          DEFAULT: '#000000',
          50: '#1A1A1A',
          100: '#141414',
          200: '#0F0F0F',
          300: '#0A0A0A',
          400: '#050505',
          500: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
