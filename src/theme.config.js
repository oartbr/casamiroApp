"use client";

const clientTheme = {
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#ff6600" },
        secondary: { main: "#ff0000" },
        background: {
          default: "#f6f6f6", // Light mode default background
          paper: "#fff", // Background for paper surfaces
          bar: "#A5B5C2", // for the appBar
        },
      },
    },
    dark: {
      palette: {
        primary: { main: "#ff6600" },
        secondary: { main: "#004310" },
        background: {
          default: "#222229", // Dark mode default background
          paper: "#333333", // toolbar bg color
          bar: "#09141f", // for the appBar
        },
      },
    },
  },
  typography: {
    subtitle1: {
      fontSize: 12,
    },
    body1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: { backgroundColor: "var(--mui-palette-background-bar)" },
      },
    },
    ThemeSwitchButton: {
      styleOverrides: {
        colorPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.mode === "dark" ? "#f00" : "#09141f",
        }),
      },
    },
    Button: {
      styleOverrides: {
        colorPrimary: { color: "#fff" },
        color: "#f00",
      },
    },
  },
  customImages: {
    // this images need to stay in the public folder, including the favicon.ico which is not listed here
    long: "/logo.casamiro.svg", // svg 503x138px
    short: "/logo.casamiro.short.svg", // svg 177x135px
    hero: "/assets/images/home.png", // check why this one is not really there
    pwa: "/logo.casamiro.pwa.png", // png 150x150px
  },
};

export default clientTheme;
