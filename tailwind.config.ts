import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0D12",
          900: "#0F1318",
          850: "#141921",
          800: "#1B212B",
          700: "#272F3B",
          600: "#3A4351",
        },
        // Light mode surface colors
        surface: {
          50: "#f9fafb",
          100: "#f0f2f5",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
        },
        mint: {
          400: "var(--color-accent)",
          500: "var(--color-accent)",
          600: "var(--color-accent)",
        },
        coral: {
          400: "#FF8080",
          500: "#FF5D5D",
          600: "#E84545",
        },
        amber: {
          300: "#F6CC7A",
          400: "#F2B84B",
        },
        paper: {
          100: "#EDEFF2",
          300: "#A8B0BC",
          500: "#6B7480",
        },
        accent: "var(--color-accent)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(180deg, rgba(46,217,164,0.08) 0%, rgba(10,13,18,0) 60%)",
      },
      boxShadow: {
        verifter: "0 1px 0 0 rgba(255,255,255,0.04) inset",
        card: "0 2px 8px rgba(0,0,0,0.3)",
        "card-light": "0 2px 8px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
