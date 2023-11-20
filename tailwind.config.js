import colors from 'tailwindcss/colors';
import { createThemes } from 'tw-colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    createThemes({
        light: {
          background: colors.white,
          divider: colors.white,
          header: colors.white,
          primary: colors.white,
          secondary: colors.white,
          terciary: colors.white,
          button: colors.white,
          'button-hover': colors.white,
          drag: colors.white,
          'drag-hover': colors.white,
        },
        dark: {
          background: colors.slate[900],
          divider: colors.slate[600],
          header: colors.slate[50],
          primary: colors.slate[50],
          secondary: colors.slate[400],
          terciary: colors.slate[300],
          button: colors.slate[600],
          'button-hover': colors.slate[500],
          drag: colors.slate[700],
          'drag-hover': colors.slate[600],
        },
    })
  ],
}
