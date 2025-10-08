/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Si algún día quieres controlar modo oscuro por clase, descomenta:
  // darkMode: "class",

  theme: {
    // Contenedor centrado y con padding sensible
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },

    extend: {
      // Pila de fuentes: usa Plus Jakarta Sans como primaria
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "Noto Sans",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
        ],
      },

      // Paleta de marca (opcional, útil para utilidades como text-brand-500)
      colors: {
        brand: {
          DEFAULT: "#14b8a6",
          50: "#f1fcfa",
          100: "#ccfbf7",
          200: "#99f6ee",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      },

      // Sombras útiles para tarjetas/bloques
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,.25)",
      },
    },
  },

  plugins: [
    require("@tailwindcss/typography"),
  ],
};
