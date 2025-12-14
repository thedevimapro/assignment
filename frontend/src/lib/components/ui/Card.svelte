<script lang="ts">
  let {
    title = '',
    subtitle = '',
    icon = '',
    variant = 'default',
    hover = false,
    class: className = '',
    children
  }: {
    title?: string;
    subtitle?: string;
    icon?: string;
    variant?: 'default' | 'gradient' | 'glass';
    hover?: boolean;
    class?: string;
    children?: any;
  } = $props();

  const variants: Record<string, string> = {
    default: 'bg-white border border-gray-100 shadow-sm',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-md',
    glass: 'glass backdrop-blur-xl'
  };
</script>

<div class="rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 {variants[variant]} {hover ? 'card-hover cursor-pointer' : ''} {className}">
  {#if title || icon}
    <div class="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100/80 bg-gradient-to-r from-gray-50/50 to-transparent">
      <div class="flex items-center gap-2 sm:gap-3">
        {#if icon}
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm sm:text-lg shadow-lg shadow-indigo-500/25">
            {icon}
          </div>
        {/if}
        <div class="flex-1 min-w-0">
          <h3 class="text-sm sm:text-base font-semibold text-gray-900 truncate">{title}</h3>
          {#if subtitle}
            <p class="text-xs sm:text-sm text-gray-500 truncate">{subtitle}</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
  <div class="p-4 sm:p-5">
    {@render children?.()}
  </div>
</div>

