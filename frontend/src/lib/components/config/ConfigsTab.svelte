<script lang="ts">
  import { configStore, toastStore } from '$lib/stores/index.svelte';
  import type { SMTPConfig } from '$lib/types';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  // Modal state
  let showModal = $state(false);
  let isEditing = $state(false);
  let editingConfigId = $state<string | null>(null);

  // Form state
  let formName = $state('');
  let formHost = $state('');
  let formPort = $state(587);
  let formSecure = $state(false);
  let formUser = $state('');
  let formPass = $state('');
  let formFromEmail = $state('');
  let formFromName = $state('');
  let formIsDefault = $state(false);

  let isSaving = $state(false);
  let isDeleting = $state<string | null>(null);
  let showPassword = $state(false);
  let isTesting = $state(false);

  function resetForm() {
    formName = '';
    formHost = '';
    formPort = 587;
    formSecure = false;
    formUser = '';
    formPass = '';
    formFromEmail = '';
    formFromName = '';
    formIsDefault = false;
    isEditing = false;
    editingConfigId = null;
    showPassword = false;
  }

  function openAddModal() {
    resetForm();
    showModal = true;
  }

  function openEditModal(config: SMTPConfig) {
    isEditing = true;
    editingConfigId = config.id;
    formName = config.name;
    formHost = config.host;
    formPort = config.port;
    formSecure = config.secure;
    formUser = config.user;
    formPass = ''; // Don't show existing password
    formFromEmail = config.fromEmail;
    formFromName = config.fromName;
    formIsDefault = config.isDefault;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    resetForm();
  }

  async function handleSubmit() {
    if (!formName || !formHost || !formUser || !formFromEmail) {
      toastStore.error('Please fill in all required fields');
      return;
    }

    if (!isEditing && !formPass) {
      toastStore.error('Password is required for new configurations');
      return;
    }

    isSaving = true;

    try {
      const configData = {
        name: formName,
        host: formHost,
        port: formPort,
        secure: formSecure,
        user: formUser,
        pass: formPass,
        fromEmail: formFromEmail,
        fromName: formFromName,
        isDefault: formIsDefault
      };

      let response;
      if (isEditing && editingConfigId) {
        // Only send password if it was changed
        if (!formPass) {
          delete (configData as any).pass;
        }
        response = await configStore.updateConfig(editingConfigId, configData);
      } else {
        response = await configStore.createConfig(configData as any);
      }

      if (response.success) {
        toastStore.success(isEditing ? 'Configuration updated' : 'Configuration created');
        closeModal();
      } else {
        toastStore.error(response.message || 'Failed to save configuration');
      }
    } catch (error) {
      toastStore.error('Error saving configuration');
    } finally {
      isSaving = false;
    }
  }

  async function handleDelete(configId: string) {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    isDeleting = configId;
    try {
      const response = await configStore.deleteConfig(configId);
      if (response.success) {
        toastStore.success('Configuration deleted');
      } else {
        toastStore.error(response.message || 'Failed to delete configuration');
      }
    } catch (error) {
      toastStore.error('Error deleting configuration');
    } finally {
      isDeleting = null;
    }
  }

  async function handleSetDefault(configId: string) {
    try {
      const response = await configStore.setDefault(configId);
      if (response.success) {
        toastStore.success('Default configuration updated');
      } else {
        toastStore.error(response.message || 'Failed to set default');
      }
    } catch (error) {
      toastStore.error('Error setting default configuration');
    }
  }

  // Quick presets for common SMTP providers
  function applyPreset(preset: string) {
    switch (preset) {
      case 'gmail':
        formHost = 'smtp.gmail.com';
        formPort = 465;
        formSecure = true;
        break;
      case 'outlook':
        formHost = 'smtp-mail.outlook.com';
        formPort = 587;
        formSecure = false;
        break;
      case 'yahoo':
        formHost = 'smtp.mail.yahoo.com';
        formPort = 465;
        formSecure = true;
        break;
      case 'sendgrid':
        formHost = 'smtp.sendgrid.net';
        formPort = 587;
        formSecure = false;
        break;
    }
  }

  async function handleTestConnection() {
    if (!formHost || !formUser || !formPass) {
      toastStore.error('Please fill in host, username, and password to test connection');
      return;
    }

    isTesting = true;
    try {
      const response = await configStore.testConnection({
        host: formHost,
        port: formPort,
        secure: formSecure,
        user: formUser,
        pass: formPass
      });

      if (response.success) {
        toastStore.success(response.message || 'Connection successful! ✅');
      } else {
        toastStore.error(response.message || 'Connection failed');
      }
    } catch (error) {
      toastStore.error('Error testing connection');
    } finally {
      isTesting = false;
    }
  }
</script>

