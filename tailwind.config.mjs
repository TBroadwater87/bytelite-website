/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'bl-bg':         '#07090f',
        'bl-surface':    '#0d1120',
        'bl-border':     '#1a2235',
        'bl-text':       '#e4e7f2',
        'bl-muted':      '#7b829e',
        'bl-dim':        '#4a5068',
        'bl-accent':     '#6366f1',
        'bl-pink':       '#ec4899',
        'bl-green':      '#34d399',
        'bl-purple':     '#a78bfa',
        // legacy compat
        'electric-cyan': '#00D4FF',
        'dark-navy':     '#0F172A',
        'deep-space':    '#0A0E27',
        'void-black':    '#060813',
        'quantum-pink':  '#FF006E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
