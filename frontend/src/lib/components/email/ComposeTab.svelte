<script lang="ts">
  import { configStore, toastStore, reportStore } from '$lib/stores/index.svelte';
  import { api } from '$lib/api/client';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  // Form state
  let subject = $state('');
  let htmlContent = $state('');
  let excelFiles = $state<File[]>([]);
  let htmlTemplateFile = $state<File | null>(null);

  // Contacts from Excel/CSV
  let contacts = $state<any[]>([]);
  let contactColumns = $state<string[]>([]);
  let uploadedFileNames = $state<string[]>([]);

  // Send range
  let sendRange = $state<'all' | 'first' | 'range'>('all');
  let firstN = $state(10);
  let rangeFrom = $state(1);
  let rangeTo = $state(10);

  // Batch settings
  let useBatch = $state(false);
  let batchSize = $state(20);
  let batchDelay = $state(60);
  let emailDelay = $state(45);

  // Schedule settings
  let scheduleEmail = $state(false);
  let scheduledTime = $state('');
  let notifyEmail = $state('');

  // UI state
  let isLoading = $state(false);
  let isSending = $state(false);
  let previewHtml = $state('');

  // Computed
  let selectedContacts = $derived(() => {
    if (contacts.length === 0) return [];
    switch (sendRange) {
      case 'first':
        return contacts.slice(0, firstN);
      case 'range':
        return contacts.slice(rangeFrom - 1, rangeTo);
      default:
        return contacts;
    }
  });

  let selectedContactCount = $derived(selectedContacts().length);

  async function handleExcelChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    // Add new files to existing files
    const newFiles = Array.from(files);
    excelFiles = [...excelFiles, ...newFiles];
    isLoading = true;

    try {
      const formData = new FormData();
      // Append all files
      excelFiles.forEach((file, index) => {
        formData.append(`excelFile${index}`, file);
      });

      const response = await api.parseExcel(formData);
      if (response.success && response.contacts) {
        contacts = response.contacts;
        contactColumns = response.columns || (contacts.length > 0 ? Object.keys(contacts[0]) : []);
        uploadedFileNames = response.filesProcessed || excelFiles.map(f => f.name);
        const totalCount = response.totalCount || contacts.length;
        toastStore.success(`Loaded ${totalCount} contacts from ${excelFiles.length} file(s)`);
      } else {
        toastStore.error(response.message || 'Failed to parse files');
        contacts = [];
        contactColumns = [];
      }
    } catch (error) {
      toastStore.error('Error parsing files');
      contacts = [];
      contactColumns = [];
    } finally {
      isLoading = false;
      // Reset input to allow re-selecting same files
      input.value = '';
    }
  }

  function removeFile(index: number) {
    excelFiles = excelFiles.filter((_, i) => i !== index);
    // Re-parse remaining files if any
    if (excelFiles.length > 0) {
      reParseFiles();
    } else {
      contacts = [];
      contactColumns = [];
      uploadedFileNames = [];
    }
  }

  async function reParseFiles() {
    if (excelFiles.length === 0) return;

    isLoading = true;
    try {
      const formData = new FormData();
      excelFiles.forEach((file, index) => {
        formData.append(`excelFile${index}`, file);
      });

      const response = await api.parseExcel(formData);
      if (response.success && response.contacts) {
        contacts = response.contacts;
        contactColumns = response.columns || (contacts.length > 0 ? Object.keys(contacts[0]) : []);
        uploadedFileNames = response.filesProcessed || excelFiles.map(f => f.name);
      }
    } catch (error) {
      console.error('Error re-parsing files:', error);
    } finally {
      isLoading = false;
    }
  }

  function clearAllFiles() {
    excelFiles = [];
    contacts = [];
    contactColumns = [];
    uploadedFileNames = [];
  }

  async function handleHtmlTemplateChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    htmlTemplateFile = file;

    try {
      const text = await file.text();
      htmlContent = text;
      previewHtml = text;
      toastStore.success('HTML template loaded');
    } catch (error) {
      toastStore.error('Error loading HTML template');
    }
  }

  async function handleSend() {
    // Validation
    if (!configStore.selectedConfigId) {
      toastStore.error('Please select an SMTP configuration');
      return;
    }

    if (!subject.trim()) {
      toastStore.error('Please enter a subject');
      return;
    }

    if (excelFiles.length === 0) {
      toastStore.error('Please upload at least one Excel/CSV file with contacts');
      return;
    }

    if (!htmlContent.trim() && !htmlTemplateFile) {
      toastStore.error('Please enter email content or upload an HTML template');
      return;
    }

    if (scheduleEmail && !scheduledTime) {
      toastStore.error('Please select a scheduled time');
      return;
    }

    isSending = true;

    try {
      const formData = new FormData();
      formData.append('configId', configStore.selectedConfigId);
      formData.append('subject', subject);
      formData.append('htmlContent', htmlContent);

      // Append all excel files - use the first one as the main file for now
      // The backend will merge contacts from all files
      if (excelFiles.length > 0) {
        formData.append('excelFile', excelFiles[0]);
      }

      if (htmlTemplateFile) {
        formData.append('htmlTemplate', htmlTemplateFile);
      }

      // Range settings
      formData.append('sendRange', sendRange);
      formData.append('firstN', String(firstN));
      formData.append('rangeFrom', String(rangeFrom));
      formData.append('rangeTo', String(rangeTo));

      // Batch settings
      if (useBatch) {
        formData.append('useBatch', 'on');
        formData.append('batchSize', String(batchSize));
        formData.append('batchDelay', String(batchDelay));
        formData.append('emailDelay', String(emailDelay));
      }

      // Schedule settings
      if (scheduleEmail) {
        formData.append('scheduleEmail', 'on');
        formData.append('scheduledTime', scheduledTime);
        if (notifyEmail) {
          formData.append('notifyEmail', notifyEmail);
        }
      }

      const response = await api.sendEmail(formData);

      if (response.success) {
        toastStore.success(response.message || 'Emails sent successfully!');
        await reportStore.loadReport();

        // Reset form
        subject = '';
        htmlContent = '';
        excelFile = null;
        htmlTemplateFile = null;
        contacts = [];
      } else {
        toastStore.error(response.message || 'Failed to send emails');
      }
    } catch (error) {
      toastStore.error('Error sending emails');
    } finally {
      isSending = false;
    }
  }
