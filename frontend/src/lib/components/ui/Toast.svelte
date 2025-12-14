<script lang="ts">
  import { toastStore } from '$lib/stores/index.svelte';

  const styles: Record<string, { bg: string; icon: string }> = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25',
      icon: '✓'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-500 shadow-lg shadow-red-500/25',
      icon: '✕'
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25',
      icon: '⚠'
    },
    info: {
      bg: 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25',
      icon: 'ℹ'
    }
  };
</script>

<div class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-3">
  {#each toastStore.toasts as toast (toast.id)}
    <div
      class="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-white text-sm sm:min-w-[300px] backdrop-blur-sm {styles[toast.type].bg} animate-slide-up"
      role="alert"
    >
      <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {styles[toast.type].icon}
      </div>
      <p class="flex-1 font-medium">{toast.message}</p>
      <button
        onclick={() => toastStore.remove(toast.id)}
        class="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white text-xs flex-shrink-0"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  {/each}
</div>



