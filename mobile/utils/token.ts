// ─────────────────────────────────────────────────────────────
// utils/token.ts
// ─────────────────────────────────────────────────────────────

import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

// ── Save tokens ──────────────────────────────────────────────
export const saveTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
};

// ── Get tokens ───────────────────────────────────────────────
export const getAccessToken = () =>
  SecureStore.getItemAsync(ACCESS_KEY);

export const getRefreshToken = () =>
  SecureStore.getItemAsync(REFRESH_KEY);

// ── Remove tokens ────────────────────────────────────────────
export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
};