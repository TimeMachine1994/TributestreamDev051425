<script lang="ts">
	import TributeForm from '$lib/components/tributes/tribute-form.svelte';
	import type { Tribute } from '$lib/types/tribute';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let tribute: Tribute | null = null;
	let loading = true;
	let error = '';
	let successMessage = '';
	let errorMessage = '';

	onMount(() => {
		try {
			tribute = $page.data.tribute;
			console.log('📝 Editing tribute:', tribute);
			if (!tribute) {
				throw new Error('Tribute not found');
			}
		} catch (err) {
			console.error('❌ Failed to load tribute:', err);
			error = 'Failed to load tribute. Please try again.';
		} finally {
			loading = false;
		}
	});

	async function handleSubmit(updatedData: Partial<Tribute>) {
		console.log('📤 Submitting updated tribute data:', updatedData);

		try {
			const response = await fetch(`/api/tributes/${tribute!.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(updatedData)
			});

			if (!response.ok) {
				throw new Error(`Failed to update tribute: ${response.statusText}`);
			}

			console.log('✅ Tribute updated successfully!');
			successMessage = 'Tribute updated successfully!';
		} catch (err) {
			console.error('❌ Error updating tribute:', err);
			errorMessage = 'Failed to update tribute. Please try again.';
		}
	}
</script>

<h1>Edit Tribute</h1>
<a href="/my-portal/admin/tributes">← Back to list</a>

{#if loading}
	<p>⏳ Loading tribute...</p>
{:else if error}
	<p style="color: red;">❌ {error}</p>
{:else}
	{#if successMessage}
		<p style="color: green;">✅ {successMessage}</p>
	{/if}
	{#if errorMessage}
		<p style="color: red;">❌ {errorMessage}</p>
	{/if}
	<TributeForm {tribute} on:submit={e => handleSubmit(e.detail)} />
{/if}