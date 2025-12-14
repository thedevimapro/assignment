<script lang="ts">
  let {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    class: className = '',
    onclick,
    children
  }: {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: any;
  } = $props();

  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] text-white hover:bg-[position:100%_0] shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25',
    ghost: 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25'
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };
</script>

<button
  {type}
  class="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98] {variants[variant]} {sizes[size]} {className}"
  disabled={disabled || loading}
  {onclick}
>
  {#if loading}
    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  {/if}
  {@render children?.()}
</button>

