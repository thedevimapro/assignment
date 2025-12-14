<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/index.svelte';

  onMount(async () => {
    await authStore.checkAuth();
    if (authStore.isAuthenticated) {
      goto('/dashboard');
    } else {
      goto('/login');
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
  <!-- Background Decorations -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
  </div>

  <div class="flex flex-col items-center gap-6 relative z-10">
    <div class="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl animate-bounce">
      <span class="text-4xl">📧</span>
    </div>
    <div class="flex gap-2">
      <div class="w-3 h-3 rounded-full bg-white animate-bounce" style="animation-delay: 0ms"></div>
      <div class="w-3 h-3 rounded-full bg-white animate-bounce" style="animation-delay: 150ms"></div>
      <div class="w-3 h-3 rounded-full bg-white animate-bounce" style="animation-delay: 300ms"></div>
    </div>
    <p class="text-white/80 font-medium">Loading...</p>
  </div>
</div>

