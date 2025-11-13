"use client";

import { experimental_extendTheme as extendTheme } from "@mui/material/styles";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import { useMemo, PropsWithChildren } from "react";

function ThemeProvider(props: PropsWithChildren<{}>) {
  const theme = useMemo(
    () =>
      extendTheme({
        colorSchemes: {
          light: {
            palette: {
              background: {
                default: "#ffffff", // light mode background color
              },
              primary: {
                main: "#b7d7f6", // custom primary color
                contrastText: "#006680",
              },
              secondary: {
                main: "#ff0000", // custom secondary color
                contrastText: "#006680",
              },
            },
          },
          dark: {
            palette: {
              background: {
                default: "#29343f", // dark mode background color
              },
              primary: {
                main: "#b7d7f6", // custom primary color
                contrastText: "#006680",
              },
              secondary: {
                main: "#ff0000", // custom secondary color
                contrastText: "#006680",
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
          button: {
            color: "colorPrimary",
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              colorPrimary: ({ theme }) => ({
                backgroundColor:
                  theme.palette.mode === "dark" ? "#09141f" : "#b7d7f6",
              }),
            },
          },
        },
      }),
    []
  );
  return (
    <CssVarsProvider theme={theme} defaultMode="system">
      {props.children}
    </CssVarsProvider>
  );
}

export default ThemeProvider;
