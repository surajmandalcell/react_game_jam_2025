/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "mine-placed": {
          "0%": { transform: "scale(0.8)", backgroundColor: "rgb(96 165 250)" },
          "50%": { transform: "scale(1.2)", backgroundColor: "rgb(59 130 246)" },
          "100%": { transform: "scale(1)", backgroundColor: "rgb(191 219 254)" },
        },
        "explosion": {
          "0%": { transform: "scale(1)", backgroundColor: "rgb(253 186 116)" },
          "50%": { transform: "scale(1.5)", backgroundColor: "rgb(239 68 68)" },
          "100%": { transform: "scale(1)", backgroundColor: "rgb(252 165 165)" },
        },
        "reveal": {
          "0%": { transform: "scale(0.9)", backgroundColor: "rgb(209 213 219)" },
          "50%": { transform: "scale(1.05)", backgroundColor: "rgb(229 231 235)" },
          "100%": { transform: "scale(1)", backgroundColor: "rgb(243 244 246)" },
        },
        "shake": {
          "0%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "50%": { transform: "translateX(5px)" },
          "75%": { transform: "translateX(-5px)" },
          "100%": { transform: "translateX(0)" },
        },
        "gorilla": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2) rotate(5deg)" },
          "100%": { transform: "scale(1)" },
        },
        "man": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2) rotate(-5deg)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "mine-placed": "mine-placed 0.5s ease-in-out",
        "explosion": "explosion 0.8s ease-in-out",
        "reveal": "reveal 0.5s ease-in-out",
        "shake": "shake 0.5s ease-in-out",
        "gorilla": "gorilla 0.8s ease-in-out",
        "man": "man 0.8s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 