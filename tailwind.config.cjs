/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}', // Scans all .html, .js, .svelte, .ts files in the src directory
    './src/app.html' // Specifically include app.html if you use classes there
  ],
  theme: {
    extend: {
      colors: {
        'brand-gold': '#D5BA7F',
        'primary': '#4a90e2', // Updated primary color
        'primary-dark': '#3a80d2', // Added darker variant for hover states
        'card': 'white',
        'muted': '#e2e8f0',      // slate-200
        'foreground': '#0f172a', // slate-900
        'muted-foreground': '#64748b', // slate-500
      },
      fontFamily: {
        fanwood: ['Fanwood_Text', 'serif'], // Added Fanwood_Text, with serif as a fallback
      },
      // You can extend the default Tailwind theme here if needed
    },
  },
  plugins: [
    // You can add Tailwind plugins here if needed
  ],
}