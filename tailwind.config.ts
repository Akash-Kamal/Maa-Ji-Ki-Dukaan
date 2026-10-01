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
        brand: {
          50: "#F2F9F5",
          100: "#E2F2E9",
          200: "#C3E5D2",
          300: "#96D1B2",
          400: "#5EB68B",
          500: "#2F9868",
          600: "#065D32", // Primary Forest Green (from 'm' in official logo)
          700: "#054D29",
          800: "#043E21",
          900: "#03321B",
          950: "#011D0F",
        },
        accent: {
          50: "#F6FDEB",
          100: "#EBFCDB",
          200: "#D6F8B5",
          300: "#BCF28A",
          400: "#98E852",
          500: "#53B31E", // Vibrant Lime Accent (from 'j' in official logo)
          600: "#459B17",
          700: "#367B13",
          800: "#2B6011",
          900: "#234F10",
          950: "#102906",
        },
        cream: {
          50: "#b7e09b", // Exact User Requested Canvas Background
          100: "#a9d98c", // Secondary Green (Card hover, headers)
          200: "#99cf7a", // Light Green Borders & Subtle Pills
          300: "#86c464",
          400: "#70b44c",
          500: "#579f33",
        },
        charcoal: {
          50: "#F6F7F6",
          100: "#E7E9E8",
          200: "#D1D5D2",
          300: "#B0B6B2",
          400: "#888F8A",
          500: "#6D746F",
          600: "#585E5A",
          700: "#474D49",
          800: "#2B302D",
          900: "#1A1E1C", // Signature Deep Charcoal
          950: "#111413",
        },
        warmGray: {
          50: "#F7FAF8",
          100: "#EFF5F1",
          200: "#DCE6DF",
          300: "#C4D2C9",
          400: "#8FA496",
          500: "#64796B",
          600: "#4B5D52",
          700: "#39473E",
          800: "#252F29",
          900: "#161D19",
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
        offer: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        }
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
