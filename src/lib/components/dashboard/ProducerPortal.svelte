<script lang="ts">
  import type { Tribute } from '$lib/types/tribute';
  import TributeList from '$lib/components/tributes/tribute-grid.svelte';
  export let tributes: Tribute[];
  console.log("🎬 ProducerPortal loaded");
</script>

<div class="p-4">
  <h2 class="text-2xl font-bold text-primary">Producer Portal</h2>
  <p>Welcome to the Producer Portal. This is a placeholder component.</p>
  <section class="mt-6">
    <h2 class="text-xl font-semibold mb-4">Your Tributes</h2>
    <TributeList tributes={tributes} />
  </section>
</div>