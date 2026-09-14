/* @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          100: "#e8f1ed",
          200: "#c6d9d2",
          300: "#9dbab1",
          400: "#72968d",
          500: "#52776f",
          600: "#3b5c57",
          700: "#294540",
          800: "#1b3333",
          900: "#303438",
        },
        emerald: {
          300: "#8bb8d6",
          400: "#4c8bb5",
          500: "#245b82",
          600: "#193f5c",
        },
        blue: {
          400: "#65c7d0",
          500: "#35a9b6",
          600: "#218591",
        },
        violet: {
          400: "#f0b267",
          500: "#db8a4f",
          600: "#bd6844",
        },
        purple: {
          300: "#f3c77a",
          400: "#edaa59",
          500: "#d78645",
          600: "#b9673b",
        },
        rose: {
          400: "#ff8b79",
          500: "#ed685d",
        },
        amber: {
          300: "#f8d887",
          400: "#f2c14e",
          500: "#dba52e",
        },
        sky: {
          200: "#a5e5e2",
          300: "#67d0ce",
          400: "#3eb8bb",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "Trebuchet MS", "sans-serif"],
      },
    },
  },
  plugins: [],
};
