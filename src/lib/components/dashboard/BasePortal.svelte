<script lang="ts">
  import type { Tribute } from '$lib/types/tribute';
  import TributeGrid from '$lib/components/tributes/tribute-grid.svelte';
  import type { Snippet } from 'svelte';

  const {
    tributes = [],
    header,
    actions
  } = $props<{
    tributes: Tribute[],
    header?: Snippet,
    actions?: Snippet
  }>();
</script>

<div class="base-portal">
  {#if header}
    {@render header()}
  {:else}
    <h2 class="text-xl font-semibold mb-4">Your Tributes</h2>
  {/if}

  {#if tributes.length > 0}
    <TributeGrid {tributes} />
  {:else}
    <p>You don't have any tributes associated with your account.</p>
  {/if}

  {#if actions}
    {@render actions()}
  {/if}
</div>