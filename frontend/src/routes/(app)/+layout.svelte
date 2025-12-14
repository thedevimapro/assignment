<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore, configStore, reportStore, dashboardStore, toastStore } from '$lib/stores/index.svelte';

  let { children } = $props();
  let isInitialized = $state(false);

  onMount(async () => {
    await authStore.checkAuth();
    if (!authStore.isAuthenticated) {
      goto('/login');
      return;
    }
    await Promise.all([configStore.loadConfigs(), reportStore.loadReport()]);
    dashboardStore.startPolling();
    isInitialized = true;
    return () => dashboardStore.stopPolling();
  });

  async function handleLogout() {
    await authStore.logout();
    toastStore.success('Logged out');
    goto('/login');
  }

  function isActive(path: string) {
    return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/send', label: 'Compose', icon: '✉️' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/config', label: 'Settings', icon: '⚙️' },
    { path: '/scheduled', label: 'Scheduled', icon: '📅' },
  ];
</script>

{#if authStore.isLoading || !isInitialized}
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <div class="flex flex-col items-center gap-4">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
        <span class="text-2xl">📧</span>
      </div>
      <div class="flex gap-1">
        <div class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style="animation-delay: 300ms"></div>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-16 lg:pb-0">
    <!-- Modern Navbar -->
    <nav class="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <!-- Logo -->
          <a href="/dashboard" class="flex items-center gap-2 sm:gap-3 group">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
              <span class="text-sm sm:text-lg">📧</span>
            </div>
            <span class="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              Email Sender
            </span>
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center gap-1 bg-gray-100/80 rounded-2xl p-1.5">
            {#each navItems as item}
              <a
                href={item.path}
                class="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2
                       {isActive(item.path)
                         ? 'bg-white text-indigo-600 shadow-sm'
                         : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}"
              >
                <span class="text-base">{item.icon}</span>
                {item.label}
              </a>
            {/each}
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="hidden md:flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-lg sm:rounded-xl">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm">
                {authStore.user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span class="text-xs sm:text-sm text-gray-700 font-medium max-w-[80px] sm:max-w-[120px] truncate">{authStore.user?.email}</span>
            </div>
            <button
              onclick={handleLogout}
              class="p-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <svg class="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fade-in">
      {@render children()}
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
      <div class="flex items-center justify-around h-16 px-2 safe-area-pb">
        {#each navItems as item}
          <a
            href={item.path}
            class="relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 min-w-[56px]
                   {isActive(item.path)
                     ? 'text-indigo-600'
                     : 'text-gray-400 hover:text-gray-600'}"
          >
            {#if isActive(item.path)}
              <span class="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
            {/if}
            <span class="text-xl {isActive(item.path) ? 'scale-110' : ''} transition-transform duration-200">{item.icon}</span>
            <span class="text-[10px] font-medium {isActive(item.path) ? 'text-indigo-600' : 'text-gray-500'}">{item.label}</span>
          </a>
        {/each}
      </div>
    </nav>
  </div>
{/if}

