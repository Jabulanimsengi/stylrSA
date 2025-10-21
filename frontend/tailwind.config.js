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
        primary: {
          DEFAULT: '#F51957',
          hover: '#d4144c',
          light: '#ff2d6f',
          strong: '#b80f41',
          soft: '#ff9ab5',
        },
        neutral: {
          50: '#FFFFFF',
          100: '#FEFEFE',
          200: '#D7C9BE',
          700: '#4D4952',
          800: '#424049',
          900: '#43414A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
};


