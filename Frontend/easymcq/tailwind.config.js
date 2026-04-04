module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bbfc',
          400: '#8196f8',
          500: '#6270f1',
          600: '#4e4fe5',
          700: '#423dca',
          800: '#3833a3',
          900: '#2f2d81',
          950: '#1e1b4b',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}