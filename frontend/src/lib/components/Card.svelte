<script lang="ts">
	let { title = "", children }: { title?: string; children?: import("svelte").Snippet } = $props();
</script>

<div class="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
	{#if title}
		<h3 class="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
	{/if}
	{@render children?.()}
</div>

