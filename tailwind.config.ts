import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0FDF4", // Very Light Green (#F0FDF4)
          100: "#DCFCE7", // Light Green (#DCFCE7)
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16834A", // Primary Green (#16834A)
          700: "#08633B", // Dark Green (#08633B)
          800: "#08633B",
          900: "#054629",
          950: "#022917",
        },
        accent: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#16834A",
          600: "#08633B",
          700: "#08633B",
          800: "#054629",
          900: "#022917",
          950: "#011D0F",
        },
        cream: {
          50: "#FFFFFF", // Clean White Canvas Background (#FFFFFF)
          100: "#F0FDF4", // Very Light Green tint (#F0FDF4)
          200: "#DCFCE7", // Light Green pill/badge (#DCFCE7)
          300: "#BBF7D0",
          400: "#86EFAC",
          500: "#16834A",
        },
        charcoal: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#172033", // Main Text (#172033)
          950: "#0F172A",
        },
        warmGray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0", // Borders (#E2E8F0)
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B", // Secondary Text (#64748B)
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#172033",
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16834A",
          700: "#15803D", // Success (#15803D)
        },
        offer: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706", // Warning (#D97706)
          700: "#B45309",
        },
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          600: "#DC2626", // Error (#DC2626)
          700: "#B91C1C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
