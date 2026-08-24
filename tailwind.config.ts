import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        stone: "#e7e5e4",
        sand: "#f8fafc",
        sea: "#0ea5a4",
        brand: {
          DEFAULT: "#df6d32",
          dark: "#9f421d",
          soft: "#fcebe2"
        }
      }
    }
  },
  plugins: []
};

export default config;
