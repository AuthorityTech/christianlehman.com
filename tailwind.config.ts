import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        link: "#4a6b82",
      },
      typography: {
        rams: {
          css: {
            "--tw-prose-body": "#1a1a1a",
            "--tw-prose-headings": "#1a1a1a",
            "--tw-prose-links": "#4a6b82",
            "--tw-prose-bold": "#1a1a1a",
            "--tw-prose-counters": "#6b6b6b",
            "--tw-prose-bullets": "#8a8a8a",
            "--tw-prose-hr": "#e5e5e5",
            "--tw-prose-quotes": "#6b6b6b",
            "--tw-prose-quote-borders": "#e5e5e5",
            "--tw-prose-code": "#1a1a1a",
            "--tw-prose-pre-code": "#1a1a1a",
            "--tw-prose-pre-bg": "#f0f0f0",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;