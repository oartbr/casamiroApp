"use client";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import { GetLogos } from "@/components/theme/themes";
import MenuBuilder from "./menuBuilder";

function ResponsiveAppBar() {
  const { user, isLoaded } = useAuth();
  const { logOut } = useAuthActions();
  const logos = GetLogos();
  return (
    <MenuBuilder
      user={user}
      isLoaded={isLoaded}
      logOut={logOut}
      logos={logos}
      pwa={true}
    />
  );
}
export default ResponsiveAppBar;
