/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#059669",
        "primary-hover": "#047857",
        "primary-active": "#065F46",
        accent: "#34D399",
        background: "#0D0D0D",
        surface: "#171717",
        "surface-elevated": "#202020",
        border: "#333333",
        "text-primary": "#ECFDF5",
        "text-muted": "#B3B3B3",
        focus: "#059669",
        disabled: {
          background: "#202020",
          text: "#B3B3B3",
        },
      },
    },
  },
  plugins: [],
};
