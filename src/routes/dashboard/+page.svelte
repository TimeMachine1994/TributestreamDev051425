<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { tributeService } from '$lib/services/wp-backbone-service';
  import { authStore } from '$lib/services/auth-service';
  import { initializeBackbone } from '$lib/services/wp-backbone-service';
  import type { Tribute } from '$lib/types/wp-models';
  
  // State
  let tributes: Tribute[] = [];
  let recentTributes: Tribute[] = [];
  let totalTributes = 0;
  let loading = true;
  let error: string | null = null;
  let backboneInitialized = false;
  
  // Fetch data
  onMount(async () => {
    try {
      loading = true;
      
      // Initialize Backbone if not already done
      if (!backboneInitialized) {
        initializeBackbone();
        backboneInitialized = true;
      }
      
      // Fetch all tributes
      const result = await tributeService.getTributes();
      tributes = result as Tribute[];
      totalTributes = tributes.length;
      
      // Get recent tributes (last 5)
      recentTributes = [...tributes]
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
      
      loading = false;
    } catch (err) {
      console.error('Error fetching tributes:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Dashboard | TributeStream</title>
  <meta name="description" content="TributeStream Dashboard - Manage your tributes" />
</svelte:head>

<div class="dashboard-home">
  <h1>Dashboard</h1>
  <p class="welcome-message">Welcome back, {$authStore.user?.name || $authStore.user?.display_name || 'User'}!</p>
  
  {#if loading}
    <div class="loading">
      <p>Loading dashboard data...</p>
      {#if !browser}
        <p class="ssr-note">This content will be fully interactive after the page loads.</p>
      {/if}
    </div>
  {:else if error}
    <div class="error">
      <p>Error: {error}</p>
      <button class="retry-button" on:click={() => window.location.reload()}>Retry</button>
    </div>
  {:else}
    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>Total Tributes</h3>
        <p class="stat-value">{totalTributes}</p>
      </div>
      
      <!-- Add more stat cards as needed -->
    </div>
    
    <div class="recent-tributes">
      <h2>Recent Tributes</h2>
      
      {#if recentTributes.length === 0}
        <p class="empty-state">No tributes found. <a href="/dashboard/tributes/new">Create your first tribute</a>.</p>
      {:else}
        <div class="tribute-list">
          {#each recentTributes as tribute (tribute.id)}
            <div class="tribute-card">
              <h3>{tribute.loved_one_name}</h3>
              <p class="date">Created: {new Date(tribute.date || '').toLocaleDateString()}</p>
              <div class="actions">
                <a href="/dashboard/tributes/{tribute.id}" class="view-button">View</a>
                <a href="/dashboard/tributes/{tribute.id}/edit" class="edit-button">Edit</a>
              </div>
            </div>
          {/each}
        </div>
        
        <div class="view-all">
          <a href="/dashboard/tributes" class="view-all-button">View All Tributes</a>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dashboard-home {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .welcome-message {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 2rem;
  }
  
  .loading, .error {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    margin: 2rem 0;
  }
  
  .ssr-note {
    font-size: 0.9rem;
    color: #999;
    font-style: italic;
    margin-top: 0.5rem;
  }
  
  .error {
    background-color: #fff5f5;
    color: #e53e3e;
  }
  
  .retry-button {
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    margin-top: 1rem;
    cursor: pointer;
  }
  
  .dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .stat-card h3 {
    font-size: 1rem;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 600;
    color: #4a90e2;
  }
  
  .recent-tributes {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .recent-tributes h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
  }
  
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  
  .empty-state a {
    color: #4a90e2;
    text-decoration: none;
  }
  
  .tribute-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .tribute-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .tribute-card h3 {
    font-size: 1.25rem;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .date {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 1rem;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .view-button, .edit-button {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .view-button {
    background-color: #4a90e2;
    color: white;
  }
  
  .edit-button {
    background-color: #f5a623;
    color: white;
  }
  
  .view-all {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .view-all-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #f5f5f5;
    color: #333;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
  }
  
  .view-all-button:hover {
    background-color: #e0e0e0;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .dashboard-stats {
      grid-template-columns: 1fr;
    }
    
    .tribute-list {
      grid-template-columns: 1fr;
    }
  }
</style>