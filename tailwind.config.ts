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
        bg: "#FDF8F6",
        surface: "#FFFFFF",
        rose: {
          deep: "#C4647A",
          mid: "#D9899A",
          soft: "#EDB8C2",
          pale: "#F9EDF0",
        },
        blush: "#FAF0F2",
        ink: {
          DEFAULT: "#2A1A1F",
          mid: "#6B4451",
          faint: "#B89AA2",
        },
        gold: "#C9956A",
        /* legacy aliases — mapped to SheCare palette */
        pink: {
          dark: "#C4647A",
          mid: "#C4647A",
          light: "#F9EDF0",
        },
        purple: {
          dark: "#2A1A1F",
          mid: "#D9899A",
          light: "#F9EDF0",
        },
        teal: {
          dark: "#085041",
          mid: "#1D9E75",
          light: "#E1F5EE",
        },
        amber: {
          mid: "#C9956A",
          light: "#FAF0F2",
        },
        cream: "#FDF8F6",
        peach: "#FAF0F2",
        warm: "#C9956A",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        phone: "0 25px 50px -12px rgba(42, 26, 31, 0.12)",
        card: "0 2px 12px rgba(42, 26, 31, 0.04)",
        cta: "0 6px 24px rgba(196, 100, 122, 0.35)",
        avatar: "0 4px 16px rgba(196, 100, 122, 0.30)",
        "glass-card": "0 8px 32px rgba(180, 60, 90, 0.25)",
        "cycle-card": "0 8px 32px rgba(196, 100, 122, 0.35)",
      },
      borderRadius: {
        card: "20px",
        icon: "18px",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
