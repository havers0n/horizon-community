/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./client/index.html",
    "./shared/**/*.{ts,js}"
  ],
  theme: {
    extend: {
      borderColor: {
        border: 'hsl(var(--border))', // fallback на стандартный цвет Tailwind
      },
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        // Можно добавить success, destructive и т.д. по аналогии
      },
      boxShadow: {
        'primary': '0 4px 14px 0 hsl(var(--primary) / 0.10)', // 10% opacity
        'primary-25': '0 4px 14px 0 hsl(var(--primary) / 0.25)', // 25% opacity
        'primary-5': '0 4px 14px 0 hsl(var(--primary) / 0.05)', // 5% opacity
        'success-25': '0 4px 14px 0 hsl(var(--success) / 0.25)',
        'warning-25': '0 4px 14px 0 hsl(var(--warning) / 0.25)',
        'destructive-25': '0 4px 14px 0 hsl(var(--destructive) / 0.25)',
      },
    },
  },
  plugins: [],
};

