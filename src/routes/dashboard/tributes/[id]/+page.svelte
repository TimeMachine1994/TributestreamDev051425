<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { tributeService } from '$lib/services/wp-backbone-service';
  import type { Tribute } from '$lib/types/wp-models';
  
  // State
  let tribute: Tribute | null = null;
  let loading = true;
  let error: string | null = null;
  
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
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  });
  
  // Format date
  function formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Delete tribute
  async function deleteTribute() {
    if (!tribute) return;
    
    if (confirm(`Are you sure you want to delete the tribute for ${tribute.loved_one_name}?`)) {
      try {
        await tributeService.deleteTribute(tribute.id);
        window.location.href = '/dashboard/tributes';
      } catch (err) {
        console.error('Error deleting tribute:', err);
        alert('Failed to delete tribute');
      }
    }
  }
</script>

<svelte:head>
  <title>{tribute ? `${tribute.loved_one_name} | TributeStream` : 'Tribute Details | TributeStream'}</title>
  <meta name="description" content={tribute ? `Tribute for ${tribute.loved_one_name}` : 'Tribute details'} />
</svelte:head>

<div class="tribute-detail-page">
  <div class="page-header">
    <div class="back-link">
      <a href="/dashboard/tributes">← Back to Tributes</a>
    </div>
    
    {#if tribute}
      <h1>{tribute.loved_one_name}</h1>
      <div class="status-badge status-{tribute.status || 'draft'}">{tribute.status || 'Draft'}</div>
    {:else}
      <h1>Tribute Details</h1>
    {/if}
  </div>
  
  {#if loading}
    <div class="loading">
      <p>Loading tribute details...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>Error: {error}</p>
      <button class="retry-button" on:click={() => window.location.reload()}>Retry</button>
    </div>
  {:else if !tribute}
    <div class="not-found">
      <p>Tribute not found.</p>
      <a href="/dashboard/tributes" class="back-button">Back to Tributes</a>
    </div>
  {:else}
    <div class="tribute-content">
      <div class="tribute-info">
        <div class="info-card">
          <h2>Basic Information</h2>
          
          <div class="info-row">
            <div class="info-label">Loved One Name</div>
            <div class="info-value">{tribute.loved_one_name}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Created</div>
            <div class="info-value">{formatDate(tribute.date)}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Last Modified</div>
            <div class="info-value">{formatDate(tribute.modified)}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Status</div>
            <div class="info-value">
              <span class="status-badge status-{tribute.status || 'draft'}">{tribute.status || 'Draft'}</span>
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Phone Number</div>
            <div class="info-value">{tribute.phone_number || 'N/A'}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Number of Streams</div>
            <div class="info-value">{tribute.number_of_streams || 0}</div>
          </div>
        </div>
        
        {#if tribute.custom_html}
          <div class="info-card">
            <h2>Custom HTML</h2>
            <div class="custom-html-preview">
              <div class="html-content">
                {@html tribute.custom_html}
              </div>
            </div>
          </div>
        {/if}
        
        {#if tribute.extended_data}
          <div class="info-card">
            <h2>Extended Data</h2>
            <pre class="extended-data">{JSON.stringify(tribute.extended_data, null, 2)}</pre>
          </div>
        {/if}
      </div>
      
      <div class="tribute-actions">
        <a href="/dashboard/tributes/{tribute.id}/edit" class="edit-button">Edit Tribute</a>
        <button class="delete-button" on:click={deleteTribute}>Delete Tribute</button>
        <a href="/celebration-of-life-for-{tribute.slug}" class="view-public-button" target="_blank">View Public Page</a>
      </div>
    </div>
  {/if}
</div>

<style>
  .tribute-detail-page {
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
    margin: 0 0 0.5rem 0;
    display: inline-block;
    margin-right: 1rem;
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
  
  .tribute-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .info-card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }
  
  .info-card h2 {
    font-size: 1.25rem;
    color: #333;
    margin-top: 0;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .info-row {
    display: grid;
    grid-template-columns: 200px 1fr;
    margin-bottom: 1rem;
  }
  
  .info-label {
    font-weight: 500;
    color: #666;
  }
  
  .info-value {
    color: #333;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .status-draft {
    background-color: #f5f5f5;
    color: #666;
  }
  
  .status-published {
    background-color: #c6f6d5;
    color: #2f855a;
  }
  
  .status-pending {
    background-color: #feebc8;
    color: #c05621;
  }
  
  .custom-html-preview {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 1rem;
    background-color: #f9f9f9;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .html-content {
    pointer-events: none;
  }
  
  .extended-data {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.875rem;
    white-space: pre-wrap;
    overflow-x: auto;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .tribute-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .edit-button, .delete-button, .view-public-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    text-align: center;
  }
  
  .edit-button {
    background-color: #f5a623;
    color: white;
  }
  
  .delete-button {
    background-color: #e53e3e;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .view-public-button {
    background-color: #4a90e2;
    color: white;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .info-row {
      grid-template-columns: 1fr;
      gap: 0.25rem;
    }
    
    .tribute-actions {
      flex-direction: column;
    }
    
    .edit-button, .delete-button, .view-public-button {
      width: 100%;
    }
  }
</style>