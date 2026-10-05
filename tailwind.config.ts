import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        turtle: {
          bg: "#0a0a0f",
          surface: "#111218",
          card: "#161722",
          cardHover: "#1c1e2b",
          border: "#262938",
          yellow: "#eab308",
          yellowLight: "#fde047",
          yellowDark: "#ca8a04",
          gold: "#ffd700",
        },
        aggie: {
          maroon: "#500000",
          dark: "#350000",
          light: "#781818",
          subtle: "rgba(80, 0, 0, 0.2)",
          border: "#801212",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
