<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import PageBackground from '$lib/components/ui/PageBackground.svelte';
  import { page } from '$app/stores';

  let { title, metaDescription = '', children } = $props();
  
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
    <h1 class="text-4xl md:text-5xl font-bold mb-8 text-brand-gold">{title}</h1>
    
    <div class="page-content">
      {@render children()}
    </div>
  </main>
  
  <!-- Footer is handled by the global layout -->
</div>
