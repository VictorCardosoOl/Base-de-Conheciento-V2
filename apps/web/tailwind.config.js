/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,md,mdx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      '4xl': '2560px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '2.5rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '5rem',
        '4xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
    },
    extend: {
      screens: {
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      maxWidth: {
        'screen-2xl': '1536px',
        'screen-3xl': '1920px',
        'screen-4xl': '2560px',
        'cinema': '2200px',
        'cinema-ultra': '2560px',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
      },
    },
  },
};

export default config;
