<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  let error: string | null = null;
</script>

<svelte:head>
  <title>Register | TributeStream</title>
  <meta name="description" content="Create your TributeStream account" />
</svelte:head>

<div class="register-container">
  <div class="register-card">
    <h1>Create Account</h1>

    <form method="POST" action="/api/auth/register" use:enhance={({ result }) => {
      if (result.type === 'success') {
        goto('/my-portal');
      } else if (result.type === 'failure') {
        error = result.data?.message || 'Registration failed';
      }
    }}>
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          required
          placeholder="Choose a username"
          autocomplete="username"
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Enter your email"
          autocomplete="email"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Create a password"
          autocomplete="new-password"
        />
      </div>

      <button type="submit" class="register-button">Register</button>
    </form>

    <div class="links">
      <a href="/login">Already have an account? Log in</a>
    </div>
  </div>
</div>

<style>
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
    background-color: #f5f5f5;
  }

  .register-card {
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

  .register-button {
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

  .register-button:hover {
    background-color: #3a80d2;
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
    margin-top: 1.5rem;
    font-size: 0.9rem;
    text-align: center;
  }

  .links a {
    color: #4a90e2;
    text-decoration: none;
  }

  .links a:hover {
    text-decoration: underline;
  }
</style>