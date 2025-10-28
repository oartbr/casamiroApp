"use client";

import { Tokens } from "@/services/api/types/tokens";
import { User } from "@/services/api/types/user";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AuthActionsContext,
  AuthContext,
  AuthTokensContext,
  TokensInfo,
} from "./auth-context";
import Cookies from "js-cookie";
import useFetchBase from "@/services/api/use-fetch-base";
import { AUTH_LOGOUT_URL, AUTH_ME_URL } from "@/services/api/config";
import HTTP_CODES_ENUM from "../api/types/http-codes";

function AuthProvider(props: PropsWithChildren<{}>) {
  const AUTH_TOKEN_KEY = "auth-token-data";
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const isLoadingRef = useRef(false); // Prevent multiple simultaneous loads
  const hasMountedRef = useRef(false); // Track if component has mounted

  // Initialize tokensInfoRef with data from cookies synchronously
  const getInitialTokens = (): Tokens => {
    if (typeof window !== "undefined") {
      try {
        const cookieData = Cookies.get(AUTH_TOKEN_KEY);
        if (cookieData) {
          return JSON.parse(cookieData) as Tokens;
        }
      } catch (error) {
        console.error("Error parsing auth token from cookie:", error);
      }
    }
    return {
      token: null,
      refreshToken: null,
      tokenExpires: null,
    };
  };

  const tokensInfoRef = useRef<Tokens>(getInitialTokens());
  const fetchBase = useFetchBase();

  const setTokensInfoRef = useCallback((tokens: TokensInfo) => {
    tokensInfoRef.current = tokens ?? {
      token: null,
      refreshToken: null,
      tokenExpires: null,
    };
  }, []);

  const setTokensInfo = useCallback(
    (tokensInfo: TokensInfo) => {
      setTokensInfoRef(tokensInfo);

      if (tokensInfo) {
        Cookies.set(AUTH_TOKEN_KEY, JSON.stringify(tokensInfo), {
          expires: 7, // Cookie expires in 7 days
          path: "/", // Make cookie available across all routes
          sameSite: "lax", // Allow same-site navigation (better for SPAs)
          secure: process.env.NODE_ENV === "production", // Only secure in production
        });
      } else {
        Cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
        setUser(null);
      }
    },
    [setTokensInfoRef]
  );

  const logOut = useCallback(async () => {
    const tokens = JSON.parse(
      Cookies.get(AUTH_TOKEN_KEY) ?? "null"
    ) as TokensInfo;

    if (tokensInfoRef.current.token) {
      await fetchBase(
        AUTH_LOGOUT_URL,
        {
          method: "POST",
          body: JSON.stringify({ refreshToken: tokens?.refreshToken }),
        },
        {
          token: tokens?.token,
          refreshToken: tokens?.refreshToken,
          tokenExpires: tokens?.tokenExpires,
        }
      );
    }
    setTokensInfo(null);
  }, [setTokensInfo, fetchBase]);

  useEffect(() => {
    // Only load data once on mount
    const loadData = async () => {
      // Prevent multiple simultaneous loads
      if (isLoadingRef.current) {
        return;
      }

      if (hasMountedRef.current) {
        return;
      }

      hasMountedRef.current = true;
      isLoadingRef.current = true;

      try {
        const tokens = JSON.parse(
          Cookies.get(AUTH_TOKEN_KEY) ?? "null"
        ) as TokensInfo;

        setTokensInfoRef(tokens);

        if (tokens?.token) {
          const response = await fetchBase(
            AUTH_ME_URL,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${tokens.token}`,
              },
            },
            {
              token: tokens.token,
              refreshToken: tokens.refreshToken,
              tokenExpires: tokens.tokenExpires,
              setTokensInfo,
            }
          );

          if (response.status === HTTP_CODES_ENUM.UNAUTHORIZED) {
            setTokensInfo(null);
            setIsLoaded(true);
            isLoadingRef.current = false;
            return;
          }

          const data = await response.json();

          // Extract user from response - /me endpoint returns { user: {...}, memberships: [...], ... }
          const userData = data.user || data;

          if (userData && (userData.id || userData._id)) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setTokensInfo(null);
      } finally {
        setIsLoaded(true);
        isLoadingRef.current = false;
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const contextValue = useMemo(
    () => ({
      isLoaded,
      user,
    }),
    [isLoaded, user]
  );

  const contextActionsValue = useMemo(
    () => ({
      setUser,
      logOut,
    }),
    [logOut]
  );

  const contextTokensValue = useMemo(
    () => ({
      tokensInfoRef,
      setTokensInfo,
    }),
    [setTokensInfo]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthActionsContext.Provider value={contextActionsValue}>
        <AuthTokensContext.Provider value={contextTokensValue}>
          {props.children}
        </AuthTokensContext.Provider>
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}

export default AuthProvider;
