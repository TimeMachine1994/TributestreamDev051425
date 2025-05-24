/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}', // Scans all .html, .js, .svelte, .ts files in the src directory
    './src/app.html' // Specifically include app.html if you use classes there
  ],
  theme: {
    extend: {
      // You can extend the default Tailwind theme here if needed
    },
  },
  plugins: [
    // You can add Tailwind plugins here if needed
  ],
}