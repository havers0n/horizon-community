import type { Config } from 'tailwindcss'

export default {
  darkMode: "class",
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        // Основная цветовая палитра HorizonCommunity
        horizon: {
          50: "#f5f3f0",   // Самый светлый - основной фон
          100: "#e8e5e0",  // Светлый - границы и фоны
          200: "#d4d0cb",  // Светло-серый
          300: "#c0bbb6",  // Средне-серый
          400: "#a8a39e",  // Серый
          500: "#718096",  // Основной серый цвет
          600: "#5a6b7a",  // Темно-серый
          700: "#43545e",  // Очень темно-серый
          800: "#2c3d42",  // Почти черный
          900: "#1e2a3a",  // Основной темный цвет
        },
        // Золотая акцентная палитра
        gold: {
          50: "#fdfbf8",   // Самый светлый золотой
          100: "#faf7f0",  // Светлый золотой
          200: "#f5f0e0",  // Бледно-золотой
          300: "#e8dcc0",  // Светло-золотой
          400: "#d4c490",  // Средне-золотой
          500: "#c6a96b",  // Основной золотой цвет
          600: "#b89d5a",  // Темно-золотой
          700: "#a89149",  // Очень темно-золотой
          800: "#988538",  // Почти коричневый
          900: "#887927",  // Коричневый
        },
        // Дополнительная темная палитра
        dark: {
          50: "#f5f3f0",   // Светлый фон
          100: "#e8e5e0",  // Светло-серый
          200: "#d4d0cb",  // Серый
          300: "#a8a39e",  // Средне-серый
          400: "#718096",  // Основной серый
          500: "#5a6b7a",  // Темно-серый
          600: "#43545e",  // Очень темно-серый
          700: "#2c3d42",  // Почти черный
          800: "#1e2a3a",  // Основной темный
          900: "#161e28",  // Самый темный
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "loading-dots": {
          "0%, 20%": {
            color: "rgba(0, 0, 0, 0)",
            textShadow: "0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0)",
          },
          "40%": {
            color: "black",
            textShadow: "0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0)",
          },
          "60%": {
            textShadow: "0.25em 0 0 black, 0.5em 0 0 rgba(0, 0, 0, 0)",
          },
          "80%, 100%": {
            textShadow: "0.25em 0 0 black, 0.5em 0 0 black",
          },
        },
        "modal-enter": {
          from: { opacity: "0", transform: "scale(0.95) translateY(-10px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "list-item-enter": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "progress-fill": {
          from: { width: "0%" },
          to: { width: "100%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-gentle": "pulse-gentle 2s infinite",
        "loading-dots": "loading-dots 1.4s infinite",
        "modal-enter": "modal-enter 0.2s ease-out",
        "list-item-enter": "list-item-enter 0.3s ease-out",
        "progress-fill": "progress-fill 1s ease-out",
      },
      boxShadow: {
        'horizon': '0 4px 14px 0 rgba(30, 42, 58, 0.25)',
        'horizon-lg': '0 10px 25px 0 rgba(30, 42, 58, 0.3)',
        'horizon-xl': '0 20px 40px 0 rgba(30, 42, 58, 0.35)',
        'gold': '0 4px 14px 0 rgba(198, 169, 107, 0.25)',
        'gold-lg': '0 10px 25px 0 rgba(198, 169, 107, 0.3)',
        'gold-xl': '0 20px 40px 0 rgba(198, 169, 107, 0.35)',
      },
      backgroundImage: {
        'gradient-horizon': 'linear-gradient(135deg, #1e2a3a 0%, #718096 100%)',
        'gradient-horizon-subtle': 'linear-gradient(135deg, #e8e5e0 0%, #f5f3f0 100%)',
        'gradient-gold': 'linear-gradient(135deg, #c6a96b 0%, #b89d5a 100%)',
        'gradient-gold-subtle': 'linear-gradient(135deg, #f5f3f0 0%, #e8e5e0 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1e2a3a 0%, #2c3d42 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config 