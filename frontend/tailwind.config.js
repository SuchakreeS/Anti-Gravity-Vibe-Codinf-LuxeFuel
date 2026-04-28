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
          "primary": "#280137", // midnight-purple
          "secondary": "#A855F7", // neon-violet
          "accent": "#F97316", // turbo-orange
          "neutral": "#0F111A", // surface
          "base-100": "#050508", // background
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
      "luxury",
    ],
  },
}
