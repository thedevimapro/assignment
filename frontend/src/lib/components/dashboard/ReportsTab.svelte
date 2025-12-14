<script lang="ts">
  import { reportStore, toastStore } from '$lib/stores/index.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';

  let isClearing = $state(false);

  async function handleRefresh() {
    await reportStore.loadReport();
    toastStore.success('Report refreshed');
  }

  async function handleExportCSV() {
    try {
      await reportStore.exportCSV();
      toastStore.success('CSV exported successfully');
    } catch (error) {
      toastStore.error('Failed to export CSV');
    }
  }

  async function handleExportJSON() {
    try {
      await reportStore.exportJSON();
      toastStore.success('JSON exported successfully');
    } catch (error) {
      toastStore.error('Failed to export JSON');
    }
  }

  async function handleClearLogs() {
    if (!confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
      return;
    }

    isClearing = true;
    try {
      await reportStore.clearLogs();
      toastStore.success('Logs cleared successfully');
    } catch (error) {
      toastStore.error('Failed to clear logs');
    } finally {
      isClearing = false;
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  function getStatusStyles(status: string): { bg: string; text: string; icon: string } {
    switch (status) {
      case 'sent': return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: '✓' };
      case 'failed': return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: '✕' };
      case 'pending': return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: '⏳' };
      default: return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: '•' };
    }
  }
</script>

<div class="space-y-4 sm:space-y-6 animate-fade-in">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
    <div>
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Reports
      </h1>
      <p class="text-sm sm:text-base text-gray-500 mt-1">Track and analyze your email campaigns.</p>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    <div class="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div class="flex items-center justify-between mb-2 sm:mb-3">
        <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <div class="text-xl sm:text-2xl font-bold text-gray-900">{(reportStore.stats?.total ?? 0).toLocaleString()}</div>
      <div class="text-xs sm:text-sm text-gray-500">Total Emails</div>
    </div>

    <div class="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div class="flex items-center justify-between mb-2 sm:mb-3">
        <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div class="text-xl sm:text-2xl font-bold text-emerald-600">{(reportStore.stats?.sent ?? 0).toLocaleString()}</div>
      <div class="text-xs sm:text-sm text-gray-500">Sent</div>
    </div>

    <div class="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div class="flex items-center justify-between mb-2 sm:mb-3">
        <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <div class="text-xl sm:text-2xl font-bold text-red-600">{(reportStore.stats?.failed ?? 0).toLocaleString()}</div>
      <div class="text-xs sm:text-sm text-gray-500">Failed</div>
    </div>

    <div class="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div class="flex items-center justify-between mb-2 sm:mb-3">
        <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div class="text-xl sm:text-2xl font-bold text-amber-600">{(reportStore.stats?.pending ?? 0).toLocaleString()}</div>
      <div class="text-xs sm:text-sm text-gray-500">Pending</div>
    </div>
  </div>

  <!-- Actions Card -->
  <div class="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
    <div class="flex flex-wrap gap-2 sm:gap-3 items-center justify-between">
      <div class="flex flex-wrap gap-1.5 sm:gap-2">
        <Button size="sm" onclick={handleRefresh} loading={reportStore.isLoading}>
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="hidden sm:inline">Refresh</span>
        </Button>
        <Button variant="secondary" size="sm" onclick={handleExportCSV}>
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="hidden sm:inline">Export</span> CSV
        </Button>
        <Button variant="secondary" size="sm" onclick={handleExportJSON}>
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="hidden sm:inline">Export</span> JSON
        </Button>
      </div>
      <Button variant="danger" size="sm" onclick={handleClearLogs} loading={isClearing}>
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span class="hidden sm:inline">Clear All</span>
        <span class="sm:hidden">Clear</span>
      </Button>
    </div>
  </div>

  <!-- Email Logs -->
  <Card title="Email Logs" icon="📋">
    {#if reportStore.logs.length === 0}
      <div class="text-center py-8 sm:py-12">
        <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
          <span class="text-3xl sm:text-4xl">📭</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No Email Logs</h3>
        <p class="text-gray-500 mb-6">Your email activity will appear here</p>
        <a
          href="/send"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
        >
          Send Your First Email
        </a>
      </div>
    {:else}
      <div class="overflow-x-auto -mx-5">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50/50">
              <th class="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipient</th>
              <th class="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Subject</th>
              <th class="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            {#each reportStore.logs as log}
              {@const styles = getStatusStyles(log.status)}
              <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="py-4 px-5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                      {log.to.charAt(0).toUpperCase()}
                    </div>
                    <span class="font-medium text-gray-900 text-sm truncate max-w-[150px] sm:max-w-[200px]">{log.to}</span>
                  </div>
                </td>
                <td class="py-4 px-5 hidden sm:table-cell">
                  <span class="text-sm text-gray-600 truncate block max-w-[250px]">{log.subject}</span>
                </td>
                <td class="py-4 px-5">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border {styles.bg} {styles.text}">
                    <span>{styles.icon}</span>
                    {log.status}
                  </span>
                </td>
                <td class="py-4 px-5 hidden md:table-cell">
                  <span class="text-sm text-gray-500">{formatDate(log.timestamp)}</span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Card>
</div>

