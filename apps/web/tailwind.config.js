/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#f1f5f9',
        accent: '#0d9488',
        accentDark: '#0f766e',
        warn: '#b45309',
        danger: '#b91c1c'
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
