import { api } from "$lib/api/client";

export const getSMTPConfigs = () =>
  api.get("/config/smtp");

export const createSMTP = (data: unknown) =>
  api.post("/config/smtp", data);

export const updateSMTP = (id: string, data: unknown) =>
  api.put(`/config/smtp/${id}`, data);

export const deleteSMTP = (id: string) =>
  api.delete(`/config/smtp/${id}`);