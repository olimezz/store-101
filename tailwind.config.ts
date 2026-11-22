import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E2E8F0",
        primary: {
          DEFAULT: "#0052FF",
          hover: "#003ECC",
          dark: "#1D4ED8",
        },
        accent: {
          DEFAULT: "#FF5A1F",
          hover: "#E0440C",
        },
        ink: {
          DEFAULT: "#0F172A",
          secondary: "#475569",
        },
        season: {
          summer: "#F59E0B",
          "summer-bg": "#FEF3C7",
          winter: "#0EA5E9",
          "winter-bg": "#E0F2FE",
          allseason: "#10B981",
          "allseason-bg": "#D1FAE5",
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
        "finder": "0 24px 48px -12px rgba(15, 23, 42, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
