import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0E4F9A',
          secondary: '#33B1FF',
          accent: '#F9A826'
        }
      }
    }
  },
  plugins: []
};

export default config;
