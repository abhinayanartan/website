import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: {
          50: "#F6F1FD",
          100: "#EBDFFA",
          200: "#D6BFF5",
          300: "#BF9AEE",
          400: "#A87AE6",
          DEFAULT: "#8B5CDD",
          600: "#7340C2",
          700: "#5B3299",
          800: "#43256F",
          900: "#2A1650", // footer / deep purple
          950: "#1A0D33",
        },
        gold: {
          50: "#FBF6E8",
          100: "#F5EAC9",
          200: "#EDD99A",
          300: "#E4C671",
          DEFAULT: "#D6AE4B",
          600: "#B8902F",
          700: "#8F6F23",
          800: "#6A5217",
        },
        vermilion: {
          100: "#FADDD2",
          300: "#EF8C69",
          DEFAULT: "#E4643A",
          600: "#C84A22",
          700: "#9E3919",
        },
        alabaster: "#FAF8F5",
        ink: "#2B2236",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D6AE4B 0%, #E4643A 100%)",
        "purple-gradient": "linear-gradient(135deg, #8B5CDD 0%, #2A1650 100%)",
        "radial-glow": "radial-gradient(circle at 50% 20%, rgba(214, 174, 75, 0.18) 0%, transparent 60%)",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(91, 50, 153, 0.25)",
        gold: "0 10px 30px -10px rgba(214, 174, 75, 0.55)",
        "gold-sm": "0 4px 14px -3px rgba(214, 174, 75, 0.4)",
        card: "0 4px 20px -2px rgba(42, 22, 80, 0.08)",
        "card-hover": "0 14px 34px -4px rgba(42, 22, 80, 0.14)",
      },
      screens: {
        xs: "400px",
      },
    },
  },
  plugins: [],
};
export default config;
