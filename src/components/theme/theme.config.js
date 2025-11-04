"use client";

import extendTheme from "@mui/material/styles/experimental_extendTheme";

const clientTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2a3a58" },
        secondary: { main: "#ff0000" },
        background: {
          default: "#fff", // Light mode default background
          paper: "#f6f6f6", // Background for paper surfaces
        },
      },
    },
    dark: {
      palette: {
        primary: { main: "#0070a4" },
        secondary: { main: "#004310" },
        background: {
          default: "#112627", // Dark mode default background
          paper: "#003c4a", // toolbar bg color
        },
      },
    },
  },
  customImages: {
    long: "/logo.mamut.svg",
    short: "/logo.mamut.short.svg",
    hero: "/images/clientA-hero.jpg",
    pwa: "/mamut.png",
  },
});

export default clientTheme;
