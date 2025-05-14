<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>
    {$page.status === 404
      ? 'Page Not Found'
      : `Error ${$page.status}`}
  </title>
</svelte:head>

<div class="container min-h-screen flex items-center justify-center px-4 py-16 mx-auto">
  <div class="max-w-md w-full text-center space-y-8">
    {#if $page.status === 404}
      <div class="text-6xl font-bold text-primary mb-2">404</div>
      <h1 class="text-2xl font-semibold text-foreground">Sorry, please understand we are working to build this.</h1>
      <p class="text-lg text-muted-foreground mt-4">
        Call me if you need anything: <a href="tel:4072215922" class="text-primary hover:underline">407-221-5922</a>
      </p>
    {:else}
      <div class="text-6xl font-bold text-destructive mb-2">{$page.status}</div>
      <h1 class="text-2xl font-semibold text-foreground">Something went wrong</h1>
      <p class="text-lg text-muted-foreground mt-4">{$page.error?.message || 'An unexpected error occurred'}</p>
    {/if}
    
    <div class="mt-8">
      <a
        href="/"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-foreground hover:text-primary transition-colors duration-150"
      >
        Go back home
      </a>
    </div>
  </div>
</div>