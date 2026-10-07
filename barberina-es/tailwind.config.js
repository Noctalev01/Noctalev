/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fondo: "#FBFAF7",
        tinta: "#141C30",
        sub: "#5B6478",
        sub2: "#8A92A6",
        oro: "#F59E0B",
        oro2: "#D97706",
        rojo: "#C8102E",
        verde: "#1B7F3B",
        verde2: "#2FA35A",
        wa: "#25D366",
        linea: "#ECE8DF",
      },
      fontFamily: { sora: ["var(--font-sora)", "sans-serif"], inter: ["var(--font-inter)", "sans-serif"] },
    },
  },
  plugins: [],
};
