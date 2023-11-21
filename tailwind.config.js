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
    createThemes(
      {
        light: {
          background: colors.slate[100],
          divider: colors.slate[500],
          header: colors.slate[900],
          primary: colors.slate[900],
          secondary: colors.slate[500],
          terciary: colors.slate[700],
          button: colors.slate[300],
          'button-hover': colors.slate[400],
          drag: colors.slate[200],
          'drag-hover': colors.slate[300],
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
      },
      { defaultTheme: { light: 'light', dark: 'dark' } },
    ),
  ],
};
