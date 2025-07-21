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
        border: 'var(--border, #e5e7eb)', // fallback на стандартный цвет Tailwind
      },
      colors: {
        border: 'var(--border, #e5e7eb)',
        background: 'var(--background, #fff)', // <--- добавлено
      },
    },
  },
  plugins: [],
};

