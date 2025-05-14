<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import PageBackground from '$lib/components/ui/PageBackground.svelte';
  import { page } from '$app/stores';

  let { title, metaDescription = '' } = $props();
  
  // Extract the current route path to determine which background to use
  let currentPath = $derived($page.url.pathname);
  let pageVariant = $derived(currentPath === '/'
    ? 'home'
    : currentPath.substring(1).replace(/\/.+$/, ''));
</script>

<svelte:head>
  <title>{title} | Tributestream</title>
  <meta name="description" content={metaDescription} />
</svelte:head>

<div class="min-h-screen text-white relative">
  <PageBackground variant={pageVariant} />
  <!-- Header is handled by the global layout -->
  
  <main class="container mx-auto px-4 py-16 max-w-6xl">
    <h1 class="text-4xl md:text-5xl font-bold mb-8 text-[#D4AF37]">{title}</h1>
    
    <div class="page-content">
      <slot />
    </div>
  </main>
  
  <!-- Footer is handled by the global layout -->
</div>

<style>
  :global(.gold-accent) {
    color: #D4AF37;
  }
  
  :global(.gold-btn) {
    background-color: #D4AF37;
    color: #000000;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  :global(.gold-btn:hover) {
    box-shadow: 0 0 10px 2px #D4AF37;
  }
  
  :global(.content-section) {
    margin-bottom: 4rem;
  }
  
  :global(.section-title) {
    color: #D4AF37;
    font-size: 1.875rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }
</style>