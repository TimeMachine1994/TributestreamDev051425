import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { checkAuthStatus, loginUser, logoutUser } from '$lib/utils/auth-helpers';

export let $state user = null;
export let $state loading = false;
export let $state error = null;

export let $derived isLoggedIn = !!user;

export async function login(credentials) {
	console.log('🔐 Logging in...');
	loading = true;
	error = null;
	try {
		const userData = await loginUser(credentials);
		user = userData;
		console.log('✅ Login successful:', userData);
		goto('/my-portal');
	} catch (err) {
		console.error('❌ Login failed:', err);
		error = err.message || 'Login failed';
	} finally {
		loading = false;
	}
}

export async function logout() {
	console.log('👋 Logging out...');
	loading = true;
	try {
		await logoutUser();
		user = null;
		console.log('✅ Logout successful');
		goto('/');
	} catch (err) {
		console.error('❌ Logout failed:', err);
		error = err.message || 'Logout failed';
	} finally {
		loading = false;
	}
}

export async function checkAuth() {
	if (!browser) return;
	console.log('🔍 Checking auth...');
	loading = true;
	try {
		const userData = await checkAuthStatus();
		user = userData;
		console.log('✅ Auth check passed:', userData);
	} catch (err) {
		console.warn('⚠️ Auth check failed:', err);
		user = null;
	} finally {
		loading = false;
	}
}