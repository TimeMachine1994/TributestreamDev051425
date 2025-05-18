<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import TributeCard from '$lib/components/tributes/tribute-card.svelte';

	let tributes = page.data.tributes;
	let initialQuery = page.data.q ?? '';
	let q = $state(initialQuery);
	let timeout;

	$effect(() => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			const params = new URLSearchParams();
			if (q.trim()) params.set('q', q.trim());
			goto(`/my-portal/tributes?${params.toString()}`);
		}, 300);
	});
</script>

<h1>Tribute Admin Listing</h1>

<input
	type="search"
	placeholder="Search tributes..."
	bind:value={q}
/>

{#if tributes.length === 0}
	<p>No tributes found.</p>
{:else}
	<div class="tribute-list">
		{#each tributes as tribute}
			<div class="tribute-entry">
				<TributeCard {tribute} />
				<a class="edit-button" href={`/my-portal/admin/tributes/edit-tribute-${tribute.id}`}>Edit</a>
			</div>
		{/each}
	</div>
{/if}

<style>
	.tribute-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}
	.tribute-entry {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
	}
	.edit-button {
		background: #0077cc;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		text-decoration: none;
	}
</style>