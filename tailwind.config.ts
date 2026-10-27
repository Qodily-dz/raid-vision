import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "rgb(var(--black) / <alpha-value>)",
        char: "rgb(var(--char) / <alpha-value>)",
        "char-2": "rgb(var(--char-2) / <alpha-value>)",
        "char-3": "rgb(var(--char-3) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          dim: "rgb(var(--ink-dim) / <alpha-value>)",
          faint: "rgb(var(--ink-faint) / <alpha-value>)",
        },
        violet: "rgb(var(--violet) / <alpha-value>)",
        glow: "rgb(var(--glow) / <alpha-value>)",
        neon: "rgb(var(--neon) / <alpha-value>)",
        haze: "rgb(var(--haze) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        arabic: ["var(--font-arabic)"],
        arabicDisplay: ["var(--font-arabic-display)"],
      },
      letterSpacing: {
        cinematic: "0.42em",
        credits: "0.2em",
      },
      maxWidth: {
        measure: "38rem",
      },
      transitionTimingFunction: {
        cinema: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
} satisfies Config;