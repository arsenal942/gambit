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
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "float-piece": "floatPiece 6s ease-in-out infinite",
        "float-piece-slow": "floatPiece 8s ease-in-out infinite",
        "bounce-down": "bounceDown 2s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatPiece: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(3deg)" },
        },
        bounceDown: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