</script>

<div class="space-y-4 sm:space-y-6 animate-fade-in">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
    <div>
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Compose Email
      </h1>
      <p class="text-sm sm:text-base text-gray-500 mt-1">Create and send beautiful emails to your contacts.</p>
    </div>
  </div>

  <Card title="SMTP Configuration" icon="⚡">
    {#if configStore.configs.length === 0}
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
          <span class="text-3xl">⚙️</span>
        </div>
        <p class="text-gray-500 mb-4">No SMTP configurations found.</p>
        <a href="/config" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-xl hover:bg-indigo-100 transition-colors">
          Add Configuration
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    {:else}
      <div class="grid gap-3 sm:grid-cols-2">
        {#each configStore.configs as config}
          <button
            onclick={() => configStore.selectConfig(config.id)}
            class="text-left p-4 rounded-xl border-2 transition-all duration-300 group
                   {configStore.selectedConfigId === config.id
                     ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-500/10'
                     : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md'}"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl {configStore.selectedConfigId === config.id ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-500'} flex items-center justify-center transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">{config.name}</div>
                  <div class="text-sm text-gray-500">{config.host}:{config.port}</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                {#if config.isDefault}
                  <span class="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    Default
                  </span>
                {/if}
                {#if configStore.selectedConfigId === config.id}
                  <div class="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                {/if}
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </Card>

  <Card title="Contact List" icon="👥">
    <div class="space-y-4">
      <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-300 cursor-pointer relative">
        <input
          id="excelFile"
          type="file"
          accept=".xlsx,.xls,.csv"
          multiple
          onchange={handleExcelChange}
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
          <span class="text-2xl">📊</span>
        </div>
        <p class="font-semibold text-gray-700 mb-1">Upload Contact List</p>
        <p class="text-sm text-gray-500">Drag & drop or click to browse (.xlsx, .xls, .csv)</p>
        <p class="text-xs text-indigo-500 mt-2">You can upload multiple files</p>
      </div>

      <!-- Uploaded Files List -->
      {#if excelFiles.length > 0}
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">{excelFiles.length} file(s) uploaded</span>
            <button
              type="button"
              onclick={clearAllFiles}
              class="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          {#each excelFiles as file, index}
            <div class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-lg">{file.name.endsWith('.csv') ? '📄' : '📊'}</span>
                <span class="text-sm text-gray-700 truncate">{file.name}</span>
                <span class="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                type="button"
                onclick={() => removeFile(index)}
                class="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}

      {#if contacts.length > 0}
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-emerald-800">{contacts.length} contacts loaded</div>
              <div class="text-sm text-emerald-600 truncate">{contactColumns.join(', ')}</div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-xl p-4 space-y-3">
          <span class="block text-sm font-semibold text-gray-700">Send Range</span>
          <div class="space-y-2">
            <label class="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 cursor-pointer hover:border-indigo-200 transition-colors {sendRange === 'all' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}">
              <input type="radio" bind:group={sendRange} value="all" class="text-indigo-600 w-4 h-4" />
              <span class="text-sm font-medium">All contacts ({contacts.length})</span>
            </label>
            <label class="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 cursor-pointer hover:border-indigo-200 transition-colors {sendRange === 'first' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}">
              <input type="radio" bind:group={sendRange} value="first" class="text-indigo-600 w-4 h-4" />
              <span class="text-sm font-medium">First</span>
              <input
                type="number"
                bind:value={firstN}
                min="1"
                max={contacts.length}
                class="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span class="text-sm text-gray-500">contacts</span>
            </label>
            <label class="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 cursor-pointer hover:border-indigo-200 transition-colors {sendRange === 'range' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}">
              <input type="radio" bind:group={sendRange} value="range" class="text-indigo-600 w-4 h-4" />
              <span class="text-sm font-medium">Range from</span>
              <input
                type="number"
                bind:value={rangeFrom}
                min="1"
                max={contacts.length}
                class="w-16 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span class="text-sm text-gray-500">to</span>
              <input
                type="number"
                bind:value={rangeTo}
                min={rangeFrom}
                max={contacts.length}
                class="w-16 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </label>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600 bg-indigo-50 px-4 py-2 rounded-lg">
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sending to <strong class="text-indigo-600">{selectedContactCount}</strong> contacts</span>
          </div>
        </div>
      {/if}
    </div>
  </Card>

  <Card title="Email Content" icon="✉️">
    <div class="space-y-4">
      <Input
        label="Subject Line"
        bind:value={subject}
        placeholder="Enter a compelling subject..."
        required
      />

      <div>
        <label for="emailBody" class="block text-sm font-medium text-gray-700 mb-2">
          Email Body
        </label>
        <textarea
          id="emailBody"
          bind:value={htmlContent}
          placeholder="Write your email content here. HTML is fully supported for rich formatting."
          rows="10"
          class="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                 placeholder:text-gray-400 transition-all duration-200 hover:border-gray-300
                 resize-y"
        ></textarea>
        <div class="mt-2 flex flex-wrap gap-2">
          <span class="text-xs text-gray-500">Available placeholders:</span>
          <span class="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-mono">&#123;&#123;FirstName&#125;&#125;</span>
          <span class="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-mono">&#123;&#123;Email&#125;&#125;</span>
          <span class="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-mono">&#123;&#123;Company&#125;&#125;</span>
        </div>
      </div>

      <div class="relative">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center">
          <span class="bg-white px-4 text-sm text-gray-500">or</span>
        </div>
      </div>

      <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-300 cursor-pointer relative">
        <input
          id="htmlTemplate"
          type="file"
          accept=".html,.htm"
          onchange={handleHtmlTemplateChange}
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <span class="text-2xl">📄</span>
        </div>
        <p class="font-semibold text-gray-700 mb-1">Upload HTML Template</p>
        <p class="text-sm text-gray-500">Use a pre-designed email template (.html, .htm)</p>
      </div>
    </div>
  </Card>

  <Card title="Advanced Options" icon="⚙️">
    <div class="space-y-5">
      <!-- Batch Processing -->
      <div class="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
        <label class="flex items-center gap-3 cursor-pointer">
          <div class="relative">
            <input type="checkbox" bind:checked={useBatch} class="sr-only peer" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
          </div>
          <div>
            <span class="font-semibold text-gray-900">Batch Processing</span>
            <p class="text-sm text-gray-500">Send emails in batches with delays</p>
          </div>
        </label>

        {#if useBatch}
          <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label for="batchSize" class="block text-xs font-medium text-gray-600 mb-1.5">Batch Size</label>
              <input
                id="batchSize"
                type="number"
                bind:value={batchSize}
                min="1"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label for="batchDelay" class="block text-xs font-medium text-gray-600 mb-1.5">Batch Delay (s)</label>
              <input
                id="batchDelay"
                type="number"
                bind:value={batchDelay}
                min="1"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label for="emailDelay" class="block text-xs font-medium text-gray-600 mb-1.5">Email Delay (s)</label>
              <input
                id="emailDelay"
                type="number"
                bind:value={emailDelay}
                min="1"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        {/if}
      </div>

      <!-- Schedule -->
      <div class="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
        <label class="flex items-center gap-3 cursor-pointer">
          <div class="relative">
            <input type="checkbox" bind:checked={scheduleEmail} class="sr-only peer" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
          </div>
          <div>
            <span class="font-semibold text-gray-900">Schedule Email</span>
            <p class="text-sm text-gray-500">Send at a specific date and time</p>
          </div>
        </label>

        {#if scheduleEmail}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label for="scheduledTime" class="block text-xs font-medium text-gray-600 mb-1.5">Schedule Time</label>
              <input
                id="scheduledTime"
                type="datetime-local"
                bind:value={scheduledTime}
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label for="notifyEmail" class="block text-xs font-medium text-gray-600 mb-1.5">Notification Email</label>
              <input
                id="notifyEmail"
                type="email"
                bind:value={notifyEmail}
                placeholder="Get notified when sent"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400"
              />
            </div>
          </div>
        {/if}
      </div>
    </div>
  </Card>

  <!-- Sticky Send Button -->
  <div class="sticky bottom-3 sm:bottom-4 z-10">
    <div class="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xl shadow-gray-900/5">
      <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <div class="flex-1 text-center sm:text-left w-full sm:w-auto">
          {#if selectedContactCount > 0}
            <p class="text-xs sm:text-sm text-gray-600">
              Ready to send to <span class="font-bold text-indigo-600">{selectedContactCount}</span> recipients
              {#if excelFiles.length > 1}
                <span class="text-gray-400">(from {excelFiles.length} files)</span>
              {/if}
            </p>
          {:else}
            <p class="text-xs sm:text-sm text-gray-500">Upload contacts to get started</p>
          {/if}
        </div>
        <Button
          variant="primary"
          size="lg"
          loading={isSending}
          onclick={handleSend}
          disabled={!configStore.selectedConfigId || !subject || excelFiles.length === 0 || isSending}
          class="w-full sm:w-auto sm:min-w-[200px]"
        >
          {#if isSending}
            Sending...
          {:else if scheduleEmail}
            📅 Schedule Email
          {:else}
            🚀 Send Now
          {/if}
        </Button>
      </div>
    </div>
  </div>
</div>


