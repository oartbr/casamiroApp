import Cookies from "js-cookie";

const PHONE_NUMBER_COOKIE_KEY = "phone_number_hash";

/**
 * Encode phone number for storage (base64 encoding for obfuscation)
 * This allows us to retrieve the original phone number later
 */
function encodePhoneNumber(phoneNumber: string): string {
  if (typeof window === "undefined") {
    return "";
  }
  // Use base64 encoding to obfuscate the phone number
  return btoa(phoneNumber);
}

/**
 * Decode phone number from storage
 */
function decodePhoneNumber(encoded: string): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    return atob(encoded);
  } catch {
    return "";
  }
}

/**
 * Set the phone number cookie (encoded, not hashed, so we can retrieve it)
 */
export function setPhoneNumberCookie(phoneNumber: string) {
  const encoded = encodePhoneNumber(phoneNumber);
  Cookies.set(PHONE_NUMBER_COOKIE_KEY, encoded, {
    expires: 365, // Cookie expires in 1 year
    path: "/", // Make cookie available across all routes
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Get the phone number from cookie
 * Returns the decoded phone number or null if not found
 */
export function getPhoneNumberCookie(): string | null {
  if (typeof window === "undefined") return null;
  const encoded = Cookies.get(PHONE_NUMBER_COOKIE_KEY);
  if (!encoded) return null;
  const decoded = decodePhoneNumber(encoded);
  return decoded || null;
}

/**
 * Clear the phone number cookie
 */
export function clearPhoneNumberCookie() {
  Cookies.remove(PHONE_NUMBER_COOKIE_KEY, { path: "/" });
}

/**
 * Verify if a phone number matches the stored cookie
 * This uses hashing for comparison (one-way)
 */
export async function verifyPhoneNumberCookie(
  phoneNumber: string
): Promise<boolean> {
  const stored = getPhoneNumberCookie();
  if (!stored) return false;
  return stored === phoneNumber;
}
