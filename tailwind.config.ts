import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090F",
        surface: "#0F1117",
        "surface-2": "#171B26",
        border: "#1E2435",
        "border-light": "#2A3450",
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
          light: "#A78BFA",
        },
        accent: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          light: "#FCD34D",
        },
        text: {
          DEFAULT: "#F1F5F9",
          muted: "#94A3B8",
          dim: "#64748B",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%)",
        "hero-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.3), transparent)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "typing": "typing 0.5s steps(1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        typing: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      boxShadow: {
        "glow-primary": "0 0 30px rgba(124, 58, 237, 0.3)",
        "glow-accent": "0 0 30px rgba(245, 158, 11, 0.3)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
