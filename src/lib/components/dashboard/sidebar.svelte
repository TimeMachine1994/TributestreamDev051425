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

<aside class="bg-slate-800 text-white w-[60px] md:w-[250px] h-full fixed top-0 left-0 pt-16 flex flex-col justify-between z-50">
  <nav class="flex-grow">
    <ul class="list-none p-0 m-0">
      {#each navItems as item}
        <li>
          <a 
            href={item.href} 
            class="flex items-center px-4 md:px-6 py-4 text-slate-300 no-underline transition-all duration-200 ease-linear hover:bg-white/10 hover:text-white md:justify-start justify-center {item.active($page.url.pathname) ? 'bg-white/20 text-white border-l-4 border-primary' : ''}"
          >
            <span class="text-xl w-6 text-center md:mr-3">{item.icon}</span>
            <span class="hidden md:inline">{item.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  
  <div class="p-4 border-t border-white/10">
    <a href="/" class="flex items-center p-3 text-slate-300 no-underline rounded transition-all duration-200 ease-linear hover:bg-white/10 hover:text-white md:justify-start justify-center">
      <span class="text-xl w-6 text-center md:mr-3">🏠</span>
      <span class="hidden md:inline">Back to Site</span>
    </a>
  </div>
</aside>