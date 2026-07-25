<script lang="ts">
	const menu = [
		{ name: "Dashboard", icon: "📊", path: "/dashboard" },
		{ name: "SMTP", icon: "⚙️", path: "/smtp" },
		{ name: "Compose", icon: "✉️", path: "/compose" },
		{ name: "Reports", icon: "📈", path: "/reports" },
		{ name: "Profile", icon: "👤", path: "/profile" },
	];

	let { currentPath = "/dashboard" }: { currentPath?: string } = $props();
</script>

<aside class="w-64 bg-indigo-700 text-white min-h-screen flex flex-col">
	<div class="p-6">
		<div class="text-2xl font-bold tracking-tight">
			📧 Dashboard
		</div>
		<p class="text-indigo-300 text-xs mt-1">Bulk Email Management</p>
	</div>

	<nav class="flex-1 px-4 space-y-1">
		{#each menu as item}
			<a
				href={item.path}
				class={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
					currentPath === item.path
						? "bg-indigo-500 text-white shadow-md"
						: "text-indigo-200 hover:bg-indigo-600 hover:text-white"
				}`}
			>
				<span class="text-lg">{item.icon}</span>
				{item.name}
			</a>
		{/each}
	</nav>

	<div class="p-6 border-t border-indigo-600">
		<div class="text-xs text-indigo-300">
			<p>Bulk Email Sender</p>
			<p class="mt-1">v2.0.0</p>
		</div>
	</div>
</aside>

