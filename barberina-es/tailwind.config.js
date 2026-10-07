/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fondo: "#F6F2EA",
        crema: "#F8F5EF",
        tinta: "#13231B",
        bosque: "#0E3B2B",
        bosque2: "#145238",
        sub: "#5E6A63",
        sub2: "#9A968C",
        oro: "#E0A63A",
        oro2: "#C9862A",
        rojo: "#C8102E",
        verde: "#1B7F3B",
        verde2: "#2FA35A",
        wa: "#25D366",
        linea: "#E9E2D4",
      },
      fontFamily: { sora: ["var(--font-sora)", "sans-serif"], inter: ["var(--font-inter)", "sans-serif"] },
    },
  },
  plugins: [],
};
