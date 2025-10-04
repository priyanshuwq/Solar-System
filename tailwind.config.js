/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        space: "#0b1020",
        accent: "#33f0ff",
        neon: "#9b8cff",
      },
      fontFamily: {
        display: ["Orbitron", "Exo 2", "Rajdhani", "sans-serif"],
      },
    },
  },
  plugins: [],
};
