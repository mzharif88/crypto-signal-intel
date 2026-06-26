import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-space)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex)", "Courier New", "monospace"],
      },
      colors: {
        bg: "#0A0E17",
        surface: "#111827",
        surface2: "#162032",
        border: "#1E2A3B",
        border2: "#253549",
        cyan: "#06B6D4",
        green: "#10B981",
        amber: "#F59E0B",
        red: "#EF4444",
        purple: "#8B5CF6",
        text: "#E2E8F0",
        muted: "#64748B",
        dim: "#334155",
      },
      backgroundImage: {
        "glow-cyan": "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.12) 0%, transparent 70%)",
        "glow-green": "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 60%)",
        "card-border": "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(139,92,246,0.1), rgba(16,185,129,0.2))",
      },
      animation: {
        "count-up": "countUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.3s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        countUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};

export default config;
