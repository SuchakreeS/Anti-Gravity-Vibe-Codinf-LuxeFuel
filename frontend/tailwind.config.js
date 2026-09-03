/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        asphalt: '#050508',
        carbon: 'var(--surface)',
        'jdm-purple': '#280137',
        'jdm-neon': '#A855F7',
        'neon-violet': '#A855F7',
        'turbo-orange': 'var(--turbo-orange)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'industrial-border': 'var(--border)',
        'border': 'var(--border)',
        // Literal hex, not var() — these are theme-invariant instrument
        // colors (a gauge face doesn't change with light/dark mode), and
        // Tailwind can only apply opacity modifiers (e.g. border-chrome/30)
        // to literal color values, not CSS custom properties.
        'gauge-face': '#0A0A0C',
        'chrome': '#C7CCD6',
        'led-amber': '#FFB020',
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        midnight_jdm: {
          // Was #280137 (midnight-purple) — nearly the same near-black as
          // base-100 (#050508), so text-primary/badge-primary/bg-primary
          // were effectively invisible on this theme. Electric indigo keeps
          // the JDM neon feel while giving ~7:1 contrast on base-100.
          "primary": "#818CF8", // electric-indigo
          "secondary": "#A855F7", // neon-violet
          "accent": "#F97316", // turbo-orange
          "neutral": "#0F111A", // surface
          "base-100": "#050508", // background
          // Explicit surface steps — without these daisyUI auto-derives
          // base-200/300 from base-100, and on a near-black base-100 that
          // auto-shade barely differs, so cards/rows blended together.
          "base-200": "#10121C",
          "base-300": "#1B2136",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
        light_jdm: {
          "primary": "#4C1D95",
          "secondary": "#7C3AED",
          "accent": "#EA580C",
          "neutral": "#E2E8F0",
          "base-100": "#F1F5F9",
          "base-200": "#E7ECF2",
          "base-300": "#D7DEE8",
          "info": "#0EA5E9",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
      },
      "luxury",
    ],
  },
}
