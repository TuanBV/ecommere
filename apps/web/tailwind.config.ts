import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#171717',
        line: '#e5e7eb',
        accent: '#0f766e'
      }
    }
  },
  plugins: []
} satisfies Config;
