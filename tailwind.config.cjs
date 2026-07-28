/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── EDL Brand ──────────────────────────────────────────────
        gold: {
          DEFAULT: '#d4af37',
          hover: '#e5c04a',
          active: '#c7a961',
          muted: 'rgba(212, 175, 55, 0.15)',
          subtle: 'rgba(212, 175, 55, 0.08)',
          border: 'rgba(212, 175, 55, 0.2)',
          focus: 'rgba(212, 175, 55, 0.5)',
        },

        // ── EDL Surfaces ──────────────────────────────────────────
        surface: {
          base: '#0a0a0f',
          raised: '#111118',
          elevated: '#1a1a24',
          floating: '#222230',
          overlay: 'rgba(0, 0, 0, 0.6)',
          sidebar: '#0a0a0f',
          header: '#0a0a0f',
        },

        // ── EDL Text ──────────────────────────────────────────────
        txt: {
          primary: '#f7f6f2',
          secondary: '#a1a1aa',
          tertiary: '#71717a',
          disabled: '#52525b',
          inverse: '#0a0a0f',
          link: '#5e9eff',
        },

        // ── EDL Status ────────────────────────────────────────────
        st: {
          success: '#22c55e',
          'success-muted': 'rgba(34, 197, 94, 0.15)',
          'success-subtle': 'rgba(34, 197, 94, 0.08)',
          warning: '#f59e0b',
          'warning-muted': 'rgba(245, 158, 11, 0.15)',
          'warning-subtle': 'rgba(245, 158, 11, 0.08)',
          error: '#ef4444',
          'error-muted': 'rgba(239, 68, 68, 0.15)',
          'error-subtle': 'rgba(239, 68, 68, 0.08)',
          info: '#3b82f6',
          'info-muted': 'rgba(59, 130, 246, 0.15)',
          'info-subtle': 'rgba(59, 130, 246, 0.08)',
          neutral: '#71717a',
          'neutral-muted': 'rgba(113, 113, 122, 0.15)',
        },

        // ── Legacy perionyx (deprecated, use EDL tokens above) ────
        perionyx: {
          bg1: '#0a0a0f',
          bg2: '#111118',
          bg3: '#1a1a24',
          bg4: '#222230',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSoft: 'rgba(255, 255, 255, 0.04)',
          gold: '#d4af37',
          goldSoft: 'rgba(212, 175, 55, 0.15)',
          goldDeep: 'rgba(212, 175, 55, 0.08)',
          textPrimary: '#f7f6f2',
          textMuted: '#a1a1aa',
          textSubtle: '#71717a',
          success: '#22c55e',
          danger: '#ef4444',
          dangerDark: 'rgba(239, 68, 68, 0.15)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'Geist Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },

      boxShadow: {
        soft: '0 1px 3px rgba(0, 0, 0, 0.3)',
        medium: '0 4px 12px rgba(0, 0, 0, 0.4)',
        large: '0 8px 24px rgba(0, 0, 0, 0.5)',
        floating: '0 12px 40px rgba(0, 0, 0, 0.5)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.15)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.15)',
        'glow-info': '0 0 20px rgba(59, 130, 246, 0.15)',
        muted: '0 6px 18px rgba(0, 0, 0, 0.22)',
      },

      borderRadius: {
        xs: '2px',
        xl: '1rem',
        '2xl': '1.25rem',
      },

      lineHeight: {
        cozy: '1.65',
      },

      spacing: {
        // EDL 4px base (extend, don't override Tailwind defaults)
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        34: '8.5rem',
        38: '9.5rem',
        42: '10.5rem',
        46: '11.5rem',
        50: '12.5rem',
        54: '13.5rem',
        58: '14.5rem',
        62: '15.5rem',
        66: '16.5rem',
        70: '17.5rem',
        74: '18.5rem',
        78: '19.5rem',
        82: '20.5rem',
        86: '21.5rem',
        90: '22.5rem',
        94: '23.5rem',
        98: '24.5rem',
      },

      zIndex: {
        content: '1',
        raised: '10',
        sticky: '100',
        dropdown: '200',
        nav: '300',
        sidebar: '400',
        overlay: '500',
        modal: '600',
        popover: '700',
        tooltip: '800',
        toast: '900',
        max: '9999',
      },
    },
  },
  plugins: [],
};
