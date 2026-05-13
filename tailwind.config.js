/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        luxury: "0 24px 60px rgba(15, 23, 42, 0.16)"
      }
    },
  },
  plugins: [],
};
