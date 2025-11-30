import Cookies from "js-cookie";

const CAMERA_ID_COOKIE_KEY = "preferred_camera_id";

/**
 * Set the preferred camera ID cookie
 */
export function setCameraIdCookie(deviceId: string) {
  Cookies.set(CAMERA_ID_COOKIE_KEY, deviceId, {
    expires: 365, // Cookie expires in 1 year
    path: "/", // Make cookie available across all routes
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Get the preferred camera ID from cookie
 * Returns the device ID or null if not found
 */
export function getCameraIdCookie(): string | null {
  if (typeof window === "undefined") return null;
  const deviceId = Cookies.get(CAMERA_ID_COOKIE_KEY);
  return deviceId || null;
}

/**
 * Clear the camera ID cookie
 */
export function clearCameraIdCookie() {
  Cookies.remove(CAMERA_ID_COOKIE_KEY, { path: "/" });
}