<div class="space-y-6 animate-fade-in">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        SMTP Settings
      </h1>
      <p class="text-gray-500 mt-1">Manage your email sending configurations.</p>
    </div>
    <Button onclick={openAddModal}>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Add Configuration
    </Button>
  </div>

  {#if configStore.configs.length === 0}
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
      <div class="text-center max-w-md mx-auto">
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <span class="text-4xl">⚙️</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Configurations</h3>
        <p class="text-gray-500 mb-6">
          Add your first SMTP configuration to start sending emails.
        </p>
        <Button onclick={openAddModal}>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Configuration
        </Button>
      </div>
    </div>
  {:else}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each configStore.configs as config}
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative hover:shadow-lg transition-all duration-300 group">
          {#if config.isDefault}
            <span class="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm">
              Default
            </span>
          {/if}

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div class="flex-1 min-w-0 pr-12">
                <h3 class="font-semibold text-gray-900 truncate">{config.name}</h3>
                <p class="text-sm text-gray-500 truncate">{config.fromEmail}</p>
              </div>
            </div>

            <div class="space-y-2 p-3 bg-gray-50 rounded-xl">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Host</span>
                <span class="font-mono text-gray-900 text-xs bg-white px-2 py-0.5 rounded">{config.host}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Port</span>
                <span class="font-mono text-gray-900 text-xs bg-white px-2 py-0.5 rounded">{config.port}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Security</span>
                <span class="font-mono text-gray-900 text-xs bg-white px-2 py-0.5 rounded">{config.secure ? 'SSL/TLS' : 'STARTTLS'}</span>
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <Button variant="secondary" size="sm" onclick={() => openEditModal(config)} class="flex-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              {#if !config.isDefault}
                <Button variant="ghost" size="sm" onclick={() => handleSetDefault(config.id)}>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </Button>
              {/if}
              <Button
                variant="ghost"
                size="sm"
                onclick={() => handleDelete(config.id)}
                loading={isDeleting === config.id}
                class="text-red-600 hover:bg-red-50"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal -->
{#if showModal}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
    <div class="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
      <div class="sticky top-0 bg-white/95 backdrop-blur-xl px-6 py-4 border-b border-gray-100 flex justify-between items-center rounded-t-3xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Configuration' : 'Add Configuration'}
          </h2>
        </div>
        <button onclick={closeModal} class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
          ✕
        </button>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-6 space-y-5">
        <!-- Quick Presets -->
        <div class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Quick Presets</span>
          <div class="flex flex-wrap gap-2">
            <button type="button" onclick={() => applyPreset('gmail')}
              class="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5">
              <span>📧</span> Gmail
            </button>
            <button type="button" onclick={() => applyPreset('outlook')}
              class="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5">
              <span>📬</span> Outlook
            </button>
            <button type="button" onclick={() => applyPreset('yahoo')}
              class="px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1.5">
              <span>📩</span> Yahoo
            </button>
            <button type="button" onclick={() => applyPreset('sendgrid')}
              class="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
              <span>⚡</span> SendGrid
            </button>
          </div>
        </div>

        <Input
          label="Configuration Name"
          bind:value={formName}
          placeholder="My Gmail Account"
          required
        />

        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-2">
            <Input
              label="SMTP Host"
              bind:value={formHost}
              placeholder="smtp.gmail.com"
              required
            />
          </div>
          <Input
            label="Port"
            type="number"
            bind:value={formPort}
            required
          />
        </div>

        <label class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
          <div class="relative">
            <input type="checkbox" bind:checked={formSecure} class="sr-only peer" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
          </div>
          <div>
            <span class="font-medium text-gray-900">SSL/TLS</span>
            <p class="text-xs text-gray-500">Use for port 465</p>
          </div>
        </label>

        <div class="grid grid-cols-2 gap-4">
          <Input
            label="Username"
            bind:value={formUser}
            placeholder="you@example.com"
            required
          />
          <div class="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              bind:value={formPass}
              placeholder="App password"
              required={!isEditing}
            />
            <button
              type="button"
              onclick={() => showPassword = !showPassword}
              class="absolute right-3 top-9 text-gray-400 hover:text-gray-600 text-sm p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showPassword ? '🔒' : '👁'}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <Input
            label="From Email"
            type="email"
            bind:value={formFromEmail}
            placeholder="sender@example.com"
            required
          />
          <Input
            label="From Name"
            bind:value={formFromName}
            placeholder="Your Name"
          />
        </div>

        <label class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
          <div class="relative">
            <input type="checkbox" bind:checked={formIsDefault} class="sr-only peer" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
          </div>
          <div>
            <span class="font-medium text-gray-900">Set as Default</span>
            <p class="text-xs text-gray-500">Use this configuration by default</p>
          </div>
        </label>

        {#if formHost.includes('gmail')}
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div class="flex gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span class="text-amber-600">💡</span>
              </div>
              <div>
                <p class="font-semibold text-amber-800 mb-1">Gmail Setup Instructions</p>
                <ul class="text-sm text-amber-700 space-y-1">
                  <li>• Enable 2FA on your Google account</li>
                  <li>• Generate an App Password at <span class="font-mono text-xs">myaccount.google.com/apppasswords</span></li>
                </ul>
              </div>
            </div>
          </div>
        {/if}

        <div class="flex flex-col gap-3 pt-4 border-t border-gray-100">
          <!-- Test Connection Button -->
          <Button
            type="button"
            variant="secondary"
            onclick={handleTestConnection}
            loading={isTesting}
            disabled={!formHost || !formUser || !formPass}
            class="w-full"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>

          <div class="flex gap-3">
            <Button type="button" variant="secondary" onclick={closeModal} class="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={isSaving} class="flex-1">
              {isEditing ? 'Save Changes' : 'Create Configuration'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
{/if}

