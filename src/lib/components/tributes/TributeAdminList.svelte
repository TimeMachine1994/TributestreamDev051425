<script lang="ts">
	import TributeCard from './tribute-card.svelte';
	let { tributes = [] } = $props();
</script>

<div class="tribute-admin-list">
	{#each tributes as tribute}
		<div class="tribute-entry">
			<TributeCard {tribute} />
			<a class="edit-button" href={`/my-portal/admin/tributes/edit-tribute-${tribute.id}`}>Edit</a>
		</div>
	{/each}
</div>

<style>
	.tribute-admin-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.tribute-entry {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 6px;
	}
	.edit-button {
		background-color: #0077cc;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		text-decoration: none;
	}
	.edit-button:hover {
		background-color: #005fa3;
	}
</style>