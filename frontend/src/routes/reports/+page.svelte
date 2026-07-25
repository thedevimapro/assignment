<script lang="ts">
	import Navbar from "$lib/components/Navbar.svelte";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import StatCard from "$lib/components/StatCard.svelte";
	import Card from "$lib/components/Card.svelte";
	import Button from "$lib/components/Button.svelte";
	import Loader from "$lib/components/Loader.svelte";
	import { me } from "$lib/services/auth";
	import { getReports } from "$lib/services/report";
	import { api } from "$lib/api/client";

	let user = $state<any>(null);
	let logs = $state<any[]>([]);
	let stats = $state<any>(null);
	let loading = $state(true);
	let searchQuery = $state("");
	let currentPage = $state(1);
	let pageSize = 10;
	let path = "/reports";

	$effect(() => {
		async function load() {
			try {
				const [userRes, reportRes] = await Promise.all([me(), getReports()]);
				if (userRes.data?.success) user = userRes.data.user;
				if (reportRes.data?.success) {
					logs = reportRes.data.data.logs || [];
					stats = reportRes.data.data.stats;
				}
			} catch {
				// Not authenticated - redirect handled by layout
			} finally {
				loading = false;
			}
		}
		load();
	});

	let filteredLogs = $derived(
		logs.filter(log => {
			if (!searchQuery) return true;
			const q = searchQuery.toLowerCase();
			return (
				(log.email || "").toLowerCase().includes(q) ||
				(log.status || "").toLowerCase().includes(q) ||
				(log.subject || "").toLowerCase().includes(q)
			);
		})
	);

	let totalPages = $derived(Math.max(1, Math.ceil(filteredLogs.length / pageSize)));
	let paginatedLogs = $derived(
		filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	// Reset to page 1 when searching
	$effect(() => {
		searchQuery; // track
		currentPage = 1;
	});

	async function exportCSV() {
		try {
			const res = await api.get("/report/export/csv", { responseType: "blob" });
			const url = window.URL.createObjectURL(new Blob([res.data]));
			const a = document.createElement("a");
			a.href = url;
			a.download = "email-logs.csv";
			a.click();
			window.URL.revokeObjectURL(url);
		} catch (e) {
			console.error(e);
		}
	}

	async function exportJSON() {
		try {
			const res = await api.get("/report/export/json", { responseType: "blob" });
			const url = window.URL.createObjectURL(new Blob([res.data]));
			const a = document.createElement("a");
			a.href = url;
			a.download = "email-logs.json";
			a.click();
			window.URL.revokeObjectURL(url);
		} catch (e) {
			console.error(e);
		}
	}
</script>

<div class="flex">
	<Sidebar currentPath={path} />
	<div class="flex-1 bg-gray-50 min-h-screen">
		<Navbar userName={user?.name || "User"} />

		{#if loading}
			<Loader text="Loading reports..." />
		{:else}
			<div class="p-6 space-y-6">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-2xl font-bold text-gray-800">Reports</h1>
						<p class="text-gray-500 mt-1">View email sending statistics and logs</p>
					</div>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
					<StatCard title="Total Sent" value={stats?.total ?? 0} icon="📧" color="indigo" />
					<StatCard title="Success" value={stats?.sent ?? 0} icon="✅" color="green" />
					<StatCard title="Failed" value={(stats?.failed ?? 0) + (stats?.errors ?? 0)} icon="❌" color="red" />
					<StatCard title="Success Rate" value={stats?.total > 0 ? Math.round((stats.sent / stats.total) * 100) + '%' : '0%'} icon="📈" color="blue" />
				</div>

				<!-- Logs Section -->
				<Card title="Email Logs">
					<div class="space-y-4">
						<!-- Search and Export -->
						<div class="flex items-center gap-4">
							<div class="flex-1">
								<input
									id="search-input"
									type="text"
									placeholder="🔍 Search by email, status, subject..."
									class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
									value={searchQuery}
									oninput={(e) => searchQuery = (e.target as HTMLInputElement).value}
								/>
							</div>
							<Button variant="secondary" size="sm" onclick={exportCSV}>📥 CSV</Button>
							<Button variant="secondary" size="sm" onclick={exportJSON}>📥 JSON</Button>
						</div>

						<!-- Logs Table -->
						<div class="overflow-x-auto rounded-lg border border-gray-200">
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
									<tr>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
									</tr>
								</thead>
								<tbody class="bg-white divide-y divide-gray-200">
									{#if paginatedLogs.length === 0}
										<tr>
											<td colspan="4" class="px-6 py-12 text-center text-sm text-gray-500">
												{searchQuery ? 'No logs match your search' : 'No email logs yet'}
											</td>
										</tr>
									{:else}
										{#each paginatedLogs as log}
											<tr class="hover:bg-gray-50 transition-colors">
												<td class="px-6 py-4 whitespace-nowrap">
													<span class={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
														${log.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
														{log.status === 'Sent' ? '✅' : '❌'} {log.status}
													</span>
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.email || '-'}</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.subject || '-'}</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
												</td>
											</tr>
										{/each}
									{/if}
								</tbody>
							</table>
						</div>

						<!-- Pagination -->
						{#if filteredLogs.length > pageSize}
							<div class="flex items-center justify-between">
								<p class="text-sm text-gray-500">
									Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length}
								</p>
								<div class="flex items-center gap-2">
									<Button variant="secondary" size="sm" onclick={() => currentPage = Math.max(1, currentPage - 1)} disabled={currentPage === 1}>
										← Prev
									</Button>
									{#each { length: totalPages } as _, i}
										<button
											onclick={() => currentPage = i + 1}
											class={`px-3 py-1 text-sm rounded-lg transition-colors ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
										>
											{i + 1}
										</button>
									{/each}
									<Button variant="secondary" size="sm" onclick={() => currentPage = Math.min(totalPages, currentPage + 1)} disabled={currentPage === totalPages}>
										Next →
									</Button>
								</div>
							</div>
						{/if}
					</div>
				</Card>
			</div>
		{/if}
	</div>
</div>

