<script lang="ts">
  import { authStore } from '$lib/services/auth-service';
  import { goto } from '$app/navigation';

  // Handle logout
  function handleLogout() {
    authStore.logout();
    goto('/login');
  }
</script>

<header class="dashboard-header">
  <div class="container">
    <div class="logo">
      <h1>TributeStream Dashboard</h1>
    </div>
    
    <div class="user-menu">
      {#if $authStore.isAuthenticated && $authStore.user}
        <div class="user-info">
          <span class="user-name">{$authStore.user.display_name}</span>
          <div class="dropdown">
            <button class="dropdown-toggle">
              <span class="avatar">
                {$authStore.user.display_name.charAt(0).toUpperCase()}
              </span>
              <span class="caret">▼</span>
            </button>
            <div class="dropdown-menu">
              <a href="/dashboard/profile">Profile</a>
              <button on:click={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      {:else}
        <a href="/login" class="login-button">Login</a>
      {/if}
    </div>
  </div>
</header>

<style>
  .dashboard-header {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  
  .user-menu {
    display: flex;
    align-items: center;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    position: relative;
  }
  
  .user-name {
    margin-right: 0.5rem;
    font-weight: 500;
  }
  
  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background-color: #4a90e2;
    color: white;
    border-radius: 50%;
    font-weight: 600;
  }
  
  .dropdown {
    position: relative;
  }
  
  .dropdown-toggle {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }
  
  .caret {
    font-size: 0.75rem;
    margin-left: 0.25rem;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    padding: 0.5rem 0;
    min-width: 10rem;
    display: none;
  }
  
  .dropdown:hover .dropdown-menu {
    display: block;
  }
  
  .dropdown-menu a,
  .dropdown-menu button {
    display: block;
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: #333;
    text-align: left;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .dropdown-menu a:hover,
  .dropdown-menu button:hover {
    background-color: #f5f5f5;
  }
  
  .login-button {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #4a90e2;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
  }
  
  .login-button:hover {
    background-color: #3a80d2;
  }
</style>