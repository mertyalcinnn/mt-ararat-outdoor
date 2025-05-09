/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};