import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        head: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-dm)", "sans-serif"],
      },
      colors: {
        bg: "#0a0a0f",
        surface: "#12121a",
        surface2: "#1a1a26",
        accent: "#c8f564",
        purple: "#7c6cfc",
        warm: "#ff6b4a",
        teal: "#2de2c4",
      },
    },
  },
  plugins: [],
};
export default config;
