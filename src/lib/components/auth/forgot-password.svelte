<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { message } from 'sveltekit-superforms/client';
  import type { SuperValidated } from 'sveltekit-superforms';

  // Props
  let { form: formData, onCancel } = $props<{
    form: SuperValidated<Record<string, unknown>>;
    onCancel: () => void;
  }>();

  // Initialize the form
  const { form, errors, enhance, message: formMessage } = superForm(formData, {
    resetForm: true,
    taintedMessage: false,
    onSubmit: () => {
      isSubmitting = true;
    },
    onResult: ({ result }) => {
      isSubmitting = false;
    }
  });

  // State
  let isSubmitting = $state(false);
</script>

<div class="w-full max-w-md mx-auto">
  <div class="bg-surface-100 rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold mb-6 text-center" style="color: #D5BA7F;">Reset Password</h2>
    
    <p class="text-surface-950 mb-6 text-center">
      Enter your email address and we'll send you a link to reset your password.
    </p>
    
    <form method="POST" action="?/resetPassword" use:enhance class="space-y-6">
      <!-- Email field -->
      <div>
        <label for="email" class="block text-sm font-medium mb-2 text-surface-950">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          bind:value={$form.email}
          class="w-full px-4 py-3 rounded-md border bg-surface-50 text-surface-950 focus:ring-2 focus:ring-warning-500 focus:outline-none"
          autocomplete="email"
          required
        />
        {#if $errors.email}
          <p class="mt-1.5 text-sm text-error-500">{$errors.email}</p>
        {/if}
      </div>
      
      <!-- Form actions -->
      <div class="flex space-x-4">
        <button
          type="button"
          class="flex-1 py-3 px-6 bg-surface-200 text-surface-950 font-medium rounded-md hover:bg-surface-300 focus:outline-none focus:ring-2 focus:ring-surface-200 focus:ring-offset-2 transition-colors"
          on:click={onCancel}
          disabled={isSubmitting}
        >
          Back to Login
        </button>
        
        <button
          type="submit"
          class="flex-1 py-3 px-6 text-surface-950 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
          style="background-color: #D5BA7F; --tw-ring-color: #D5BA7F;"
          on:mouseover={(e) => e.currentTarget.style.backgroundColor = '#C5AA6F'}
          on:mouseout={(e) => e.currentTarget.style.backgroundColor = '#D5BA7F'}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </div>
      
      <!-- Form message (error/success) -->
      {#if $formMessage}
        <div class="mt-4 p-3 rounded-md text-center {$formMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          {$formMessage.text}
        </div>
      {/if}
    </form>
  </div>
</div>