/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        daun: {
          50: '#F1F5EC',
          100: '#E1E9D7',
          200: '#C6D6B2',
          300: '#A8C187',
          400: '#86A760', // hijau muda khas Alas Daun
          500: '#1E3E2B', // hijau tua khas Alas Daun
          600: '#193523',
          700: '#152D20',
          800: '#11251A',
          900: '#0D1D14',
        },
        krem: {
          50: '#FDF8EC', // putih gading
          100: '#F8F1E3',
          200: '#EEE5D2',
          300: '#E3D7BD',
          400: '#D5C7A7',
        },
        oranye: {
          300: '#F3A16F',
          400: '#EB8345',
          500: '#E06B22', // oranye khas Alas Daun
          600: '#BF5418',
          700: '#984114',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(30, 62, 43, 0.15)',
        'card': '0 8px 30px -6px rgba(30, 62, 43, 0.18)',
      },
    },
  },
  plugins: [],
};
