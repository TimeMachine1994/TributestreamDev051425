<script lang="ts">
  import { authStore } from '$lib/services/auth-service';
  import { goto } from '$app/navigation';
  
  // Form state
  let username = '';
  let password = '';
  let loading = false;
  let error: string | null = null;
  
  // Handle form submission
  async function handleLogin() {
    if (!username || !password) {
      error = 'Please enter both username and password';
      return;
    }
    
    try {
      loading = true;
      error = null;
      
      const success = await authStore.login(username, password);
      
      if (success) {
        // Redirect to tributes page on successful login
        goto('/tributes');
      } else {
        error = 'Login failed. Please check your credentials.';
      }
    } catch (err) {
      console.error('Login error:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Login | TributeStream</title>
  <meta name="description" content="Log in to your TributeStream account" />
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <h1>Login</h1>
    
    <form on:submit|preventDefault={handleLogin}>
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}
      
      <div class="form-group">
        <label for="username">Username</label>
        <input 
          type="text" 
          id="username" 
          bind:value={username} 
          disabled={loading}
          placeholder="Enter your username"
          autocomplete="username"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          disabled={loading}
          placeholder="Enter your password"
          autocomplete="current-password"
        />
      </div>
      
      <button type="submit" class="login-button" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
    
    <div class="links">
      <a href="/forgot-password">Forgot password?</a>
      <a href="/register">Create an account</a>
    </div>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
    background-color: #f5f5f5;
  }
  
  .login-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }
  
  h1 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
  
  .login-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .login-button:hover {
    background-color: #3a80d2;
  }
  
  .login-button:disabled {
    background-color: #a0c0e8;
    cursor: not-allowed;
  }
  
  .error-message {
    background-color: #ffebee;
    color: #e53935;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
  
  .links {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
    font-size: 0.9rem;
  }
  
  .links a {
    color: #4a90e2;
    text-decoration: none;
  }
  
  .links a:hover {
    text-decoration: underline;
  }
</style>