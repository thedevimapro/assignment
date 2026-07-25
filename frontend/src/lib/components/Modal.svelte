<script lang="ts">
	let { 
		open = false,
		title = "",
		children,
		onclose
	}: {
		open: boolean;
		title?: string;
		children?: import("svelte").Snippet;
		onclose?: () => void;
	} = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
	<div class="absolute inset-0 bg-black/50" role="presentation" onclick={onclose} onkeydown={(e) => e.key === 'Enter' && onclose?.()}></div>
		<div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
			{#if title}
				<div class="flex items-center justify-between p-6 border-b border-gray-200">
					<h3 class="text-lg font-semibold text-gray-800">{title}</h3>
					{#if onclose}
			<button onclick={onclose} aria-label="Close" class="text-gray-400 hover:text-gray-600 transition-colors">
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					{/if}
				</div>
			{/if}
			<div class="p-6">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

