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

function withPageRequiredAuth(
  Component: FunctionComponent<PropsTy>,
  options?: OptionsType
) {
  const optionRoles = options?.roles || roles;

  return function WithPageRequiredAuth(props: PropsTy) {
    const { user, isLoaded } = useAuth();
    const router = useRouter();
    const language = useLanguage();

    useEffect(() => {
      const check = () => {
        if (
          (user &&
            user?.role?.id &&
            optionRoles.includes(Number(user?.role.id))) ||
          !isLoaded
        )
          return;

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
    }, [user, isLoaded, router, language]);

    return user &&
      user?.role?.id &&
      optionRoles.includes(Number(user?.role.id)) ? (
      <Component {...props} />
    ) : null;
  };
}

export default withPageRequiredAuth;
