import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#fdf8ef",
          100: "#f9edcf",
          200: "#f3d99e",
          300: "#ecc06a",
          400: "#e4a33e",
          500: "#db8922",
          600: "#c26d19",
          700: "#a15318",
          800: "#83411a",
          900: "#6b3618",
        },
        ancient: {
          dark: "#2c1810",
          medium: "#5c3d2e",
          light: "#8b6650",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
