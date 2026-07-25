<script lang="ts">
import Navbar from "$lib/components/Navbar.svelte";
import Sidebar from "$lib/components/Sidebar.svelte";
import Card from "$lib/components/Card.svelte";
import Loader from "$lib/components/Loader.svelte";
import { me } from "$lib/services/auth";

let user = $state<any>(null);
let loading = $state(true);
let path = "/profile";

$effect(() => {
async function load() {
try {
const res = await me();
if (res.data?.success) user = res.data.user;
} catch {
// Not authenticated - redirect handled by layout
} finally {
loading = false;
}
}
load();
});
</script>

<div class="flex">
	<Sidebar currentPath={path} />
	<div class="flex-1 bg-gray-50 min-h-screen">
		<Navbar userName={user?.name || "User"} />

		{#if loading}
			<Loader text="Loading profile..." />
		{:else}
			<div class="p-6 space-y-6 max-w-2xl">
				<div>
					<h1 class="text-2xl font-bold text-gray-800">Profile</h1>
					<p class="text-gray-500 mt-1">Your account details</p>
				</div>

				<Card>
					<div class="flex items-center gap-6">
						<div class="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
							<span class="text-3xl font-bold text-indigo-600">{(user?.name || "U").charAt(0).toUpperCase()}</span>
						</div>
						<div class="space-y-2">
							<h2 class="text-xl font-semibold text-gray-800">{user?.name || "User"}</h2>
							<p class="text-gray-500">{user?.email || "N/A"}</p>
						</div>
					</div>
				</Card>
			</div>
		{/if}
	</div>
</div>
