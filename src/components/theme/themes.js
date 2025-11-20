import theme from "../../theme.config";

const ClientThemes = {
  theme,
  default: {},
};

ClientThemes.default = theme;

const GetTheme = () => {
  return ClientThemes.default;
};

export const GetLogos = () => {
  return theme.customImages;
};

export default GetTheme;
