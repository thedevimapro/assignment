<script lang="ts">
	let { size = "md", text = "Loading..." }: { size?: "sm" | "md" | "lg"; text?: string } = $props();

	const sizeMap = {
		sm: "w-5 h-5",
		md: "w-8 h-8",
		lg: "w-12 h-12"
	};
</script>

<div class="flex flex-col items-center justify-center py-8">
	<div class="{sizeMap[size]} animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
	{#if text}
		<p class="mt-4 text-sm text-gray-500">{text}</p>
	{/if}
</div>

