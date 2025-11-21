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
        },
      },
    },
    dark: {
      palette: {
        primary: { main: "#ff6600" },
        secondary: { main: "#004310" },
        background: {
          default: "#112627", // Dark mode default background
          paper: "#003c4a", // toolbar bg color
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
        colorPrimary: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === "dark" ? "#09141f" : "#A5B5C2",
        }),
      },
    },
    ThemeSwitchButton: {
      styleOverrides: {
        colorPrimary: ({ theme }) => ({
          color: theme.palette.mode === "dark" ? "#f00" : "#09141f",
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
