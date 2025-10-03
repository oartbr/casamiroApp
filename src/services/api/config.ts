"use client";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1";
// to-do: find out why GARANTIA_API_URL is not visible here
export const GARANTIA_CODE_LENGTH = process.env.GARANTIA_CODE_LENGTH || 7;
export const GARANTIA_CODE_TYPE = process.env.GARANTIA_CODE_TYPE || "string";
export const GARANTIA_CODE_PREFIX = process.env.GARANTIA_CODE_PREFIX || "WSE";

export const AUTH_REFRESH_URL = API_URL + "/v1/auth/refresh";
export const AUTH_ME_URL = API_URL + "/v1/auth/me";
export const AUTH_LOGOUT_URL = API_URL + "/v1/auth/logout";
