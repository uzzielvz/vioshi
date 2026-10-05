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
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
        },
        line: {
          DEFAULT: "var(--line)",
          soft: "var(--line-soft)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          alt: "var(--surface-alt)",
          fill: "var(--fill)",
        },
      },
      // Escala tipográfica: seis pasos con nombre, en vez de los doce tamaños
      // sueltos que circulaban. `label` y `body` son los dos que mandan en la
      // densidad de Grailed; el resto es jerarquía.
      fontSize: {
        label: ['10px', { lineHeight: '1.4' }],
        body: ['11px', { lineHeight: '1.6' }],
        read: ['13px', { lineHeight: '1.6' }],
        title: ['18px', { lineHeight: '1.2' }],
        display: ['28px', { lineHeight: '1.05' }],
        hero: ['44px', { lineHeight: '1' }],
      },
      fontFamily: {
        // Una sola familia. Antes el config declaraba la de sistema mientras
        // 59 archivos escribían Helvetica Neue inline: dos tipografías según
        // dónde se mirara.
        sans: ["Helvetica Neue", "Inter", "Helvetica", "Arial", "sans-serif"],
        system: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "sans-serif"],
        logo: ["var(--font-logo)"],
      },
      letterSpacing: {
        wide: '0.05em',
        wider: '0.1em',
      },
    },
  },
  plugins: [],
};
export default config;
