/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        perionyx: {
          bg1: '#050505',
          bg2: '#0A0A0A',
          bg3: '#111111',
          bg4: '#161616',
          border: '#222222',
          borderSoft: '#2A2A2A',
          gold: '#D4AF37',
          goldSoft: '#C8A96B',
          goldDeep: '#8B6B2E',
          textPrimary: '#F5F5F5',
          textMuted: '#B3B3B3',
          textSubtle: '#737373',
          success: '#2E7D5E',
          danger: '#7F2F2F',
          dangerDark: '#3A1212',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 14px 40px rgba(0, 0, 0, 0.28)',
        muted: '0 6px 18px rgba(0, 0, 0, 0.22)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      lineHeight: {
        cozy: '1.65',
      },
    },
  },
  plugins: [],
};
