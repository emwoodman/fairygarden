import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#faf9f5",
        paper: "#f5f0e7",
        linen: "#e1dccb",
        silk: "#e0dfd6",
        vellum: "#f0dcc0",
        grass: "#d8cc9a",
        muted: "#6b6456",
        lichen: "#c1c09f",
        moss: "#6c663d",
        ink: "#443e34",
        olive: "#746a25",
        rose: "#cba5a3",
        clay: "#cbb4a3",
      },
    },
  },
  plugins: [],
};
export default config;
