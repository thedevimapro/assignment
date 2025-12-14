<script lang="ts">
  import { dashboardStore, toastStore } from '$lib/stores/index.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  async function handleCancel(jobId: string) {
    const res = await dashboardStore.cancelJob(jobId);
    if (res.success) {
      toastStore.success('Job cancelled');
    } else {
      toastStore.error('Failed to cancel job');
    }
  }

  function getStatusStyles(status: string): { bg: string; text: string; icon: string } {
    switch (status) {
      case 'pending': return { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-700', icon: '⏳' };
      case 'running': return { bg: 'bg-blue-100 border-blue-200', text: 'text-blue-700', icon: '🔄' };
      case 'completed': return { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-700', icon: '✓' };
      default: return { bg: 'bg-gray-100 border-gray-200', text: 'text-gray-700', icon: '•' };
    }
  }
</script>

<svelte:head>
  <title>Scheduled Jobs - Email Sender</title>
</svelte:head>

<div class="space-y-4 sm:space-y-6 animate-fade-in">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
    <div>
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Scheduled Jobs
      </h1>
      <p class="text-sm sm:text-base text-gray-500 mt-1">Manage your scheduled email campaigns.</p>
    </div>
    <a
      href="/send"
      class="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
    >
      <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Schedule New
    </a>
  </div>

  {#if dashboardStore.scheduledJobs.length === 0}
    <div class="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-12">
      <div class="text-center max-w-md mx-auto">
        <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <span class="text-3xl sm:text-4xl">📅</span>
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Scheduled Jobs</h3>
        <p class="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
          You don't have any scheduled email campaigns. Schedule one to send emails at a specific time.
        </p>
        <a
          href="/send"
          class="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Schedule Your First Email
        </a>
      </div>
    </div>
  {:else}
    <div class="space-y-3 sm:space-y-4">
      {#each dashboardStore.scheduledJobs as job}
        {@const styles = getStatusStyles(job.status)}
        <div class="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-lg transition-all duration-300">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
                <span class="text-lg sm:text-xl">📧</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 text-base sm:text-lg truncate">{job.subject}</h3>
                <div class="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                  <span class="flex items-center gap-1 sm:gap-1.5">
                    <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {job.recipientCount} recipients
                  </span>
                  <span class="flex items-center gap-1 sm:gap-1.5">
                    <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="truncate">{new Date(job.scheduledTime).toLocaleString()}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 sm:flex-shrink-0 self-start sm:self-auto">
              <span class="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border {styles.bg} {styles.text}">
                <span>{styles.icon}</span>
                {job.status}
              </span>
              {#if job.status === 'pending'}
                <Button size="sm" variant="danger" onclick={() => handleCancel(job.id)}>
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span class="hidden sm:inline">Cancel</span>
                </Button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

