<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { message } from 'sveltekit-superforms/client';
  import type { SuperValidated } from 'sveltekit-superforms';

  // Props
  let { form: formData } = $props<{
    form: SuperValidated<Record<string, unknown>>;
  }>();

  // Initialize the form
  const { form, errors, enhance, message: formMessage } = superForm(formData, {
    resetForm: false,
    taintedMessage: false,
    onSubmit: () => {
      isSubmitting = true;
    },
    onResult: ({ result }) => {
      isSubmitting = false;
      if (result.type === 'success') {
        // Authentication successful - handled by the server
      }
    }
  });

  // State
  let isSubmitting = $state(false);
  let showPassword = $state(false);

  // Toggle password visibility
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<div class="w-full max-w-md mx-auto">
  <div class="bg-surface-100 rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold mb-6 text-center" style="color: black;">Log In to Your Account</h2>
    
    <form method="POST" action="?/login" use:enhance class="space-y-6">
      <!-- Username field -->
      <div>
        <label for="username" class="block text-sm font-medium mb-2 text-surface-950">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          bind:value={$form.username}
          class="w-full px-4 py-3 rounded-md border bg-surface-50 text-surface-950 focus:ring-2 focus:ring-warning-500 focus:outline-none"
          autocomplete="username"
          required
        />
        {#if $errors.username}
          <p class="mt-1.5 text-sm text-error-500">{$errors.username}</p>
        {/if}
      </div>
      
      <!-- Password field -->
      <div>
        <label for="password" class="block text-sm font-medium mb-2 text-surface-950">
          Password
        </label>
        <div class="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            bind:value={$form.password}
            class="w-full px-4 py-3 rounded-md border bg-surface-50 text-surface-950 focus:ring-2 focus:ring-warning-500 focus:outline-none"
            autocomplete="current-password"
            required
          />
          <button 
            type="button" 
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-600 hover:text-surface-950"
            on:click={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {#if showPassword}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            {/if}
          </button>
        </div>
        {#if $errors.password}
          <p class="mt-1.5 text-sm text-error-500">{$errors.password}</p>
        {/if}
      </div>
      
      <!-- Forgot password link removed as requested -->
      
      <!-- Submit button -->
      <button
        type="submit"
        class="btn preset-filled-primary-500 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </button>
      
      <!-- Form message (error/success) -->
      {#if $formMessage}
        <div class="mt-4 p-3 rounded-md text-center {$formMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          {$formMessage.text}
        </div>
      {/if}
    </form>
  </div>
</div>