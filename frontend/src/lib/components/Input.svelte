<script lang="ts">
	let { 
		label = "",
		type = "text",
		placeholder = "",
		value = "",
		required = false,
		error = "",
		class: className = "",
		oninput,
		id = ""
	}: {
		label?: string;
		type?: string;
		placeholder?: string;
		value?: string;
		required?: boolean;
		error?: string;
		class?: string;
		oninput?: (e: Event) => void;
		id?: string;
	} = $props();
	
	const inputId = $derived(id || `input-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="space-y-1 {className}">
	{#if label}
		<label for={inputId} class="block text-sm font-medium text-gray-700">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}
	<input
		id={inputId}
		{type}
		{placeholder}
		{required}
		value={value}
		oninput={oninput}
		class="w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 {error ? 'border-red-500' : 'border-gray-300'}"
	/>
	{#if error}
		<p class="text-xs text-red-500">{error}</p>
	{/if}
</div>

