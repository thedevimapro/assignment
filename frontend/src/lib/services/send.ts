import { api } from "$lib/api/client";

export const sendEmail = (form: FormData) =>
  api.post("/send", form);