import axios from "axios";

export const api = axios.create({
	baseURL: "/",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

console.log("Axios Base URL:", api.defaults.baseURL);