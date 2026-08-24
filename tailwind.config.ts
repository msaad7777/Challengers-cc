import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Club identity, taken from the crest and playing kit ──────────
        // Sampled from CCC-Logo.png and the 2026 jerseys: a near-black ground,
        // a yellow-leaning lime that glows around the shield (#95D016 →
        // #75A817, highlighting to #E8FF4F), and chrome lettering.
        //
        // The crest uses lime as an EDGE, never as a fill — so the bright
        // shades live at 300/400 for text, borders and glows, and the deeper
        // shades at 500-700 carry button fills. That ordering matters: every
        // button on the site inherits body text colour instead of setting its
        // own, so a bright fill at 500/600 would fail contrast in ~225 places.
        // Buttons are large + semibold, so the 3:1 large-text threshold
        // applies, and 500/600 clear it.
        primary: {
          50: '#f5fce8',
          100: '#e8f8c7',
          200: '#d3f193',
          300: '#b8e657',
          400: '#9bd524', // the crest lime — text, borders, glows on dark
          500: '#659112', // button fills start here: 3.2:1 under gray-100
          600: '#527614',
          700: '#425e14',
          800: '#364c14',
          900: '#2d3f14',
          950: '#161f07',
        },
        // Chrome — the bats and "CHALLENGERS" lettering on the crest.
        // Replaces the old gold, which appears nowhere in the identity.
        // Carries a faint green cast so it reads as chosen, not default grey.
        accent: {
          50: '#f9faf9',
          100: '#f0f2f0',
          200: '#e1e5e1',
          300: '#c7cdc8',
          400: '#a9b1aa',
          500: '#8d958e',
          600: '#717971',
          700: '#585e58',
          800: '#3f443f',
          900: '#2b2e2b',
          950: '#171917',
        },
        // Neutrals re-cast toward the crest's near-black ground. Same
        // lightness ramp as Tailwind's default grey, shifted green, so every
        // existing `gray-*` class picks up the club's ground without any
        // component edits.
        gray: {
          50: '#f6f8f6',
          100: '#ebeeeb',
          200: '#d7dcd8',
          300: '#b3bab5',
          400: '#89928b',
          500: '#6a736c',
          600: '#535b55',
          700: '#414843',
          800: '#2b302d',
          900: '#191d1a',
          950: '#0b0e0c',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
