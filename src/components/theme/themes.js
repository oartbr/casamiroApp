import mamut from "./theme.config";

const ClientThemes = {
  mamut,
  default: {},
};

ClientThemes.default = ClientThemes[process.env.NEXT_PUBLIC_THEME] || mamut;

export const LOGO =
  process.env.CLIENT_LOGO ||
  "https://xvzq0akbnljx2cl9.public.blob.vercel-storage.com/themes/wse/logo.wse.short.white-pn6QrG6ag6In2ivoueODvCs3mQ85Hm.svg";

const GetTheme = () => {
  return ClientThemes.default;
};

export const GetLogos = () => {
  return {
    long: ClientThemes.default.customImages.long,
    short: ClientThemes.default.customImages.short,
    hero: ClientThemes.default.customImages.hero,
    pwa: ClientThemes.default.customImages.pwa,
  };
};

export default GetTheme;
