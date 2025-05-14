<script lang="ts">
  import TributeCard from './tribute-card.svelte';
  import type { Tribute } from '$lib/types/tribute';

  // Props
  let { tributes, isLoading } = $props<{
    tributes: Tribute[];
    isLoading?: boolean;
  }>();

  // Default value for isLoading
  isLoading = isLoading ?? false;
</script>

<div class="w-full">
  {#if isLoading}
    <div class="flex flex-col items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-muted-foreground">Loading tributes...</p>
    </div>
  {:else if tributes.length === 0}
    <div class="bg-card rounded-lg shadow p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto text-muted-foreground mb-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
      <h3 class="text-xl font-semibold mb-2">No tributes found</h3>
      <p class="text-muted-foreground">You don't have any tributes associated with your account yet.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each tributes as tribute, index (tribute.id ?? index)}
        <TributeCard {tribute} />
      {/each}
    </div>
  {/if}
</div>