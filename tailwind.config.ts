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
        background: "#111315",
        "background-secondary": "#171A1D",
        card: "#1D2125",
        "card-elevated": "#22272B",
        border: "#30363D",
        foreground: "#F3F6F8",
        "foreground-secondary": "#9CA6AF",
        muted: "#68727C",
        primary: "#58C7FF",
        "primary-hover": "#7DD6FF",
        positive: "#65D6A6",
        negative: "#FF7A8A",
        warning: "#F2C66D",
      },
      boxShadow: {
        glow: "0 0 20px rgba(88, 199, 255, 0.18)",
        card: "0 4px 24px rgba(0, 0, 0, 0.25)",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
