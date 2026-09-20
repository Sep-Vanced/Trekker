import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser, getCurrentUser } from "@/api/auth";
import {
  saveTokens,
  getAccessToken,
  clearTokens,
} from "@/utils/token";
import { RegisterPayload } from "@/types/auth";
import * as Location from "expo-location";
import { updateLocation } from "@/api/client"; 


export type User = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  role: string;
};



type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<any>;
  signUp: (data: RegisterPayload) => Promise<any>;
  signOut: () => Promise<void>;
};

// ── Storage (ONLY USER, NOT TOKENS) ───────────────────────────

const STORAGE_USER = "@mapanuepe_user";

// ── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

const sendUserLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Location permission denied");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low, // ✅ more reliable
    });

    const lat = location.coords.latitude;
    const lng = location.coords.longitude;

    await updateLocation(lat, lng);
    console.log("Sent user location:", lat, lng);

  } catch (err) {
    console.log("Location error:", err);

    // ✅ FALLBACK (VERY IMPORTANT)
    try {
      const lastKnown = await Location.getLastKnownPositionAsync();

      if (lastKnown) {
        const lat = lastKnown.coords.latitude;
        const lng = lastKnown.coords.longitude;

        await updateLocation(lat, lng);

        console.log("Used last known location:", lat, lng);
      } else {
        console.log("No last known location available");
      }
    } catch (fallbackErr) {
      console.log("Fallback location failed:", fallbackErr);
    }
  }
};

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();

        if (!token) {
          setUser(null);
          return;
        }

        // ✅ Check expiration
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          await clearTokens();
          await AsyncStorage.removeItem(STORAGE_USER);
          setUser(null);
          return;
        }

        const userRes = await getCurrentUser(token);

        const userData: User = {
          id: String(userRes.id),
          username: userRes.username,
          email: userRes.email,
          first_name: userRes.first_name,
          last_name: userRes.last_name,
          phone: userRes.phone,
          emergency_contact_name: userRes.emergency_contact_name,
          emergency_contact_phone: userRes.emergency_contact_phone,
          role: userRes.role,
        };

        await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(userData));
        setUser(userData);

        await sendUserLocation();

      } catch (err) {
        console.log("Restore session error:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const res = await loginUser({ username, password });

      const { access, refresh } = res.data;

      // Save tokens
      await saveTokens(access, refresh);

      const userRes = await getCurrentUser(access);

      const userData: User = {
        id: String(userRes.id),
        username: userRes.username,
        email: userRes.email,
        first_name: userRes.first_name,
        last_name: userRes.last_name,
        phone: userRes.phone,
        emergency_contact_name: userRes.emergency_contact_name,
        emergency_contact_phone: userRes.emergency_contact_phone,
        role: userRes.role,
      };

      // ✅ Save to storage
      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(userData));

      setUser(userData);
      await sendUserLocation();

      // ✅ Return role so sign-in screen can redirect accordingly
      return { success: true, role: userData.role };
    } catch (err: any) {
      console.log("Login error:", err);
      return {
        success: false,
        error: err.response?.data?.detail || "Login failed",
      };
    }
  };

const signUp = async (formData: RegisterPayload) => {
  try {
    const payload = {
      username: formData.username,
      password: formData.password,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: "trekker",
      phone: formData.phone,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      offline_maps_downloaded: false,
    };

    await registerUser(payload);

    return { success: true };
  } catch (err: any) {
    console.log("Registration error:", err);
    return {
      success: false,
      error:
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})[0] ||
        "Registration failed",
    };
  }
};

  // ── SIGN OUT ───────────────────────────────────────────────
  const signOut = async () => {
    await clearTokens(); // 🔥 removes access + refresh
    await AsyncStorage.removeItem(STORAGE_USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}