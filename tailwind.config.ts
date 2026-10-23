import type { Config } from "tailwindcss";

// Values come from docs/design/TOKENS.md (approved rail prototype).
const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: "#111111",
        paper: "#FFFFFF",
        carton: "#F3F2EE",
        line: "#E4E2DC",
        muted: "#6B6B66",
        accent: {
          DEFAULT: "#1F2BFF",
          press: "#1620D6",
          wash: "#F1F2FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        logo: ["var(--font-logo)"],
      },
      borderRadius: {
        btn: "3px",
      },
      letterSpacing: {
        wide: "0.05em",
        wider: "0.1em",
      },
    },
  },
  plugins: [],
};
export default config;
