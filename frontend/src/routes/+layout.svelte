<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import "../app.css";
	import { me } from "$lib/services/auth";

	let { children } = $props();

	// Route protection - redirect to login if not authenticated
	$effect(() => {
		async function checkAuth() {
			const protectedRoutes = ['/dashboard', '/smtp', '/compose', '/reports', '/profile'];
			const currentPath = window.location.pathname;
			
			if (protectedRoutes.some(p => currentPath.startsWith(p))) {
				try {
					const res = await me();
					if (!res.data?.success) {
						window.location.href = "/";
					}
				} catch {
					window.location.href = "/";
				}
			}
		}
		checkAuth();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
