/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
          muted: '#dbeafe',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f4f4f5',
        },
        danger: '#dc2626',
        success: '#16a34a',
      },
    },
  },
  plugins: [],
};
