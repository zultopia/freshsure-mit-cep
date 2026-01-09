import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#E8F5E9',
          DEFAULT: '#4CAF50',
          dark: '#2E7D32',
        },
        warning: {
          light: '#FFF9C4',
          DEFAULT: '#FBC02D',
          dark: '#F57F17',
        },
        critical: {
          light: '#FFEBEE',
          DEFAULT: '#F44336',
          dark: '#C62828',
        },
      },
    },
  },
  plugins: [],
}
export default config

