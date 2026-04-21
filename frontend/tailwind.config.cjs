const neutralScale = {
  50: '#FFFFFF',
  100: '#F7FFE6',
  200: '#EEFFBE',
  300: '#E2FF99',
  400: '#D1EAA3',
  500: '#A5B58E',
  600: '#7A876E',
  700: '#55604C',
  800: '#333A2F',
  900: '#1B201B',
  950: '#101312',
}

const limeScale = {
  50: '#FCFFE9',
  100: '#F4FFD0',
  200: '#ECFFB6',
  300: '#E2FF99',
  400: '#D3FF64',
  500: '#BAF91A',
  600: '#98CC13',
  700: '#769E0F',
  800: '#55710B',
  900: '#334508',
  950: '#1C2504',
}

const violetScale = {
  50: '#F4F0FF',
  100: '#EDE6FF',
  200: '#DACDFF',
  300: '#C3B0FF',
  400: '#AA91FF',
  500: '#876DFF',
  600: '#745BDE',
  700: '#604ABC',
  800: '#4B3A97',
  900: '#362A6F',
  950: '#231B48',
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        slate: { ...neutralScale },
        gray: { ...neutralScale },
        zinc: { ...neutralScale },
        neutral: { ...neutralScale },
        stone: { ...neutralScale },
        emerald: { ...limeScale },
        green: { ...limeScale },
        lime: { ...limeScale },
        yellow: { ...limeScale },
        amber: { ...limeScale },
        orange: { ...limeScale },
        teal: { ...limeScale },
        violet: { ...violetScale },
        purple: { ...violetScale },
        fuchsia: { ...violetScale },
        pink: { ...violetScale },
        red: { ...violetScale },
        rose: { ...violetScale },
        blue: { ...violetScale },
        cyan: { ...violetScale },
        indigo: { ...violetScale },
        sky: { ...violetScale },
        
        // Semantic Theme Colors (matches palette: #FFFFFF/#101312/#BAF91A/#E2FF99/#876DFF)
        theme: {
          bg: 'var(--theme-bg)',
          'bg-secondary': 'var(--theme-bg-secondary)',
          card: 'var(--theme-card)',
          border: 'var(--theme-border)',
          accent: 'var(--theme-accent)',
          'accent-hover': 'var(--theme-accent-hover)',
          'accent-soft': 'var(--theme-accent-soft)',
          highlight: 'var(--theme-highlight)',
          text: 'var(--theme-text)',
          'text-muted': 'var(--theme-text-muted)',
        }
      },
    },
  },
  plugins: [],
}
