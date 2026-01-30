import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    screens: {
      // Mobile first breakpoints
      'xs': '375px',      // Small mobile
      'sm': '480px',      // Mobile
      'md': '640px',      // Large mobile / Small tablet
      'lg': '768px',      // Tablet
      'xl': '1024px',     // Small laptop
      '2xl': '1200px',    // Desktop
      '3xl': '1366px',    // HD laptop (1366x768)
      '4xl': '1440px',    // WXGA+ laptop
      '5xl': '1536px',    // MacBook Pro 14"
      '6xl': '1680px',    // Large laptop
      '7xl': '1920px',    // Full HD desktop
      '8xl': '2560px',    // 2K/QHD displays
    },
    extend: {
      colors: {
        brand: {
          primary: '#0E4F9A',
          secondary: '#33B1FF',
          accent: '#F9A826'
        }
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
        '6xl': ['3.75rem', { lineHeight: '1.15' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
      },
      gridTemplateColumns: {
        'auto-fill-200': 'repeat(auto-fill, minmax(200px, 1fr))',
        'auto-fill-250': 'repeat(auto-fill, minmax(250px, 1fr))',
        'auto-fill-300': 'repeat(auto-fill, minmax(300px, 1fr))',
        'auto-fill-350': 'repeat(auto-fill, minmax(350px, 1fr))',
      }
    }
  },
  plugins: []
};

export default config;
