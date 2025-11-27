import Cookies from "js-cookie";

const RETURNING_USER_COOKIE_KEY = "returning_user";

/**
 * Set the returning_user cookie to indicate the user has a valid account
 */
export function setReturningUserCookie() {
  Cookies.set(RETURNING_USER_COOKIE_KEY, "true", {
    expires: 365, // Cookie expires in 1 year
    path: "/", // Make cookie available across all routes
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Check if the returning_user cookie exists
 */
export function hasReturningUserCookie(): boolean {
  if (typeof window === "undefined") return false;
  return Cookies.get(RETURNING_USER_COOKIE_KEY) === "true";
}

/**
 * Clear the returning_user cookie
 */
export function clearReturningUserCookie() {
  Cookies.remove(RETURNING_USER_COOKIE_KEY, { path: "/" });
}
