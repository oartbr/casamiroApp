"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tokens } from "./types/tokens";
import { TokensInfo } from "../auth/auth-context";
import { AUTH_REFRESH_URL } from "./config";
import { FetchInputType, FetchInitType } from "./types/fetch-params";
import useLanguage from "../i18n/use-language";
import HTTP_CODES_ENUM from "./types/http-codes";

function useFetchBase() {
  const language = useLanguage();
  const router = useRouter();

  const redirectToCheckPhone = useCallback(() => {
    // Only redirect if we're not already on the check-phone-number page
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("check-phone-number")
    ) {
      router.push("/check-phone-number");
    }
  }, [router]);

  return useCallback(
    async (
      input: FetchInputType,
      init?: FetchInitType,
      tokens?: Tokens & {
        setTokensInfo?: (tokensInfo: TokensInfo) => void;
      }
    ) => {
      let headers: HeadersInit = {
        "x-custom-lang": language,
      };

      if (!(init?.body instanceof FormData)) {
        headers = {
          ...headers,
          "Content-Type": "application/json",
        };
      }

      // Check if access token is already expired
      if (tokens?.tokenExpires && tokens.tokenExpires <= Date.now()) {
        // Token is expired, try to refresh
        if (tokens?.refreshToken) {
          try {
            const refreshResponse = await fetch(AUTH_REFRESH_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokens.refreshToken}`,
              },
            });

            if (refreshResponse.ok) {
              const newTokens = await refreshResponse.json();
              if (newTokens.token) {
                tokens?.setTokensInfo?.({
                  token: newTokens.token,
                  refreshToken: newTokens.refreshToken,
                  tokenExpires: newTokens.tokenExpires,
                });

                headers = {
                  ...headers,
                  Authorization: `Bearer ${newTokens.token}`,
                };
              } else {
                // Refresh failed, redirect to login
                tokens?.setTokensInfo?.(null);
                redirectToCheckPhone();
                throw new Error("Refresh token expired");
              }
            } else {
              // Refresh token is invalid, redirect to login
              tokens?.setTokensInfo?.(null);
              redirectToCheckPhone();
              throw new Error("Refresh token expired");
            }
          } catch (error) {
            tokens?.setTokensInfo?.(null);
            redirectToCheckPhone();
            throw error;
          }
        } else {
          // No refresh token, redirect to login
          tokens?.setTokensInfo?.(null);
          redirectToCheckPhone();
          throw new Error("No refresh token available");
        }
      } else if (tokens?.token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${tokens.token}`,
        };
      }

      // Proactive refresh: refresh token if it expires within 5 minutes (300000ms)
      // This prevents users from hitting expiration during active use
      const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
      const shouldRefresh =
        tokens?.tokenExpires &&
        tokens.tokenExpires > Date.now() && // Token is still valid
        tokens.tokenExpires <= Date.now() + REFRESH_THRESHOLD_MS;

      if (shouldRefresh && tokens?.refreshToken) {
        try {
          const refreshResponse = await fetch(AUTH_REFRESH_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokens.refreshToken}`,
            },
          });

          if (refreshResponse.ok) {
            const newTokens = await refreshResponse.json();
            if (newTokens.token) {
              tokens?.setTokensInfo?.({
                token: newTokens.token,
                refreshToken: newTokens.refreshToken,
                tokenExpires: newTokens.tokenExpires,
              });

              headers = {
                ...headers,
                Authorization: `Bearer ${newTokens.token}`,
              };
            }
          } else {
            // Refresh failed, but token is still valid, continue with current token
            console.warn("Token refresh failed, using current token");
          }
        } catch (error) {
          // Refresh failed, but token is still valid, continue with current token
          console.warn("Token refresh error, using current token:", error);
        }
      }

      const response = await fetch(input, {
        ...init,
        headers: {
          ...headers,
          ...init?.headers,
        },
      });

      // Handle 401 Unauthorized responses
      if (response.status === HTTP_CODES_ENUM.UNAUTHORIZED) {
        tokens?.setTokensInfo?.(null);
        redirectToCheckPhone();
        return response; // Return response so caller can handle it if needed
      }

      return response;
    },
    [language, redirectToCheckPhone]
  );
}

export default useFetchBase;
