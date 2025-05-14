<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/services/auth-service';
  import { tributeService } from '$lib/services/wp-backbone-service';
  import type { Tribute } from '$lib/types/wp-models';
  
  // State
  let userTributes: Tribute[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Fetch user tributes
  onMount(async () => {
    try {
      loading = true;
      
      // Check if user is authenticated
      if (!$authStore.isAuthenticated) {
        authStore.checkAuth();
        
        // If still not authenticated, the layout will redirect to login
        if (!$authStore.isAuthenticated) {
          return;
        }
      }
      
      // Fetch all tributes
      const allTributes = await tributeService.getTributes();
      
      // Filter tributes by user ID
      userTributes = (allTributes as Tribute[]).filter(
        tribute => tribute.user_id === $authStore.user?.id
      );
      
      loading = false;
    } catch (err) {
      console.error('Error fetching user tributes:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  });
  
  // Handle logout
  function handleLogout() {
    authStore.logout();
    window.location.href = '/login';
  }
</script>

<svelte:head>
  <title>My Profile | TributeStream</title>
  <meta name="description" content="Manage your TributeStream profile" />
</svelte:head>

<div class="profile-page">
  <h1>My Profile</h1>
  
  {#if $authStore.isAuthenticated && $authStore.user}
    <div class="profile-content">
      <div class="profile-card">
        <h2>Account Information</h2>
        
        <div class="info-row">
          <div class="info-label">Display Name</div>
          <div class="info-value">{$authStore.user.display_name}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">Email</div>
          <div class="info-value">{$authStore.user.email}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">Username</div>
          <div class="info-value">{$authStore.user.nicename}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">Roles</div>
          <div class="info-value">
            {#if $authStore.user.roles && $authStore.user.roles.length > 0}
              <ul class="roles-list">
                {#each $authStore.user.roles as role}
                  <li>{role}</li>
                {/each}
              </ul>
            {:else}
              No roles assigned
            {/if}
          </div>
        </div>
        
        <div class="profile-actions">
          <button class="logout-button" on:click={handleLogout}>Logout</button>
        </div>
      </div>
      
      <div class="tributes-card">
        <h2>My Tributes</h2>
        
        {#if loading}
          <div class="loading">
            <p>Loading your tributes...</p>
          </div>
        {:else if error}
          <div class="error">
            <p>Error: {error}</p>
            <button class="retry-button" on:click={() => window.location.reload()}>Retry</button>
          </div>
        {:else if userTributes.length === 0}
          <div class="empty-state">
            <p>You haven't created any tributes yet.</p>
            <a href="/dashboard/tributes/new" class="create-button">Create Your First Tribute</a>
          </div>
        {:else}
          <div class="tributes-list">
            {#each userTributes as tribute (tribute.id)}
              <div class="tribute-item">
                <h3>{tribute.loved_one_name}</h3>
                <p class="date">Created: {new Date(tribute.date || '').toLocaleDateString()}</p>
                <div class="status-badge status-{tribute.status || 'draft'}">{tribute.status || 'Draft'}</div>
                <div class="tribute-actions">
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
    </div>
  {:else}
    <div class="loading">
      <p>Loading profile information...</p>
    </div>
  {/if}
</div>

<style>
  .profile-page {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 2rem;
  }
  
  .profile-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
  }
  
  .profile-card, .tributes-card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    font-size: 1.25rem;
    color: #333;
    margin-top: 0;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .info-row {
    display: grid;
    grid-template-columns: 120px 1fr;
    margin-bottom: 1rem;
  }
  
  .info-label {
    font-weight: 500;
    color: #666;
  }
  
  .info-value {
    color: #333;
  }
  
  .roles-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .roles-list li {
    display: inline-block;
    background-color: #f5f5f5;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .profile-actions {
    margin-top: 2rem;
  }
  
  .logout-button {
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }
  
  .loading, .error, .empty-state {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    margin: 1rem 0;
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
  
  .create-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #4a90e2;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    margin-top: 1rem;
  }
  
  .tributes-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .tribute-item {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .tribute-item h3 {
    font-size: 1.25rem;
    color: #333;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  
  .date {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
    margin-bottom: 1rem;
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
  
  .tribute-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .view-button, .edit-button {
    display: inline-block;
    padding: 0.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
    flex: 1;
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
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .profile-content {
      grid-template-columns: 1fr;
    }
    
    .info-row {
      grid-template-columns: 1fr;
      gap: 0.25rem;
    }
    
    .tributes-list {
      grid-template-columns: 1fr;
    }
  }
</style>