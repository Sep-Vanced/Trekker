import { LoginPayload, RegisterPayload } from "@/types/auth";
import { api } from "./client";

export const loginUser = (data: LoginPayload) => api.post("/auth/login", data);

export const registerUser = (data: RegisterPayload) =>
  api.post("/auth/register", data);

export const logoutUser = async () => {
  return api.post("/auth/logout");
};

export const getCurrentUser = async (token: string) => {
  const res = await api.get("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.user; 
};