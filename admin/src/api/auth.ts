import { apiFetch, setToken, setRefreshToken } from "./client";
import type { User } from "@/types/auth";

export async function login(username: string, password: string): Promise<User> {
  const data = await apiFetch<{ user: User; access: string; refresh: string }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ username, password }) },
  );
  setToken(data.access);
  setRefreshToken(data.refresh);
  return data.user;
}