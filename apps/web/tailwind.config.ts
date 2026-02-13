import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        board: {
          light: "#F5E6C8",
          dark: "#8B6914",
          "river-light": "#7BC4C4",
          "river-dark": "#3D7A7A",
        },
        piece: {
          "white-fill": "#FAF0DC",
          "white-stroke": "#3D2B1F",
          "black-fill": "#2C1810",
          "black-stroke": "#D4C5A9",
        },
        action: {
          move: "#3B82F6",
          capture: "#EF4444",
          pushback: "#F97316",
          longshot: "#A855F7",
        },
      },
    },
  },
  plugins: [],
};

export default config;
