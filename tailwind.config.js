/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2D5A27", // Forest green
        secondary: "#8B7355", // Earth brown
        accent: "#D68C45", // Autumn orange
        dark: "#333333",
        light: "#F8F6F1", // Cream
        mountain: "#6D6875", // Mountain gray
        sky: "#86BBD8", // Sky blue
        leaf: "#5F8D4E" // Leaf green
      },
      opacity: {
        '90': '0.9',
        '80': '0.8',
        '70': '0.7',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  safelist: [
    'bg-primary',
    'text-primary',
    'hover:bg-primary',
    'bg-secondary',
    'text-secondary',
    'hover:bg-secondary',
    'bg-accent',
    'text-accent',
    'hover:bg-accent'
  ]
};