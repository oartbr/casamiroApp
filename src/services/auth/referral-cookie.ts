import Cookies from "js-cookie";

const REFERRAL_CODE_COOKIE_KEY = "referral_code";

/**
 * Set the referral code cookie
 */
export function setReferralCodeCookie(referralCode: string) {
  Cookies.set(REFERRAL_CODE_COOKIE_KEY, referralCode.toUpperCase(), {
    expires: 30, // Cookie expires in 30 days
    path: "/", // Make cookie available across all routes
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Get the referral code from cookie
 */
export function getReferralCodeCookie(): string | null {
  if (typeof window === "undefined") return null;
  const code = Cookies.get(REFERRAL_CODE_COOKIE_KEY);
  return code ? code.toUpperCase() : null;
}

/**
 * Clear the referral code cookie
 */
export function clearReferralCodeCookie() {
  Cookies.remove(REFERRAL_CODE_COOKIE_KEY, { path: "/" });
}
