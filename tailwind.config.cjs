/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: 'var(--color-gold)',
          50: 'rgba(212, 175, 55, 0.05)',
          100: 'rgba(212, 175, 55, 0.1)',
          200: 'rgba(212, 175, 55, 0.2)',
          500: 'var(--color-gold)',
          600: '#c9a84c',
          900: 'rgba(212, 175, 55, 0.9)',
        },
        perionyx: {
          bg1: 'var(--surface-primary)',
          bg2: 'var(--surface-secondary)',
          bg3: 'var(--surface-tertiary)',
          bg4: 'var(--surface-elevated)',
          border: 'var(--border-default)',
          borderSoft: 'var(--border-subtle)',
          gold: 'var(--color-gold)',
          goldSoft: 'var(--color-gold-muted)',
          goldDeep: 'var(--color-gold-subtle)',
          textPrimary: 'var(--text-primary)',
          textMuted: 'var(--text-secondary)',
          textSubtle: 'var(--text-tertiary)',
          success: 'var(--color-success)',
          danger: 'var(--color-danger)',
          dangerDark: 'var(--color-danger-muted)',
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
