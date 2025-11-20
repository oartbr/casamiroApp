"use client";

import { experimental_extendTheme as extendTheme } from "@mui/material/styles";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import { useMemo, PropsWithChildren } from "react";
import clientTheme from "../../theme.config";

function ThemeProvider(props: PropsWithChildren<{}>) {
  const themeProvided = useMemo(() => extendTheme(clientTheme), []);
  return (
    <CssVarsProvider theme={themeProvided} defaultMode="system">
      {props.children}
    </CssVarsProvider>
  );
}

export default ThemeProvider;
