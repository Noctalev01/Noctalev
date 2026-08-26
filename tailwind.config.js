/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        deep: "#05070f",
        txt: "#eef0fb",
        sub: "#8f97c0",
        sub2: "#aab2d8",
        green: "#7ee8b2",
        gold: "#fbd38d",
        gold2: "#f6ad55",
        lilac: "#a5b4fc",
        taboff: "#6a72a0"
      },
      fontFamily: { inter: ["Inter", "sans-serif"] }
    }
  },
  plugins: []
};
