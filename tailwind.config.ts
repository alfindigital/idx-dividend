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
          // alias lama agar kelas lama (brand-dark / brand-light) tetap valid
          dark: v("--brand-strong"),
          light: v("--brand"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -16px rgb(15 23 42 / 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
