<script lang="ts">
	import Navbar from "$lib/components/Navbar.svelte";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import StatCard from "$lib/components/StatCard.svelte";
	import Card from "$lib/components/Card.svelte";
	import Loader from "$lib/components/Loader.svelte";
	import { me } from "$lib/services/auth";
	import { getDashboard } from "$lib/services/dashboard";
	import { getSMTPConfigs } from "$lib/services/config";
	import { getReports } from "$lib/services/report";

	let user = $state<any>(null);
	let stats = $state<any>(null);
	let smtpCount = $state(0);
	let loading = $state(true);
	let recentActivity = $state<any[]>([]);
	let path = "/dashboard";

	$effect(() => {
		async function load() {
			try {
				const [userRes, reportRes, smtpRes] = await Promise.all([
					me(),
					getReports(),
					getSMTPConfigs()
				]);

				if (userRes.data?.success) user = userRes.data.user;
				if (reportRes.data?.success) {
					stats = reportRes.data.data.stats;
					recentActivity = (reportRes.data.data.logs || []).slice(-5).reverse();
				}
				if (smtpRes.data?.success) {
					smtpCount = smtpRes.data.userConfigs?.length || 0;
				}
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
			<Loader text="Loading dashboard..." />
		{:else}
			<div class="p-6 space-y-6">
				<!-- Welcome -->
				<div>
					<h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
					<p class="text-gray-500 mt-1">Welcome back, {user?.name || "User"} 👋</p>
				</div>

				<!-- Stats Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<StatCard title="Total Emails" value={stats?.total ?? 0} icon="📧" color="indigo" />
					<StatCard title="Success" value={stats?.sent ?? 0} icon="✅" color="green" />
					<StatCard title="Failed" value={(stats?.failed ?? 0) + (stats?.errors ?? 0)} icon="❌" color="red" />
					<StatCard title="SMTP Configs" value={smtpCount} icon="⚙️" color="purple" />
				</div>

				<!-- Recent Activity -->
				<Card title="Recent Activity">
					{#if recentActivity.length === 0}
						<p class="text-sm text-gray-500 text-center py-4">No activity yet. Start sending emails!</p>
					{:else}
						<div class="space-y-3">
							{#each recentActivity as log}
								<div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
									<span class="text-lg">
										{log.status === "Sent" ? "✅" : "❌"}
									</span>
									<div class="flex-1">
										<p class="text-sm font-medium text-gray-700">
											{log.status} - {log.email || "Unknown"}
										</p>
										<p class="text-xs text-gray-500">
											{log.subject || "No subject"} • {new Date(log.timestamp).toLocaleString()}
										</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</Card>
			</div>
		{/if}
	</div>
</div>

