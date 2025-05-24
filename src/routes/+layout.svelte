<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/global/Header.svelte';
	import Footer from '$lib/components/global/Footer.svelte';
	let { children } = $props();
</script>
<div class="flex flex-col min-h-screen">
  <Header />

  <main class="flex-grow">
    {@render children()}
  </main>

  <Footer />
</div>