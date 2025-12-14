<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore, toastStore } from '$lib/stores/index.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let isLoading = $state(false);
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');

  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();

    if (!name || !email || !password) {
      toastStore.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toastStore.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toastStore.error('Passwords do not match');
      return;
    }

    isLoading = true;
    try {
      const response = await authStore.register(email, name, password);
      if (response.success) {
        toastStore.success('Account created successfully!');
        goto('/dashboard');
      } else {
        toastStore.error(response.message || 'Registration failed');
      }
    } catch {
      toastStore.error('An error occurred. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Register - Email Sender</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="text-center mb-6">
        <h1 class="text-xl font-semibold text-gray-900">📧 Email Sender</h1>
        <p class="text-sm text-gray-500 mt-1">Create your account</p>
      </div>

      <form onsubmit={handleRegister} class="space-y-4">
        <Input label="Name" type="text" bind:value={name} placeholder="John Doe" required />
        <Input label="Email" type="email" bind:value={email} placeholder="you@example.com" required />
        <Input label="Password" type="password" bind:value={password} placeholder="At least 6 characters" required />
        <Input label="Confirm Password" type="password" bind:value={confirmPassword} placeholder="••••••••" required />
        <Button type="submit" variant="primary" loading={isLoading} class="w-full">Create Account</Button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-4">
        Already have an account? <a href="/login" class="text-indigo-600 hover:underline">Sign in</a>
      </p>
    </div>
  </div>
</div>

