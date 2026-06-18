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
        pink: {
          dark: "#993556",
          mid: "#D4537E",
          light: "#FBEAF0",
        },
        purple: {
          dark: "#3C3489",
          mid: "#7F77DD",
          light: "#EEEDFE",
        },
        teal: {
          dark: "#085041",
          mid: "#1D9E75",
          light: "#E1F5EE",
        },
        amber: {
          mid: "#BA7517",
          light: "#FAEEDA",
        },
        cream: "#F5F0EB",
        peach: "#F4C4A8",
        warm: "#E8A87C",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        phone: "0 25px 50px -12px rgba(60, 52, 137, 0.15)",
        card: "0 4px 20px rgba(153, 53, 86, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
