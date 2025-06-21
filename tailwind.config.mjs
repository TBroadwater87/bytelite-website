/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'electric-cyan': '#00D4FF',
        'deep-space': '#0A0E27', 
        'quantum-pink': '#FF006E',
        'void-black': '#060813',
        'dark-navy': '#0F172A'
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'drift': 'drift 20s linear infinite'
      }
    },
  },
  plugins: [],
}
