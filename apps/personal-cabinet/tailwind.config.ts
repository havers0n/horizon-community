import type { Config } from 'tailwindcss'
import defaultTheme from "tailwindcss/defaultTheme"

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
        surface: {
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
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
        // HorizonCommunity brand colors - simplified
        horizon: {
          50: "#f5f3f0",
          100: "#e8e5e0",
          200: "#d4d0cb",
          300: "#c0bbb6",
          400: "#a8a39e",
          500: "#718096", // Primary brand color
          600: "#5a6b7a",
          700: "#43545e",
          800: "#2c3d42",
          900: "#1e2a3a", // Main dark color
        },
        // Gold accent colors
        gold: {
          50: "#fdfbf8",
          100: "#faf7f0",
          200: "#f5f0e0",
          300: "#e8dcc0",
          400: "#d4c490",
          500: "#c6a96b", // Primary gold
          600: "#b89d5a",
          700: "#a89149",
          800: "#988538",
          900: "#887927",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
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
        sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
        // Brand-specific shadows
        horizon: '0 4px 14px 0 rgba(30, 42, 58, 0.25)',
        gold: '0 4px 14px 0 rgba(198, 169, 107, 0.25)',
      },
      backgroundImage: {
        'gradient-horizon': 'linear-gradient(135deg, #1e2a3a 0%, #718096 100%)',
        'gradient-gold': 'linear-gradient(135deg, #c6a96b 0%, #b89d5a 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config 