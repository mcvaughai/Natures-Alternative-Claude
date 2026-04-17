import type { Config } from "tailwindcss";

// ─── Brand Color Placeholders ─────────────────────────────────────────────────
// TODO: Replace with final brand colors once confirmed.
// These are neutral stand-ins. Update primary, accent, and neutral to
// match the Nature's Alternative palette.

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Semantic tokens (HSL vars — required for Tailwind v3 opacity modifiers) ──
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // ── Brand palette — PLACEHOLDER, update once brand colors land ──
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Direct hex values for use outside CSS-var context (e.g. SVGs, emails)
          // TODO: replace with final brand values
          light:   "#6fa880",
          dark:    "#2e5038",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          // TODO: replace with final brand values
          light:   "#dba85e",
          dark:    "#9a6420",
        },
        neutral: {
          50:  "#f8f5f0",
          100: "#ede9e2",
          200: "#d8d0c4",
          300: "#c0b5a5",
          400: "#a79a87",
          500: "#8c7f6b",
          600: "#716553",
          700: "#574e3f",
          800: "#3c362c",
          900: "#221e18",
        },

        // ── UI surface tokens ──
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      fontFamily: {
        // TODO: update with brand typography choices
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
