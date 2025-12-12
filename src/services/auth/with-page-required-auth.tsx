"use client";
import { useRouter } from "next/navigation";
import useAuth from "./use-auth";
import React, { FunctionComponent, useEffect } from "react";
import useLanguage from "../i18n/use-language";
import { RoleEnum } from "../api/types/role";

type PropsTy = {
  params: { [key: string]: string | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
};

type OptionsType = {
  roles: RoleEnum[];
};

const roles = Object.values(RoleEnum).filter(
  (value) => !Number.isNaN(Number(value))
) as RoleEnum[];

// Default allowed roles - exclude GUEST (3) from protected routes
const defaultAllowedRoles = roles.filter((role) => role !== RoleEnum.GUEST);

function withPageRequiredAuth(
  Component: FunctionComponent<PropsTy>,
  options?: OptionsType
) {
  // Compute allowed roles once - stable value from HOC options
  const allowedRoles = options?.roles || defaultAllowedRoles;

  return function WithPageRequiredAuth(props: PropsTy) {
    const { user, isLoaded } = useAuth();
    const router = useRouter();
    const language = useLanguage();

    useEffect(() => {
      const check = () => {
        if (!isLoaded) return;

        // If user exists but is GUEST, redirect to confirm-code
        if (user && user?.role?.id === RoleEnum.GUEST) {
          const phoneNumber = user.phoneNumber?.toString() || "";
          router.replace(`confirm-code?p=${phoneNumber}`);
          return;
        }

        // If user has valid role, allow access
        if (
          user &&
          user?.role?.id &&
          allowedRoles.includes(Number(user?.role.id))
        ) {
          return;
        }

        // No user or invalid role - redirect to login
        const currentLocation = window.location.toString();
        const returnToPath =
          currentLocation.replace(new URL(currentLocation).origin, "") ||
          `/${language}`;
        const params = new URLSearchParams({
          returnTo: returnToPath,
        });

        let redirectTo = `check-phone-number?${params.toString()}`;

        if (user) {
          redirectTo = `/${language}`;
        }

        router.replace(redirectTo);
      };

      check();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isLoaded, router, language]); // allowedRoles is stable from HOC closure

    return user &&
      user?.role?.id &&
      allowedRoles.includes(Number(user?.role.id)) ? (
      <Component {...props} />
    ) : null;
  };
}

export default withPageRequiredAuth;
