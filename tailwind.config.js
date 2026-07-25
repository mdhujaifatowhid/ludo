/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#123524',
          dark: '#0B241A',
          light: '#1B4332',
        },
        wood: {
          DEFAULT: '#3A2618',
          light: '#5C3D28',
          panel: '#EFE6D5',
        },
        cream: '#F1EAD9',
        piece: {
          red: '#E63946',
          green: '#2A9D8F',
          yellow: '#E9C46A',
          blue: '#457B9D',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        table: '0 12px 30px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(241,234,217,0.06)',
      },
      keyframes: {
        tumble: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '30%': { transform: 'rotate(140deg) scale(1.08)' },
          '60%': { transform: 'rotate(260deg) scale(0.96)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        tumble: 'tumble 0.6s ease-out',
        pop: 'pop 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
