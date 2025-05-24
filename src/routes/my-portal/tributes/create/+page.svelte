<script lang="ts">
  import { enhance } from '$app/forms';

  let name = $state('');
  let description = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);
  let successMessage = $state<string | null>(null);
</script>

<svelte:head>
  <title>Create New Tribute | Tributestream</title>
  <meta name="description" content="Create a new tribute on Tributestream." />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-6 text-center text-gray-700">Create New Tribute</h1>

  <form
    method="POST"
    action="?/createTribute"
    use:enhance={() => {
      loading = true;
      error = null;
      successMessage = null;

      return async ({ result, update }) => {
        loading = false;
        if (result.type === 'failure') {
          error = (result.data as { error?: string })?.error || 'An unknown error occurred.';
        } else if (result.type === 'success') {
          successMessage = (result.data as { message?: string })?.message || 'Tribute created successfully!';
          name = '';
          description = '';
          // Potentially redirect or update UI further
        } else if (result.type === 'redirect') {
          await update();
        } else if (result.type === 'error') {
          // This handles network errors or other unhandled errors from enhance
          console.error('Enhance form submission error:', result.error);
          error = result.error?.message || 'A network error occurred. Please try again.';
        } else {
          // Catch any other unhandled result types
           console.warn('Unhandled result:', result as any);
           error = 'An unexpected error occurred. Please try again.';
        }
        // Ensure UI updates after state changes
        await update({ reset: false });
      };
    }}
    class="max-w-lg mx-auto bg-white p-8 shadow-md rounded-lg"
  >
    <div class="mb-6">
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Tribute Name</label>
      <input
        type="text"
        id="name"
        name="name"
        bind:value={name}
        required
        disabled={loading}
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder="e.g., John Doe's Memorial"
      />
    </div>

    <div class="mb-6">
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
      <textarea
        id="description"
        name="description"
        bind:value={description}
        disabled={loading}
        rows="4"
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder="Share a few words about the tribute..."
      ></textarea>
    </div>

    {#if error}
      <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
        <p class="font-bold">Error</p>
        <p>{error}</p>
      </div>
    {/if}

    {#if successMessage}
      <div class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md" role="alert">
        <p class="font-bold">Success</p>
        <p>{successMessage}</p>
      </div>
    {/if} <!-- This now correctly closes the #if successMessage block -->
    <!-- The extraneous {/if} and comment are removed by this replacement -->
    <div class="flex justify-end">
      <button
        type="submit"
        disabled={loading}
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {#if loading}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating...
        {:else}
          Create Tribute
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  /* Basic styling for the form, inspired by login form but simplified */
  .container {
    max-width: 800px;
  }
  /* Additional global styles might be in app.css or a theme file */
  /* Styles for error and success messages are Tailwind classes */
</style>