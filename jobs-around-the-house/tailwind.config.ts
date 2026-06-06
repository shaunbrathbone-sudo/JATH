import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef3f8',
          100: '#dce6f0',
          200: '#b4c9e0',
          300: '#8ba7c8',
          400: '#5b7ba5',
          500: '#3d5a80',
          600: '#2e4368',
          700: '#243556',
          800: '#1a2744',
          900: '#111d2e',
          950: '#0d1520',
        },
        teal: {
          50: '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#00bcd4',
          600: '#00acc1',
          700: '#0097a7',
        },
      },
    },
  },
  plugins: [],
};

export default config;
