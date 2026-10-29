/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        daun: {
          50: '#EEF6EF',
          100: '#D6E8D8',
          200: '#A8CCA9',
          300: '#79B07B',
          400: '#4F9452',
          500: '#2F5D3A', // hijau daun pisang
          600: '#264A30',
          700: '#1D3826',
          800: '#15281B',
          900: '#0E1B11',
        },
        krem: {
          50: '#FBF9F3',
          100: '#F6EFE2', // krem
          200: '#EDE2C8',
          300: '#E3D2A8',
          400: '#D4B97E',
        },
        tanah: {
          50: '#F5EFE9',
          100: '#E8D9CB',
          200: '#C9A384',
          300: '#A5764F',
          400: '#82573A',
          500: '#6B4A2F', // cokelat tanah
          600: '#563B26',
          700: '#412C1C',
        },
        oranye: {
          300: '#F0A85C',
          400: '#E8923F',
          500: '#D9822B', // aksen oranye hangat
          600: '#B66A20',
          700: '#8F521A',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(47, 93, 58, 0.15)',
        'card': '0 8px 30px -6px rgba(107, 74, 47, 0.18)',
      },
    },
  },
  plugins: [],
};
