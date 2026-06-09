/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--bg-base) / <alpha-value>)',
        panel: 'rgb(var(--bg-panel) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        main: 'rgb(var(--text-main) / <alpha-value>)',
        hover: 'rgb(var(--bg-hover) / <alpha-value>)',
        border: 'rgb(var(--border-color) / <alpha-value>)',
        'pure-white': '#FFFFFF',
        'off-white': '#F6F6F6',
        'muted-gray': '#E5E5E5',
        'dark-charcoal': '#1A1A1A',
        'pure-black': '#000000',
        'tamagotchi-red': '#FF0022',
        'hover-gray': '#F0F0F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',
        DEFAULT: '4px',
        'md': '4px',
        'lg': '4px',
        'xl': '4px',
        '2xl': '4px',
        '3xl': '4px',
        'full': '9999px',
      },
      borderWidth: {
        DEFAULT: '1px',
        '2': '2px',
      }
    },
  },
  plugins: [],
}
