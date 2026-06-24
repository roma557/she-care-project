import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FDF8F6",
        surface: "#FFFFFF",
        rose: {
          deep: "var(--rose-deep)",
          mid: "var(--rose-mid)",
          soft: "var(--rose-soft)",
          pale: "var(--rose-pale)",
        },
        blush: "#FAF0F2",
        ink: {
          DEFAULT: "#2A1A1F",
          mid: "#6B4451",
          faint: "#B89AA2",
        },
        gold: "#C9956A",
        plan: {
          starter: {
            light: "#E8F0FA",
            mid: "#4A7FD4",
            deep: "#1E4D8C",
          },
          plus: {
            light: "#E8EDFA",
            mid: "#5878C8",
            deep: "#2D4580",
          },
          premium: {
            light: "#FBF3E4",
            mid: "#C9956A",
            deep: "#8B6914",
            dark: "#6B5010",
          },
        },
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
        cta: "var(--shadow-cta)",
        avatar: "var(--shadow-avatar)",
        "glass-card": "0 8px 32px rgba(180, 60, 90, 0.25)",
        "cycle-card": "var(--shadow-cycle-card)",
      },
      borderRadius: {
        card: "20px",
        icon: "18px",
      },
      transitionDuration: {
        perf: "var(--transition-base)",
        "perf-fast": "var(--transition-fast)",
        "perf-slow": "var(--transition-slow)",
      },
    },
  },
  plugins: [],
};

export default config;
