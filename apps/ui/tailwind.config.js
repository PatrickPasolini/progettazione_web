/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:  ['Geist Mono', 'ui-monospace', 'monospace'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      colors: {
        bg:          '#eef2f8',
        paper:       '#f8fafd',
        ink: {
          DEFAULT: '#0e1a2e',
          2:       '#1f3050',
          3:       '#5d6c85',
          4:       '#95a0b5',
        },
        line: {
          DEFAULT: '#d3dceb',
          2:       '#dfe6f1',
        },
        accent: {
          DEFAULT: '#1c3d77',
          2:       '#2a5298',
          soft:    '#dbe5f5',
        },
        gold: {
          DEFAULT: '#b07c12',
          soft:    '#f3e7c9',
        },
        teal: {
          DEFAULT: '#1d5b58',
          soft:    '#d9e6e3',
        },
      },
    },
  },
  plugins: [],
};
