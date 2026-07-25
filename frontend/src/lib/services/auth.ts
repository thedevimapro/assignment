import { api } from "$lib/api/client";

export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

export const register = (
  name: string,
  email: string,
  password: string
) =>
  api.post("/auth/register", {
    name,
    email,
    password,
  });

export const logout = () =>
  api.post("/auth/logout");

export const me = () =>
  api.get("/auth/me");