<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { slide } from 'svelte/transition';

	/** --- types --------------------------------------------------- */
	type Status = 'draft' | 'published' | 'archived';
	interface Tribute {
		id: number;
		name: string;
		description: string;
		slug: string;
		status: Status;
		createdAt: string;
		updatedAt: string;
	}

	/** --- state ---------------------------------------------------- */
	const tributes      = writable<Tribute[]>([]);
	const search        = writable('');
	const filtered      = derived([tributes, search], ([$t, $s]) =>
		$t
			.filter(tr => tr.name.toLowerCase().includes($s.toLowerCase()))
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	let selected: Tribute | null = null;
	let form: Partial<Tribute>   = {};

	/** --- init ----------------------------------------------------- */
	onMount(async () => {
		const res = await fetch('/api/tributes');
		if (res.ok) {
			const { data } = await res.json();   // adjust to your Strapi shape
			tributes.set(data);
		}
	});

	/** --- ui handlers --------------------------------------------- */
	function open(tr: Tribute) {
		selected = tr;
		form     = { ...tr };
	}

	function close() {
		selected = null;
	}

	async function save() {
		if (!selected) return;
		const res = await fetch(`/api/tributes/${selected.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ data: form })
		});
		if (res.ok) {
			const { data } = await res.json();
			tributes.update(list => list.map(t => (t.id === data.id ? data : t)));
			close();
		} else {
			console.error('Failed to update tribute');
		}
	}
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
				class="mt-2 w-full rounded border-gray-300 focus:ring-0 focus:border-indigo-500"
				bind:value={$search} />
		</header>

		<ul class="flex-1 overflow-y-auto divide-y divide-gray-200">
			{#each $filtered as tr}
				<li
					class="p-4 hover:bg-gray-100 cursor-pointer"
					on:click={() => open(tr)}>
					<div class="font-medium">{tr.name}</div>
					<div class="text-sm text-gray-500">{tr.status} • {new Date(tr.createdAt).toLocaleDateString()}</div>
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
					<h2 class="text-lg font-semibold">Edit {selected.name}</h2>
					<button class="text-gray-400 hover:text-gray-600" on:click={close}>✕</button>
				</div>

				<form class="space-y-4" on:submit|preventDefault={save}>
					<!-- name -->
					<div>
						<label class="block text-sm font-medium mb-1">Name</label>
						<input
							class="w-full rounded border-gray-300 focus:ring-0 focus:border-indigo-500"
							bind:value={form.name} required />
					</div>
					<!-- description -->
					<div>
						<label class="block text-sm font-medium mb-1">Description</label>
						<textarea
							class="w-full rounded border-gray-300 focus:ring-0 focus:border-indigo-500 h-28"
							bind:value={form.description} />
					</div>
					<!-- status -->
					<div>
						<label class="block text-sm font-medium mb-1">Status</label>
						<select
							class="w-full rounded border-gray-300 focus:ring-0 focus:border-indigo-500"
							bind:value={form.status}>
							<option value="draft">Draft</option>
							<option value="published">Published</option>
							<option value="archived">Archived</option>
						</select>
					</div>

					<button
						type="submit"
						class="w-full py-2 px-4 rounded bg-indigo-600 text-white hover:bg-indigo-700">
						Save
					</button>
				</form>
			</div>
		</div>
	{/if}
</div>
