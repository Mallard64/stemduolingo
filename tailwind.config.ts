import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#DC2626",
          dark: "#991B1B",
          light: "#FEE2E2",
        },
        bg: "#FFFFFF",
        surface: "#FAFAFA",
        border: "#E5E5E5",
        ink: {
          DEFAULT: "#18181B",
          muted: "#71717A",
          subtle: "#A1A1AA",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        streak: "#F97316",
      },
      keyframes: {  
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%,60%": { transform: "translateX(-6px)" },
          "40%,80%": { transform: "translateX(6px)" },
        },
        "count-up": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        shake: "shake 320ms ease-in-out",
        "count-up": "count-up 220ms ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
