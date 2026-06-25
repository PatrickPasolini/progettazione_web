const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', ...fontFamily.sans],
        mono: ['Geist Mono', ...fontFamily.mono],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        /* ── shadcn tokens (reference CSS variables) ── */
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',

        /* ── progetto palette (classi esistenti invariate) ── */
        bg:    '#eef2f8',
        paper: '#f8fafd',
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
