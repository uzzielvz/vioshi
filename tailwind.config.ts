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
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          alt: "var(--surface-alt)",
          panel: "var(--panel)",
          fill: "var(--fill)",
        },
      },
      // Escala tipográfica: seis pasos con nombre, en vez de los doce tamaños
      // sueltos que circulaban. `label` y `body` son los dos que mandan en la
      // densidad de Grailed; el resto es jerarquía.
      fontSize: {
        // Escala legible. Grailed usa 14-16px para contenido; 10-11px en todo
        // el texto es lo que hacía ver el panel como letra chiquita apretada.
        label: ['11px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        meta: ['13px', { lineHeight: '1.5' }],
        body: ['14px', { lineHeight: '1.6' }],
        lead: ['16px', { lineHeight: '1.6' }],
        title: ['20px', { lineHeight: '1.3' }],
        display: ['32px', { lineHeight: '1.1' }],
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
