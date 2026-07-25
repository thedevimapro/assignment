import { api } from "$lib/api/client";

export interface User {
	id: string;
	email: string;
	name: string;
}

let currentUser = $state<User | null>(null);
let loading = $state(true);

export function getAuthStore() {
	return {
		get user() { return currentUser; },
		get loading() { return loading; },
		async checkAuth() {
			try {
				loading = true;
				const res = await api.get("/auth/me");
				if (res.data?.success) {
					currentUser = res.data.user;
				} else {
					currentUser = null;
				}
			} catch {
				currentUser = null;
			} finally {
				loading = false;
			}
		},
		async logout() {
			try {
				await api.post("/auth/logout");
			} catch {}
			currentUser = null;
			window.location.href = "/";
		}
	};
}

