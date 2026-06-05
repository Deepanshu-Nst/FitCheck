/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Brand Palette ─────────────────────────────────────────
        // Dark backgrounds — deep charcoal / near-black
        background: {
          DEFAULT: '#0A0A0F',
          secondary: '#12121A',
          tertiary: '#1A1A24',
          card: '#16161E',
        },
        // Gold accent — premium fashion-tech feel
        gold: {
          DEFAULT: '#C8A96E',
          light: '#D4B97E',
          dark: '#A8893E',
          muted: '#C8A96E33',
        },
        // Surface neutrals
        surface: {
          DEFAULT: '#1E1E2A',
          elevated: '#252532',
          border: '#2A2A3A',
        },
        // Text hierarchy
        text: {
          primary: '#F5F5F0',
          secondary: '#A0A0B0',
          muted: '#5A5A70',
          inverse: '#0A0A0F',
        },
        // Status colors
        success: '#4CAF7D',
        warning: '#F0A030',
        error: '#E05454',
        info: '#6B9FE4',
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'System'],
        medium: ['Inter_500Medium', 'System'],
        semibold: ['Inter_600SemiBold', 'System'],
        bold: ['Inter_700Bold', 'System'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
    },
  },
  plugins: [],
};
