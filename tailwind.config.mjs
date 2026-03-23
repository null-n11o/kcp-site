import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0a0a0a',
          100: '#141414',
          200: '#1a1a2e',
          300: '#16213e',
        },
        accent: {
          DEFAULT: '#4a9eff',
          dark: '#0066cc',
          muted: '#1a3a5c',
          light: '#7ab8ff',
        },
        'text-primary': '#f0f0f0',
        'text-secondary': '#a0a0b0',
        'text-muted': '#606070',
        border: {
          DEFAULT: '#2a2a3e',
          subtle: '#1e1e2e',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'Inter', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        content: '1200px',
        prose: '780px',
      },
      spacing: {
        section: '5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'slide-up': 'slideUp 0.7s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
