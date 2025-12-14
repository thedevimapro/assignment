<script lang="ts">
  import { page } from '$app/stores';
  import { authStore, toastStore } from '$lib/stores/index.svelte';
  import { goto } from '$app/navigation';

  function isActive(path: string) {
    return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
  }

  async function handleLogout() {
    await authStore.logout();
    toastStore.success('Logged out');
    goto('/login');
  }
</script>

<nav class="bg-white border-b border-gray-200 sticky top-0 z-40">
  <div class="max-w-6xl mx-auto px-4">
    <div class="flex items-center justify-between h-14">
      <a href="/dashboard" class="text-gray-900 font-semibold">📧 Email Sender</a>
      <div class="hidden sm:flex items-center gap-1">
        <a href="/send" class="px-3 py-1.5 text-sm rounded-md {isActive('/send') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}">Compose</a>
        <a href="/reports" class="px-3 py-1.5 text-sm rounded-md {isActive('/reports') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}">Reports</a>
        <a href="/config" class="px-3 py-1.5 text-sm rounded-md {isActive('/config') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}">Settings</a>
        <a href="/scheduled" class="px-3 py-1.5 text-sm rounded-md {isActive('/scheduled') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}">Scheduled</a>
      </div>
      <div class="flex items-center gap-2">
        <span class="hidden md:block text-sm text-gray-600">{authStore.user?.email}</span>
        <button onclick={handleLogout} class="text-sm text-gray-500 hover:text-gray-700 px-2 py-1">Logout</button>
      </div>
    </div>
    <div class="sm:hidden flex border-t border-gray-100 -mx-4 px-2">
      <a href="/send" class="flex-1 py-2.5 text-center text-sm border-b-2 {isActive('/send') ? 'border-indigo-600 text-indigo-600 font-medium' : 'border-transparent text-gray-500'}">Compose</a>
      <a href="/reports" class="flex-1 py-2.5 text-center text-sm border-b-2 {isActive('/reports') ? 'border-indigo-600 text-indigo-600 font-medium' : 'border-transparent text-gray-500'}">Reports</a>
      <a href="/config" class="flex-1 py-2.5 text-center text-sm border-b-2 {isActive('/config') ? 'border-indigo-600 text-indigo-600 font-medium' : 'border-transparent text-gray-500'}">Settings</a>
    </div>
  </div>
</nav>

