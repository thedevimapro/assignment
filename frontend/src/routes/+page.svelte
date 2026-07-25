<script lang="ts">
	import { login } from "$lib/services/auth";

	let email = $state("");
	let password = $state("");
	let loading = $state(false);
	let error = $state("");

	async function handleLogin() {
		console.log("Login button clicked");

		loading = true;
		error = "";

		try {
			// Make the request directly to the backend so the cookie is set for port 3000
			const response = await fetch("http://localhost:3000/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ email, password }),
			});

			const result = await response.json();

			if (result.success) {
				window.location.href = "http://localhost:3000/";
			} else {
				error = result.message || "Login failed";
			}
		} catch (err: any) {
			console.log("ERROR:", err);
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-700">
	<div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
		<h1 class="text-center text-4xl font-bold text-indigo-600">Email Sender</h1>

		<p class="mt-2 text-center text-gray-500">
			Secure bulk email management
		</p>

		{#if error}
			<div class="mt-4 rounded-lg bg-red-100 p-3 text-red-600">
				{error}
			</div>
		{/if}

		<form
			class="mt-8 space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				handleLogin();
			}}
		>
			<input
				bind:value={email}
				type="email"
				placeholder="Email"
				class="w-full rounded-lg border p-3"
			/>

			<input
				bind:value={password}
				type="password"
				placeholder="Password"
				class="w-full rounded-lg border p-3"
			/>

			<button
				type="submit"
				class="w-full rounded-lg bg-indigo-600 p-3 text-white hover:bg-indigo-700"
				disabled={loading}
			>
				{loading ? 'Signing In...' : 'Sign In'}
			</button>
		</form>
	</div>
</div>