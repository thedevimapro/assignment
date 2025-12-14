<script lang="ts">
  import { dashboardStore, reportStore } from '$lib/stores/index.svelte';
  import Card from '$lib/components/ui/Card.svelte';
</script>

<svelte:head>
  <title>Dashboard - Email Sender</title>
</svelte:head>

<div class="space-y-4 sm:space-y-6 animate-fade-in">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
    <div>
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Dashboard
      </h1>
      <p class="text-sm sm:text-base text-gray-500 mt-1">Welcome back! Here's your email overview.</p>
    </div>
    <a
      href="/send"
      class="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
    >
      <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Compose Email
    </a>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    <!-- Total Emails -->
    <div class="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div class="flex items-center justify-between mb-2 sm:mb-4">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <span class="text-[10px] sm:text-xs font-medium text-indigo-600 bg-indigo-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg">Total</span>
      </div>
      <div class="text-xl sm:text-3xl font-bold text-gray-900">{(reportStore.stats?.total ?? 0).toLocaleString()}</div>
      <div class="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Total Emails</div>
    </div>

    <!-- Sent -->
    <div class="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div class="flex items-center justify-between mb-2 sm:mb-4">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span class="text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg">Sent</span>
      </div>
      <div class="text-xl sm:text-3xl font-bold text-emerald-600">{(reportStore.stats?.sent ?? 0).toLocaleString()}</div>
      <div class="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Successfully Sent</div>
    </div>

    <!-- Failed -->
    <div class="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div class="flex items-center justify-between mb-2 sm:mb-4">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <span class="text-[10px] sm:text-xs font-medium text-red-600 bg-red-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg">Failed</span>
      </div>
      <div class="text-xl sm:text-3xl font-bold text-red-600">{(reportStore.stats?.failed ?? 0).toLocaleString()}</div>
      <div class="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Failed Emails</div>
    </div>

    <!-- Pending -->
    <div class="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div class="flex items-center justify-between mb-2 sm:mb-4">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span class="text-[10px] sm:text-xs font-medium text-amber-600 bg-amber-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg">Pending</span>
      </div>
      <div class="text-xl sm:text-3xl font-bold text-amber-600">{(reportStore.stats?.pending ?? 0).toLocaleString()}</div>
      <div class="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Pending Emails</div>
    </div>
  </div>

  <!-- Active Batch Section -->
  {#if dashboardStore.hasActiveBatch}
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl shadow-indigo-500/20">
      <div class="flex items-center gap-3 mb-3 sm:mb-4">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-semibold">Active Batch</h3>
          <p class="text-white/70 text-xs sm:text-sm">Emails are being sent...</p>
        </div>
      </div>
      <div class="space-y-2 sm:space-y-3">
        <div class="flex justify-between text-xs sm:text-sm">
          <span class="text-white/80">Progress</span>
          <span class="font-semibold">{dashboardStore.batchStatus?.sent}/{dashboardStore.batchStatus?.total}</span>
        </div>
        <div class="w-full bg-white/20 rounded-full h-2 sm:h-3 overflow-hidden">
          <div
            class="bg-white h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
            style="width: {((dashboardStore.batchStatus?.sent || 0) / (dashboardStore.batchStatus?.total || 1)) * 100}%"
          ></div>
        </div>
        <div class="text-right text-xs sm:text-sm text-white/70">
          {Math.round(((dashboardStore.batchStatus?.sent || 0) / (dashboardStore.batchStatus?.total || 1)) * 100)}% complete
        </div>
      </div>
    </div>
  {/if}

  <!-- Scheduled Jobs Section -->
  {#if dashboardStore.hasScheduledJobs}
    <Card title="Scheduled Jobs" icon="📅">
      <div class="space-y-3">
        {#each dashboardStore.scheduledJobs as job}
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300">
            <div class="flex items-center gap-3 sm:gap-4 min-w-0">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                <span class="text-base sm:text-lg">📧</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-semibold text-gray-900 text-sm sm:text-base truncate">{job.subject}</div>
                <div class="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="truncate">{new Date(job.scheduledTime).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <span class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 self-start sm:self-auto flex-shrink-0">
              {job.status}
            </span>
          </div>
        {/each}
      </div>
    </Card>
  {/if}

  <!-- Empty State -->
  {#if !dashboardStore.hasActiveBatch && !dashboardStore.hasScheduledJobs}
    <div class="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-12">
      <div class="text-center max-w-md mx-auto">
        <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <span class="text-3xl sm:text-4xl">📬</span>
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Active Jobs</h3>
        <p class="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
          You don't have any active email batches or scheduled jobs at the moment.
        </p>
        <a
          href="/send"
          class="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Send Your First Email
        </a>
      </div>
    </div>
  {/if}
</div>

