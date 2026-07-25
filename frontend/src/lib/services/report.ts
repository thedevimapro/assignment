import { api } from "$lib/api/client";

export const getReports = () =>
  api.get("/report");