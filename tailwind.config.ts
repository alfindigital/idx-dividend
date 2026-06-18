import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: v("--bg"),
        surface: {
          DEFAULT: v("--surface"),
          2: v("--surface-2"),
        },
        line: v("--border"),
        fg: v("--fg"),
        muted: v("--muted"),
        faint: v("--faint"),
        accent: v("--accent"),
        brand: {
          DEFAULT: v("--brand"),
          strong: v("--brand-strong"),
          dark: v("--brand-strong"),
          light: v("--brand"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
      borderRadius: {
        // skala lebih tajam ("tajam & rapat") — kartu jadi 12px, bukan 16px
        xl: "0.625rem",
        "2xl": "0.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgb(8 8 13 / 0.04), 0 1px 3px rgb(8 8 13 / 0.05)",
        glow: "0 8px 24px -10px rgb(79 70 229 / 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
