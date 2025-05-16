import {
	createTribute as apiCreate,
	getTributeById as apiGetById,
	getTributeBySlug as apiGetBySlug,
	updateTribute as apiUpdate,
	deleteTribute as apiDelete,
	searchTributes as apiSearch
} from '$lib/server/strapi/tribute';
import type { Tribute } from '$lib/server/types';

let currentTribute = $state<Tribute | null>(null);
let tributes = $state<Tribute[]>([]);
let isLoading = $state(false);
let error = $state<string | null>(null);
let currentPage = $state(1);
let totalPages = $state(1);
let totalItems = $state(0);

let hasError = $derived(() => !!error);
let isEmpty = $derived(() => tributes.length === 0);
let isLastPage = $derived(() => currentPage >= totalPages);

export async function fetchTribute(id: string | number) {
	console.log('📥 Fetching tribute by ID:', id);
	isLoading = true;
	error = null;
	try {
		currentTribute = await apiGetById(id);
	} catch (err) {
		console.error('❌ Error fetching tribute by ID:', err);
		error = 'Failed to fetch tribute.';
	} finally {
		isLoading = false;
	}
}

export async function fetchTributeBySlug(slug: string) {
	console.log('📥 Fetching tribute by slug:', slug);
	isLoading = true;
	error = null;
	try {
		currentTribute = await apiGetBySlug(slug);
	} catch (err) {
		console.error('❌ Error fetching tribute by slug:', err);
		error = 'Failed to fetch tribute.';
	} finally {
		isLoading = false;
	}
}

export async function searchTributes(query = '', page = 1, pageSize = 10) {
	console.log('🔍 Searching tributes...', { query, page });
	isLoading = true;
	error = null;
	try {
		const { items, meta } = await apiSearch({ query, page, pageSize });
		tributes = items;
		currentPage = meta.pagination.page;
		totalPages = meta.pagination.pageCount;
		totalItems = meta.pagination.total;
	} catch (err) {
		console.error('❌ Error searching tributes:', err);
		error = 'Failed to search tributes.';
	} finally {
		isLoading = false;
	}
}

export async function createTribute(data: Partial<Tribute>) {
	console.log('🆕 Creating tribute...', data);
	isLoading = true;
	error = null;
	try {
		const created = await apiCreate(data);
		currentTribute = created;
		return created;
	} catch (err) {
		console.error('❌ Error creating tribute:', err);
		error = 'Failed to create tribute.';
		throw err;
	} finally {
		isLoading = false;
	}
}

export async function updateTribute(id: string | number, data: Partial<Tribute>) {
	console.log('✏️ Updating tribute...', id);
	isLoading = true;
	error = null;
	try {
		const updated = await apiUpdate(id, data);
		currentTribute = updated;
		return updated;
	} catch (err) {
		console.error('❌ Error updating tribute:', err);
		error = 'Failed to update tribute.';
		throw err;
	} finally {
		isLoading = false;
	}
}

export async function deleteTribute(id: string | number) {
	console.log('🗑️ Deleting tribute...', id);
	isLoading = true;
	error = null;
	try {
		await apiDelete(id);
		currentTribute = null;
	} catch (err) {
		console.error('❌ Error deleting tribute:', err);
		error = 'Failed to delete tribute.';
		throw err;
	} finally {
		isLoading = false;
	}
}

export function resetStore() {
	console.log('🔄 Resetting tribute store...');
	currentTribute = null;
	tributes = [];
	isLoading = false;
	error = null;
	currentPage = 1;
	totalPages = 1;
	totalItems = 0;
}