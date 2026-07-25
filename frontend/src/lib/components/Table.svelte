<script lang="ts">
	let { 
		headers = [],
		rows = [],
		loading = false,
		emptyMessage = "No data available"
	}: {
		headers: string[];
		rows: Record<string, any>[];
		loading?: boolean;
		emptyMessage?: string;
	} = $props();
</script>

<div class="overflow-x-auto rounded-lg border border-gray-200">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				{#each headers as header}
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
						{header}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="bg-white divide-y divide-gray-200">
			{#if loading}
				<tr>
					<td colspan={headers.length} class="px-6 py-12 text-center">
						<div class="flex flex-col items-center">
							<div class="w-8 h-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
							<p class="mt-2 text-sm text-gray-500">Loading...</p>
						</div>
					</td>
				</tr>
			{:else if rows.length === 0}
				<tr>
					<td colspan={headers.length} class="px-6 py-12 text-center text-sm text-gray-500">
						{emptyMessage}
					</td>
				</tr>
			{:else}
				{#each rows as row, i}
					<tr class="hover:bg-gray-50 transition-colors">
						{#each headers as header}
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
								{row[header.toLowerCase().replace(/\s+/g, '_')] ?? row[header.toLowerCase()] ?? '-'}
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

