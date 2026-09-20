import axios from "axios";
import { Platform } from "react-native";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "@/utils/token";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://172.20.10.7:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Attach token sa bawat request ───────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── AUTO REFRESH TOKEN (parehong pattern gaya ng admin) ─────
let isRefreshing = false;
let refreshQueue: ((token: string | null) => void)[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // May kasalukuyang refresh na — maghintay lang, huwag na duplicate ang refresh call
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        await saveTokens(newAccess, refreshToken);

        refreshQueue.forEach((cb) => cb(newAccess));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshErr) {
        refreshQueue.forEach((cb) => cb(null));
        refreshQueue = [];
        await clearTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const updateLocation = async (lat: number, lng: number) => {
  return api.put("/user/location", {
    last_known_latitude: lat,
    last_known_longitude: lng,
  });
};