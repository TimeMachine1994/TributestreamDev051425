<script lang="ts">
  import { goto } from '$app/navigation';
  import { tributeService } from '$lib/services/wp-backbone-service';
  import TributeForm from '$lib/components/tributes/tribute-form.svelte';
  import type { Tribute } from '$lib/types/wp-models';
  
  // State
  let isSubmitting = false;
  let errors: Record<string, string> = {};
  
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
      
      // Create new tribute
      const newTribute = await tributeService.createTribute(formData);
      
      // Redirect to the tribute detail page
      goto(`/dashboard/tributes/${newTribute.id}`);
    } catch (err) {
      console.error('Error creating tribute:', err);
      
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
    goto('/dashboard/tributes');
  }
</script>

<svelte:head>
  <title>Create New Tribute | TributeStream</title>
  <meta name="description" content="Create a new tribute on TributeStream" />
</svelte:head>

<div class="create-tribute-page">
  <div class="page-header">
    <div class="back-link">
      <a href="/dashboard/tributes">← Back to Tributes</a>
    </div>
    
    <h1>Create New Tribute</h1>
  </div>
  
  {#if errors.api}
    <div class="api-error">
      <p>{errors.api}</p>
    </div>
  {/if}
  
  <TributeForm 
    {isSubmitting}
    {errors}
    on:submit={handleSubmit}
    on:cancel={handleCancel}
  />
</div>

<style>
  .create-tribute-page {
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
  
  .api-error {
    background-color: #fff5f5;
    color: #e53e3e;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
</style>