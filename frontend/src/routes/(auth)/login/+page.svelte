<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore, toastStore } from '$lib/stores/index.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let activeTab = $state<'login' | 'register'>('login');
  let isLoading = $state(false);

  // Login form
  let loginEmail = $state('');
  let loginPassword = $state('');

  // Register form
  let registerName = $state('');
  let registerEmail = $state('');
  let registerPassword = $state('');
  let registerConfirmPassword = $state('');

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toastStore.error('Please fill in all fields');
      return;
    }

    isLoading = true;
    try {
      const response = await authStore.login(loginEmail, loginPassword);
      if (response.success) {
        toastStore.success('Login successful!');
        goto('/');
      } else {
        toastStore.error(response.message || 'Login failed');
      }
    } catch (error) {
      toastStore.error('An error occurred. Please try again.');
    } finally {
      isLoading = false;
    }
  }

  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();

    if (!registerName || !registerEmail || !registerPassword) {
      toastStore.error('Please fill in all fields');
      return;
    }

    if (registerPassword.length < 6) {
      toastStore.error('Password must be at least 6 characters');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toastStore.error('Passwords do not match');
      return;
    }

    isLoading = true;
    try {
      const response = await authStore.register(registerEmail, registerName, registerPassword);
      if (response.success) {
        toastStore.success('Account created successfully!');
        goto('/');
      } else {
        toastStore.error(response.message || 'Registration failed');
      }
    } catch (error) {
      toastStore.error('An error occurred. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - Email Sender</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
  <!-- Background Decorations -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-white/5 rounded-full blur-3xl"></div>
  </div>

  <div class="w-full max-w-md relative z-10 animate-scale-in">
    <!-- Logo Section -->
    <div class="text-center mb-6 sm:mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-xl mb-3 sm:mb-4 shadow-2xl">
        <span class="text-3xl sm:text-4xl">📧</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Email Sender</h1>
      <p class="text-sm sm:text-base text-white/70">Powerful bulk email management</p>
    </div>

    <!-- Card -->
    <div class="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border border-white/20">
      <!-- Tab Switcher -->
      <div class="flex bg-gray-100 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 mb-6 sm:mb-8">
        <button
          class="flex-1 py-2.5 sm:py-3 text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300
                 {activeTab === 'login'
                   ? 'bg-white text-indigo-600 shadow-md'
                   : 'text-gray-500 hover:text-gray-700'}"
          onclick={() => activeTab = 'login'}
        >
          Sign In
        </button>
        <button
          class="flex-1 py-2.5 sm:py-3 text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300
                 {activeTab === 'register'
                   ? 'bg-white text-indigo-600 shadow-md'
                   : 'text-gray-500 hover:text-gray-700'}"
          onclick={() => activeTab = 'register'}
        >
          Sign Up
        </button>
      </div>

      {#if activeTab === 'login'}
        <form onsubmit={handleLogin} class="space-y-4 sm:space-y-5">
          <Input
            label="Email Address"
            type="email"
            bind:value={loginEmail}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            bind:value={loginPassword}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            class="w-full"
          >
            Sign In
          </Button>

          <p class="text-center text-sm text-gray-500">
            Don't have an account?
            <button type="button" onclick={() => activeTab = 'register'} class="text-indigo-600 font-semibold hover:text-indigo-700">
              Create one
            </button>
          </p>
        </form>
      {:else}
        <form onsubmit={handleRegister} class="space-y-4 sm:space-y-5">
          <Input
            label="Full Name"
            type="text"
            bind:value={registerName}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email Address"
            type="email"
            bind:value={registerEmail}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            bind:value={registerPassword}
            placeholder="At least 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            bind:value={registerConfirmPassword}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            class="w-full"
          >
            Create Account
          </Button>

          <p class="text-center text-xs sm:text-sm text-gray-500">
            Already have an account?
            <button type="button" onclick={() => activeTab = 'login'} class="text-indigo-600 font-semibold hover:text-indigo-700">
              Sign in
            </button>
          </p>
        </form>
      {/if}
    </div>

    <!-- Footer -->
    <p class="text-center text-white/60 text-xs sm:text-sm mt-4 sm:mt-6">
      © 2024 Email Sender. All rights reserved.
    </p>
  </div>
</div>

