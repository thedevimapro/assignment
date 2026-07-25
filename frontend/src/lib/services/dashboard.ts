import { api } from "$lib/api/client";

export const getDashboard = () =>
  api.get("/dashboard/data");

export const getPollStatus = () =>
  api.get("/dashboard/poll-status");