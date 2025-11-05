/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/web/app/**/*.{ts,tsx}",
    "./apps/web/components/**/*.{ts,tsx}",
    "./packages/ui/src/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#020202",
        surface: "#0b0b11",
        "surface-muted": "#13131c",
        "surface-hover": "#1a1a26",
        border: "#1f2233",
        "text-primary": "#f8f9fb",
        "text-secondary": "#a4acc3",
        neon: {
          green: "#00ff88",
          turquoise: "#40e0d0",
        }
      },
      boxShadow: {
        neon: "0 0 28px rgba(0, 255, 136, 0.45)",
        "neon-hover": "0 0 36px rgba(64, 224, 208, 0.55)"
      },
      backgroundImage: {
        "neon-button": "linear-gradient(135deg, rgba(0,255,136,0.85), rgba(64,224,208,0.85))",
        "neon-outline": "linear-gradient(135deg, rgba(0,255,136,0.4), rgba(64,224,208,0.4))"
      },
      fontFamily: {
        grotesk: ["'Space Grotesk'", "system-ui", "sans-serif"],
        inter: ["'Inter'", "system-ui", "sans-serif"],
        cascadia: ["'Cascadia Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      transitionTimingFunction: {
        "soft-spring": "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  }
};
