<script lang="ts">
	let { placeholder = 'Search...' } = $props();
	let value = $state('');

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		dispatchEvent(new CustomEvent('input', { detail: value }));
	}
</script>

<input
	type="text"
	bind:value
	placeholder={placeholder}
	on:input={handleInput}
	class="search-bar"
/>

<style>
	.search-bar {
		width: 100%;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
</style>