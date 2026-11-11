/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vickora: {
          dark: '#0a0d14',
          slate: '#0f172a',
          surface: '#182032',
          border: '#27354f',
          cyan: '#0ea5e9',
          photon: '#38bdf8',
          gold: '#eab308',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
