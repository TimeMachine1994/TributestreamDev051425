<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { tributeService } from '$lib/services/wp-backbone-service';
  import TributeForm from '$lib/components/tributes/tribute-form.svelte';
  import type { Tribute } from '$lib/types/wp-models';
  
  // State
  let tribute: Tribute | null = null;
  let isSubmitting = false;
  let loading = true;
  let errors: Record<string, string> = {};
  let loadError: string | null = null;
  
  // Get tribute ID from URL
  $: tributeId = parseInt($page.params.id);
  
  // Fetch tribute data
  onMount(async () => {
    try {
      loading = true;
      
      // Fetch tribute by ID
      const result = await tributeService.getTribute(tributeId);
      tribute = result as Tribute;
      
      loading = false;
    } catch (err) {
      console.error('Error fetching tribute:', err);
      loadError = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  });
  
  // Handle form submission
  async function handleSubmit(event: CustomEvent) {
    const formData = event.detail;
    
    // Check if there are validation errors
    if ('errors' in formData) {
      errors = formData.errors;
      return;
    }
    
    try {
      isSubmitting = true;
      
      // Update tribute
      await tributeService.updateTribute(tributeId, formData);
      
      // Redirect to the tribute detail page
      goto(`/dashboard/tributes/${tributeId}`);
    } catch (err) {
      console.error('Error updating tribute:', err);
      
      // Handle API errors
      if (err instanceof Error) {
        errors = { api: err.message };
      } else {
        errors = { api: 'An unexpected error occurred' };
      }
      
      isSubmitting = false;
    }
  }
  
  // Handle cancel
  function handleCancel() {
    goto(`/dashboard/tributes/${tributeId}`);
  }
</script>

<svelte:head>
  <title>{tribute ? `Edit ${tribute.loved_one_name} | TributeStream` : 'Edit Tribute | TributeStream'}</title>
  <meta name="description" content={tribute ? `Edit tribute for ${tribute.loved_one_name}` : 'Edit tribute'} />
</svelte:head>

<div class="edit-tribute-page">
  <div class="page-header">
    <div class="back-link">
      <a href="/dashboard/tributes/{tributeId}">← Back to Tribute</a>
    </div>
    
    <h1>{tribute ? `Edit ${tribute.loved_one_name}` : 'Edit Tribute'}</h1>
  </div>
  
  {#if loading}
    <div class="loading">
      <p>Loading tribute data...</p>
    </div>
  {:else if loadError}
    <div class="error">
      <p>Error: {loadError}</p>
      <button class="retry-button" on:click={() => window.location.reload()}>Retry</button>
    </div>
  {:else if !tribute}
    <div class="not-found">
      <p>Tribute not found.</p>
      <a href="/dashboard/tributes" class="back-button">Back to Tributes</a>
    </div>
  {:else}
    {#if errors.api}
      <div class="api-error">
        <p>{errors.api}</p>
      </div>
    {/if}
    
    <TributeForm 
      tribute={tribute}
      {isSubmitting}
      {errors}
      on:submit={handleSubmit}
      on:cancel={handleCancel}
    />
  {/if}
</div>

<style>
  .edit-tribute-page {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .page-header {
    margin-bottom: 2rem;
  }
  
  .back-link {
    margin-bottom: 1rem;
  }
  
  .back-link a {
    color: #4a90e2;
    text-decoration: none;
  }
  
  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  
  .loading, .error, .not-found {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    margin: 2rem 0;
  }
  
  .error {
    background-color: #fff5f5;
    color: #e53e3e;
  }
  
  .retry-button, .back-button {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    cursor: pointer;
    text-decoration: none;
  }
  
  .retry-button {
    background-color: #e53e3e;
    color: white;
    border: none;
  }
  
  .back-button {
    background-color: #4a90e2;
    color: white;
  }
  
  .api-error {
    background-color: #fff5f5;
    color: #e53e3e;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
</style>