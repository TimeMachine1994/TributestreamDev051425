<script lang="ts">
  import { enhance } from '$app/forms';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let { data } = $props<{ data: { error?: string } }>();
  let error = $state<string | null>(data.error ?? null);
</script>

<svelte:head>
  <title>Login | TributeStream</title>
  <meta name="description" content="Log in to your TributeStream account" />
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <h1>Login</h1>

    <form method="POST" use:enhance={({ formData }) => {
      console.log('🚀 Form submitted with:', Object.fromEntries(formData));
      loading = true;

      return async ({ result, update }) => {
        loading = false;
        if (result.type === 'failure') {
          console.log('❌ Login failed:', result);
          error = result.data?.error;
        } else if (result.type === 'redirect') {
          console.log('✅ Login success, redirecting to:', result.location);
          await update(); // Apply the redirect
        } else if (result.type === 'success') {
          // This case is not expected from your current login server action,
          // as it always throws a redirect on successful login.
          console.log('✅ Login success (data returned):', result.data);
          await update();
        } else if (result.type === 'error') {
          console.error('❌ Login error:', result.error);
          error = result.error.message || 'An unexpected error occurred.';
        } else {
          console.log('Login action returned unhandled result type:', result.type);
          await update();
        }
      };
    }}>
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email"
          bind:value={email} 
          disabled={loading}
          placeholder="Enter your email"
          autocomplete="email"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password"
          bind:value={password} 
          disabled={loading}
          placeholder="Enter your password"
          autocomplete="current-password"
          required
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
    min-height: 80vh;
    padding: 1rem;
  }

  .login-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }

  h1 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .login-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4f46e5;
    color: white;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }

  .login-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .links {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
    font-size: 0.875rem;
  }

  .error-message {
    background-color: #fee2e2;
    color: #b91c1c;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
</style>
