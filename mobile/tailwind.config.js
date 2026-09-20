/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        trail: {
          brown:  "#6b4c2a",
          tan:    "#c4a265",
          sand:   "#e8d5b7",
          rock:   "#8c7b6e",
          dark:   "#1a1208",
        },
        danger: "#ef4444",
        warning: "#f97316",
        safe: "#22c55e",
      },
      fontFamily: {
        display: ["Montserrat-Bold"],
        heading: ["Montserrat-SemiBold"],
        body: ["Lato-Regular"],
        mono: ["SpaceMono"],
      },
    },
  },
  plugins: [],
};