<script lang="ts">
	let { userName = "User" }: { userName?: string } = $props();

	import { logout } from "$lib/services/auth";

	async function handleLogout() {
		try {
			await logout();
			window.location.href = "/";
		} catch (e) {
			console.error(e);
		}
	}
</script>

<nav class="flex items-center justify-between bg-white shadow-sm px-6 py-4 border-b border-gray-200">
	<div class="flex items-center gap-3">
		<h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
			Email Sender
		</h1>
	</div>

	<div class="flex items-center gap-4">
		<span class="text-gray-700 flex items-center gap-2">
			<span class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
				{userName.charAt(0).toUpperCase()}
			</span>
			<span class="text-sm font-medium">Welcome, {userName}</span>
		</span>

		<button
			onclick={handleLogout}
			class="rounded-lg bg-red-500 px-4 py-2 text-sm text-white font-medium hover:bg-red-600 transition-colors"
		>
			Logout
		</button>
	</div>
</nav>

