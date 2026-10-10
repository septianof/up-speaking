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
        primary: {
          50: "#EFF6FC",
          100: "#DCECF8",
          200: "#B8DAF1",
          300: "#8FC2E8",
          400: "#61A9DD",
          500: "#3D98D6", // Official Up Speaking Sky Blue
          600: "#2B82BF",
          700: "#206798",
          800: "#1B567E",
          900: "#1A4867",
        },
        accent: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#ED3937", // Official Up Speaking Coral Red
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        success: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        surface: {
          white: "#FFFFFF",
          bg: "#F8FAFC", // Slate 50
          subtle: "#F1F5F9", // Slate 100
          border: "#E2E8F0", // Slate 200
        },
        text: {
          primary: "#0F172A", // Slate 900
          secondary: "#334155", // Slate 700
          muted: "#64748B", // Slate 500
          disabled: "#94A3B8", // Slate 400
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        float: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
