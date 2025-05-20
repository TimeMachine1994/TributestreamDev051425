<script lang="ts">
  import type { Tribute } from '$lib/types/tribute';
  import TributeGrid from '$lib/components/tributes/tribute-grid.svelte';

  const { tributes = [] } = $props<{ tributes: Tribute[] }>();
</script>

<div class="base-portal">
  <slot name="header">
    <h2 class="text-xl font-semibold mb-4">Your Tributes</h2>
  </slot>

  {#if tributes.length > 0}
    <TributeGrid {tributes} />
  {:else}
    <p>You don't have any tributes associated with your account.</p>
  {/if}

  <slot name="actions"></slot>
</div>