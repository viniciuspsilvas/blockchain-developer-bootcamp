import type { Config } from "tailwindcss";

export default {
  content: [
    // "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#0D121D",
        secondary: "#121A29",
        neutral: "#767F92",
        white: "#F1F2F9",
        blue: "#2187D0",
        red: "#F45353",
        green: "#25CE8F",
      },
      fontFamily: {
        "dm-sans": ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
