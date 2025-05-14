<script lang="ts">
  import { page } from '$app/stores';
  
  // Navigation items
  const navItems = [
    { 
      label: 'Dashboard', 
      href: '/dashboard', 
      icon: '📊',
      active: (path: string) => path === '/dashboard' 
    },
    { 
      label: 'Tributes', 
      href: '/dashboard/tributes', 
      icon: '🕯️',
      active: (path: string) => path.startsWith('/dashboard/tributes') 
    },
    { 
      label: 'Profile', 
      href: '/dashboard/profile', 
      icon: '👤',
      active: (path: string) => path === '/dashboard/profile' 
    }
  ];
</script>

<aside class="dashboard-sidebar">
  <nav>
    <ul>
      {#each navItems as item}
        <li>
          <a 
            href={item.href} 
            class="nav-item {item.active($page.url.pathname) ? 'active' : ''}"
          >
            <span class="icon">{item.icon}</span>
            <span class="label">{item.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  
  <div class="sidebar-footer">
    <a href="/" class="back-to-site">
      <span class="icon">🏠</span>
      <span class="label">Back to Site</span>
    </a>
  </div>
</aside>

<style>
  .dashboard-sidebar {
    background-color: #2c3e50;
    color: white;
    width: 250px;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    padding-top: 4rem; /* Space for header */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 50;
  }
  
  nav {
    flex-grow: 1;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .nav-item.active {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border-left: 4px solid #4a90e2;
  }
  
  .icon {
    margin-right: 0.75rem;
    font-size: 1.25rem;
    width: 1.5rem;
    text-align: center;
  }
  
  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .back-to-site {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .back-to-site:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .dashboard-sidebar {
      width: 60px;
    }
    
    .label {
      display: none;
    }
    
    .icon {
      margin-right: 0;
    }
    
    .nav-item {
      justify-content: center;
      padding: 1rem;
    }
    
    .back-to-site {
      justify-content: center;
    }
  }
</style>