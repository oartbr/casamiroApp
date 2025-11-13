"use client";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import IconButton from "@mui/material/IconButton";
import { useColorScheme } from "@mui/material/styles";

const ThemeSwitchButton = () => {
  const { mode, setMode } = useColorScheme();

  return (
    <IconButton
      disableRipple
      onClick={() => {
        setMode?.(mode === "dark" ? "light" : "dark");
      }}
      color="inherit"
    >
      {mode === "dark" ? (
        <Brightness7Icon sx={{ width: 35, height: 35 }} />
      ) : (
        <Brightness4Icon sx={{ width: 35, height: 35 }} />
      )}
    </IconButton>
  );
};

export default ThemeSwitchButton;
