<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import { enhance } from '$app/forms'; // For progressive enhancement
	// import { page } from '$app/stores'; // Not strictly needed if enhance callback handles all UI updates

	/** --- types --------------------------------------------------- */
	type Status = 'draft' | 'published' | 'archived';

	// Define the shape of the attributes object
	interface TributeAttributes {
		name: string;
		description?: string; // Optional
		slug: string;
		status: Status;
		createdAt: string;
		updatedAt: string;
		// Add any other attributes that might be present
	}

	// Define the main Tribute type, expecting an attributes object
	interface Tribute {
		id: number;
		attributes?: TributeAttributes; // Make attributes optional to handle the logged data
	}

	/** --- state ---------------------------------------------------- */
	export let tributes: Tribute[] = []; // Default empty array (for type safety)
	export let user: { id: string; name: string; email: string; role: string };
	const tributesStore = writable<Tribute[]>(tributes);

	// Update store when props change
	$: {
		console.log('🎭 AdminPortal: tributes prop changed', tributes);
		tributesStore.set(tributes);
	}

	// Log filtered tributes
	$: console.log('🔍 AdminPortal: filtered tributes', $filtered);
	const search        = writable('');
	const filtered      = derived([tributesStore, search], ([$t, $s]) =>
		$t
			.filter(tr => 
				tr.attributes && // Check if attributes exists
				typeof tr.attributes.name === 'string' && 
				tr.attributes.name.toLowerCase().includes($s.toLowerCase())
			)
			.sort((a, b) => {
				const nameA = a.attributes?.name || ''; // Use optional chaining
				const nameB = b.attributes?.name || ''; // Use optional chaining
				return nameA.localeCompare(nameB);
			})
	);

	let selected: Tribute | null = null;
	// Form should represent the editable fields, which are the attributes
	let form: Partial<TributeAttributes> = {}; 
	let formProcessing = false; // To disable button during submission
	let formError: string | null = null;

	/** --- init ----------------------------------------------------- */
	// removed fetch call; tributes are passed in as props

	/** --- ui handlers --------------------------------------------- */
	function open(tr: Tribute) {
		selected = tr;
		// Populate form from attributes if they exist, otherwise use defaults or empty
		form = tr.attributes ? { ...tr.attributes } : { name: '', slug: '', status: 'draft', createdAt: '', updatedAt: '' };
		formError = null; // Clear previous errors
		formProcessing = false; // Reset processing state
	}

	function close() {
		selected = null;
		formError = null;
		formProcessing = false;
	}

	// The save function is effectively handled by use:enhance now,
	// but we can keep it if there's any pre-submit client-side validation
	// or logic that doesn't fit into the enhance callback directly.
	// For this refactor, we'll rely on use:enhance.
	// async function save() {
	// }
</script>

<!-- ---------- page ------------------------------------------------ -->
<div class="h-screen flex overflow-hidden bg-gray-50">
	<!-- left column : list -->
	<div class="flex-1 flex flex-col">
		<header class="p-4 border-b bg-white">
			<h1 class="text-xl font-semibold">Tributes</h1>
			<input
				type="text"
				placeholder="Search…"
				class="mt-2 w-full rounded border-gray-300 focus:ring-0 focus:border-primary"
				bind:value={$search} />
		</header>

		<ul class="flex-1 overflow-y-auto divide-y divide-gray-200">
			{#each $filtered as tr}
				<li
					class="p-4 hover:bg-gray-100 cursor-pointer"
					on:click={() => open(tr)}>
					<div class="font-medium">{tr.attributes?.name || 'Unnamed Tribute'}</div>
					<div class="text-sm text-gray-500">{tr.attributes?.status || 'unknown'} • {tr.attributes?.createdAt ? new Date(tr.attributes.createdAt).toLocaleDateString() : 'N/A'}</div>
				</li>
			{/each}
			{#if !$filtered.length}
				<li class="p-4 text-gray-500">No tributes match.</li>
			{/if}
		</ul>
	</div>

	<!-- right column : slide-out editor -->
	{#if selected}
		<div
			class="fixed inset-0 bg-black/30 z-40"
			on:click|self={close} />
		<div
			class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
			transition:slide>
			<div class="p-6 space-y-6">
				<div class="flex justify-between items-start">
					<h2 class="text-lg font-semibold">Edit {selected.attributes?.name || 'Tribute'}</h2>
					<button class="text-gray-400 hover:text-gray-600" on:click={close}>✕</button>
				</div>

				<form
					method="POST"
					action="?/updateTribute"
					use:enhance={() => {
						formProcessing = true;
						formError = null;
						return async ({ result }) => {
							if (result.type === 'success' && result.data && result.data.updatedTribute) {
								// result.data.updatedTribute from server is already { id, attributes }
								const updatedTributeFromServer = result.data.updatedTribute as Tribute; 
								tributesStore.update(currentTributes =>
									currentTributes.map(t => t.id === updatedTributeFromServer.id ? updatedTributeFromServer : t)
								);
								close();
							} else if (result.type === 'failure' && result.data) {
								formError = typeof result.data.message === 'string' ? result.data.message : 'Failed to save tribute.';
							} else if (result.type === 'error' && result.error) {
								formError = result.error.message || 'An unexpected error occurred.';
							} else {
								formError = 'An unknown error occurred during save.';
							}
							formProcessing = false;
						};
					}}
					class="space-y-4">
					<input type="hidden" name="id" value={selected?.id} />
					<!-- name: Bind to form.name, which is now part of Partial<TributeAttributes> -->
					<div>
						<label class="block text-sm font-medium mb-1" for="name-{selected?.id}">Name</label>
						<input
							id="name-{selected?.id}"
							name="name"
							class="w-full rounded border-gray-300 focus:ring-0 focus:border-primary"
							bind:value={form.name}
							required />
					</div>
					<!-- description: Bind to form.description -->
					<div>
						<label class="block text-sm font-medium mb-1" for="description-{selected?.id}">Description</label>
						<textarea
							id="description-{selected?.id}"
							name="description"
							class="w-full rounded border-gray-300 focus:ring-0 focus:border-primary h-28"
							bind:value={form.description} />
					</div>
					<!-- status: Bind to form.status -->
					<div>
						<label class="block text-sm font-medium mb-1" for="status-{selected?.id}">Status</label>
						<select
							id="status-{selected?.id}"
							name="status"
							class="w-full rounded border-gray-300 focus:ring-0 focus:border-primary"
							bind:value={form.status}>
							<option value="draft">Draft</option>
							<option value="published">Published</option>
							<option value="archived">Archived</option>
						</select>
					</div>

					{#if formError}
						<p class="text-red-500 text-sm">{formError}</p>
					{/if}

					<button
						type="submit"
						class="w-full py-2 px-4 rounded bg-primary text-white hover:bg-primary disabled:opacity-50"
						disabled={formProcessing}>
						{formProcessing ? 'Saving...' : 'Save'}
					</button>
				</form>
			</div>
		</div>
	{/if}
</div>
