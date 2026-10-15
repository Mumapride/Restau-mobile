/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{jsx, js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // RESTAU canonical palette — emerald + slate (matches the Claude redesigns)
        primary: "#059669",
        "primary-dark": "#047857",
        "primary-light": "#ECFDF5",
        "primary-muted": "#ECFDF5",
        success: "#059669",
        "success-dark": "#047857",
        "success-light": "#ECFDF5",
        warning: "#F59E0B",
        "warning-light": "#FEF3C7",
        error: "#DC2626",
        "error-light": "#FEE2E2",
        // Typography & surface (slate neutrals)
        text: "#0F172A",
        "text-secondary": "#475569",
        "text-muted": "#64748B",
        border: "#E2E8F0",
        surface: "#FFFFFF",
        surfaceAlt: "#EDF1EE",
        background: "#F8FAFC",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(18,63,39,0.06)",
        md: "0 2px 6px rgba(18,63,39,0.08)",
        lg: "0 6px 16px rgba(18,63,39,0.10)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
