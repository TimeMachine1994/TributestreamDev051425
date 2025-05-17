<script>
	let { user } = $props();
</script>

<div class="admin-portal">
	<h1>Welcome, Admin {user?.fullName || user?.username}</h1>
	<p>This is the admin interface. Here you can manage users, content, and settings.</p>

	<!-- Placeholder for future admin tools -->
	<ul>
		<li>🔧 Manage Users</li>
		<li>📝 Review Content</li>
		<li>⚙️ Site Settings</li>
	</ul>
</div>

<style>
	.admin-portal {
		padding: 2rem;
		background-color: #f9f9f9;
		border-radius: 8px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}
	h1 {
		margin-bottom: 1rem;
	}
	ul {
		margin-top: 1rem;
		list-style: none;
		padding-left: 0;
	}
	li {
		margin-bottom: 0.5rem;
	}
</style>