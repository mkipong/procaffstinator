/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'trello-blue': '#0079BF',
        'trello-dark': '#172B4D',
        'trello-light': '#F8F9FA',
      },
    },
  },
  plugins: [],
};
