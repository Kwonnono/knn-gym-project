import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'var(--font-display-kr)', 'sans-serif'],
        sans: ['var(--font-body)', 'var(--font-body-kr)', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
