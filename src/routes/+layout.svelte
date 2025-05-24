<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/global/Header.svelte';
	import Footer from '$lib/components/global/Footer.svelte';
	let { children } = $props();
</script>
<Header />
{@render children()}
<Footer />