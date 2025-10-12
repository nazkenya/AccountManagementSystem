/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    // Ensure gradient stop classes are always generated
    'bg-gradient-to-br',
    'from-accent-dark',
    'via-brand-dark',
    'to-accent',
    // Helpful fallbacks used in hero header
    'bg-accent',
    'bg-accent-light',
    // Arbitrary color gradient classes used as a hard fallback
    'bg-[#00B8D9]',
    'from-[#0088A3]',
    'via-[#1E2035]',
    'to-[#00B8D9]'
  ],
  theme: {
    extend: {
      colors: {
        // Brand Core
        brand: {
          DEFAULT: '#2E3048',
          dark: '#1E2035',
          muted: '#4A4D6D',
          light: '#F5F6FA',
        },
        // Complementary Accent to brand (cool teal/cyan)
        accent: {
          DEFAULT: '#00B8D9', // cyan
          dark: '#0088A3',    // deep teal
          light: '#7FE3F2',   // light aqua
        },
        // Telkom Red
        primary: {
          DEFAULT: '#E60012',
          dark: '#B00010',
          light: '#FF1A2E',
        },
        // Neutrals
        neutral: {
          50: '#F5F6FA',
          100: '#F0F1F6',
          200: '#D6D7E0',
          300: '#A1A3B5',
          400: '#6A6C8A',
          500: '#4A4C68',
          600: '#2E3048',
          700: '#1E2035',
          800: '#131625',
        },
        // Functional
        success: '#2ECC71',
        warning: '#F1C40F',
        error: '#E74C3C',
        info: '#3498DB',
        highlight: '#9B59B6',
        
        // Legacy (for compatibility)
        secondary: '#4A4A4A',
        background: '#F5F6FA',
        'sidebar-bg': '#2E3048',
        text: '#333333',
        'light-text': '#7A7A7A',
        border: '#EAEAEA',
        card: '#FFFFFF',
        'hover-blue': '#E9F2FF',
        'hover-slate': '#4A4D64',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(46,48,72,0.12), 0 2px 6px rgba(46,48,72,0.08)',
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.07)',
        'lg': '0 10px 20px rgba(0,0,0,0.1)',
        'xl': '0 20px 40px rgba(0,0,0,0.15)',
        'inner-soft': 'inset 0 2px 4px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}