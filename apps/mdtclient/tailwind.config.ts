import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../libs/shared-types/src/**/*.{js,jsx,ts,tsx}",
    "../../libs/shared/schema/src/**/*.{js,jsx,ts,tsx}",
    "../../libs/shared-utils/src/**/*.{js,jsx,ts,tsx}",
    // Более специфичные пути для избежания сканирования node_modules
    "../../apps/mdtclient/src/**/*.{js,jsx,ts,tsx}",
    "../../apps/client/src/**/*.{js,jsx,ts,tsx}",
    "../../libs/shared-types/src/**/*.{js,jsx,ts,tsx}",
    "../../libs/shared/schema/src/**/*.{js,jsx,ts,tsx}",
    "../../libs/shared-utils/src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Сдержанные цвета для статусов
        status: {
          available: "#27AE60", // Спокойный зеленый
          busy: "#F2994A", // Янтарный
          onscene: "#9B59B6", // Глубокий фиолетовый
          panic: "#E74C3C", // Ярко-красный для паники
          enroute: "#3498DB", // Синий для "в пути"
          unavailable: "#95A5A6", // Серый для недоступности
        },
      },
      fontFamily: {
        mono: ['"Roboto Mono"', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config; 