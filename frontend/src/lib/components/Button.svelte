<script lang="ts">
	let { 
		children, 
		variant = "primary", 
		size = "md",
		disabled = false,
		loading = false,
		type = "button" as "button" | "submit" | "reset",
		class: className = "",
		onclick
	}: {
		children?: import("svelte").Snippet;
		variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
		size?: "sm" | "md" | "lg";
		disabled?: boolean;
		loading?: boolean;
		type?: "button" | "submit" | "reset";
		class?: string;
		onclick?: () => void;
	} = $props();

	const variantClasses: Record<string, string> = {
		primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
		secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400",
		danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
		ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
		success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
	};

	const sizeClasses: Record<string, string> = {
		sm: "px-3 py-1.5 text-xs",
		md: "px-4 py-2 text-sm",
		lg: "px-6 py-3 text-base"
	};
</script>

<button
	{type}
	{disabled}
	onclick={onclick}
	class="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed {variantClasses[variant]} {sizeClasses[size]} {className}"
>
	{#if loading}
		<span class="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
	{:else}
		{@render children?.()}
	{/if}
</button>

