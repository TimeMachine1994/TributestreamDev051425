<script lang="ts">
  import { onMount } from 'svelte';
  import { tributeService } from '$lib/services/wp-backbone-service';
  import type { Tribute } from '$lib/types/wp-models';
  
  // State
  let tributes: Tribute[] = [];
  let filteredTributes: Tribute[] = [];
  let loading = true;
  let error: string | null = null;
  
  // Filtering and sorting state
  let searchQuery = '';
  let sortField: 'loved_one_name' | 'date' | 'status' = 'date';
  let sortDirection: 'asc' | 'desc' = 'desc';
  
  // Pagination state
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  
  // Fetch tributes
  onMount(async () => {
    try {
      loading = true;
      
      // Fetch all tributes
      const result = await tributeService.getTributes();
      tributes = result.tributes as Tribute[];
      
      // Update pagination from API response
      if (result.total_pages) {
        totalPages = result.total_pages;
      }
      if (result.current_page) {
        currentPage = result.current_page;
      }
      
      // Apply initial filtering and sorting
      applyFiltersAndSort();
      
      loading = false;
    } catch (err) {
      console.error('Error fetching tributes:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      loading = false;
    }
  });
  
  // Apply filters and sorting
  function applyFiltersAndSort() {
    // Filter tributes
    if (searchQuery.trim() === '') {
      filteredTributes = [...tributes];
    } else {
      const query = searchQuery.toLowerCase();
      filteredTributes = tributes.filter(tribute => 
        tribute.loved_one_name.toLowerCase().includes(query)
      );
    }
    
    // Sort tributes
    filteredTributes.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'loved_one_name') {
        comparison = a.loved_one_name.localeCompare(b.loved_one_name);
      } else if (sortField === 'date') {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    // Update pagination
    totalPages = Math.ceil(filteredTributes.length / itemsPerPage);
    if (currentPage > totalPages) {
      currentPage = totalPages || 1;
    }
  }
  
  // Handle search
  function handleSearch() {
    applyFiltersAndSort();
    currentPage = 1;
  }
  
  // Handle sort
  function handleSort(field: 'loved_one_name' | 'date' | 'status') {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
    
    applyFiltersAndSort();
  }
  
  // Get current page items
  $: paginatedTributes = filteredTributes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle page change
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }
  
  // Delete tribute
  async function deleteTribute(id: number) {
    if (confirm('Are you sure you want to delete this tribute?')) {
      try {
        await tributeService.deleteTribute(id);
        
        // Remove from local state
        tributes = tributes.filter(tribute =>
          ((tribute as any).tribute_id || tribute.id) !== id
        );
        applyFiltersAndSort();
      } catch (err) {
        console.error('Error deleting tribute:', err);
        alert('Failed to delete tribute');
      }
    }
  }
</script>

<svelte:head>
  <title>Tributes | TributeStream Dashboard</title>
  <meta name="description" content="Manage your tributes on TributeStream" />
</svelte:head>

<div class="tributes-page">
  <div class="page-header">
    <h1>Tributes</h1>
    <a href="/dashboard/tributes/new" class="create-button">Create New Tribute</a>
  </div>
  
  <div class="filters">
    <div class="search-box">
      <input 
        type="text" 
        placeholder="Search tributes..." 
        bind:value={searchQuery}
        on:input={handleSearch}
      />
    </div>
  </div>
  
  {#if loading}
    <div class="loading">
      <p>Loading tributes...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>Error: {error}</p>
      <button class="retry-button" on:click={() => window.location.reload()}>Retry</button>
    </div>
  {:else if filteredTributes.length === 0}
    <div class="empty-state">
      <p>No tributes found. {searchQuery ? 'Try a different search term.' : ''}</p>
      <a href="/dashboard/tributes/new" class="create-button">Create New Tribute</a>
    </div>
  {:else}
    <div class="tributes-table-container">
      <table class="tributes-table">
        <thead>
          <tr>
            <th on:click={() => handleSort('loved_one_name')}>
              Loved One Name
              {#if sortField === 'loved_one_name'}
                <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </th>
            <th on:click={() => handleSort('date')}>
              Created
              {#if sortField === 'date'}
                <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </th>
            <th on:click={() => handleSort('status')}>
              Status
              {#if sortField === 'status'}
                <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each paginatedTributes as tribute ((tribute as any).tribute_id || tribute.id)}
            <tr>
              <td>{tribute.loved_one_name}</td>
              <td>{new Date((tribute as any).created_at || tribute.date || '').toLocaleDateString()}</td>
              <td>
                <span class="status-badge status-{tribute.status || 'draft'}">{tribute.status || 'Draft'}</span>
              </td>
              <td class="actions">
                <a href="/dashboard/tributes/{(tribute as any).tribute_id || tribute.id}" class="view-button">View</a>
                <a href="/dashboard/tributes/{(tribute as any).tribute_id || tribute.id}/edit" class="edit-button">Edit</a>
                <button class="delete-button" on:click={() => deleteTribute((tribute as any).tribute_id || tribute.id)}>Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    {#if totalPages > 1}
      <div class="pagination">
        <button 
          class="pagination-button" 
          disabled={currentPage === 1}
          on:click={() => goToPage(currentPage - 1)}
        >
          Previous
        </button>
        
        {#each Array(totalPages) as _, i}
          <button 
            class="pagination-button {currentPage === i + 1 ? 'active' : ''}"
            on:click={() => goToPage(i + 1)}
          >
            {i + 1}
          </button>
        {/each}
        
        <button 
          class="pagination-button" 
          disabled={currentPage === totalPages}
          on:click={() => goToPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .tributes-page {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  
  .create-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #4a90e2;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
  }
  
  .filters {
    display: flex;
    margin-bottom: 1.5rem;
  }
  
  .search-box {
    flex: 1;
  }
  
  .search-box input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .loading, .error, .empty-state {
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
  
  .retry-button {
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    margin-top: 1rem;
    cursor: pointer;
  }
  
  .tributes-table-container {
    overflow-x: auto;
  }
  
  .tributes-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .tributes-table th,
  .tributes-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .tributes-table th {
    background-color: #f5f5f5;
    font-weight: 600;
    cursor: pointer;
  }
  
  .tributes-table th:hover {
    background-color: #e0e0e0;
  }
  
  .sort-indicator {
    margin-left: 0.5rem;
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
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .view-button, .edit-button, .delete-button {
    display: inline-block;
    padding: 0.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.75rem;
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
  
  .delete-button {
    background-color: #e53e3e;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 2rem;
  }
  
  .pagination-button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .pagination-button.active {
    background-color: #4a90e2;
    color: white;
    border-color: #4a90e2;
  }
  
  .pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .actions {
      flex-direction: column;
    }
    
    .view-button, .edit-button, .delete-button {
      text-align: center;
    }
  }
</style>