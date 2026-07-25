<script lang="ts">
	export let title = "";
	export let value: number | string = 0;
	export let icon = "";
	export let color = "indigo";
</script>

<div class="rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-sm font-medium text-gray-500">{title}</p>
			<p class="mt-2 text-3xl font-bold text-{color}-600">{value}</p>
		</div>
		{#if icon}
			<div class="w-12 h-12 rounded-full bg-{color}-100 flex items-center justify-center text-2xl">
				{icon}
			</div>
		{/if}
	</div>
</div>

