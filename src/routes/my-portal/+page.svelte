<script lang="ts">
  import AdminPortal from '$lib/components/dashboard/AdminPortal.svelte';
  import ContributorPortal from '$lib/components/dashboard/ContributorPortal.svelte';
  import FuneralDirectorPortal from '$lib/components/dashboard/FuneralDirectorPortal.svelte';
  import FamilyContactPortal from '$lib/components/dashboard/FamilyContactPortal.svelte';
  import ProducerPortal from '$lib/components/dashboard/ProducerPortal.svelte';
  import PageBackground from '$lib/components/ui/PageBackground.svelte';
  import type { Tribute } from '$lib/types/tribute';
  import type { User } from '$lib/types/types'; // Import the User type

  // interface PageData { // Commenting out old PageData interface
  //   user: {
  //     id: string;
  //     name: string; // Assuming this 'name' corresponds to User['fullName'] or User['username']
  //     email: string;
  //     role?: User['role']; // Use the role type from the imported User interface
  //   };
  //   tributes: Tribute[];
  // }
  
  // let { data } = $props<{ data: PageData }>(); // Old props definition
  let { data } = $props<{ data: { tributes: Tribute[], user: User | null, error?: string } }>(); // New props definition as per task

  $effect(() => {
    const user = data?.user;
    const userRole = user?.role;
    const userRoleType = userRole?.type;
    console.log('User data on page (from $effect):', JSON.stringify(user, null, 2));
    console.log('User role on page (from $effect):', JSON.stringify(userRole, null, 2));
    console.log('User role type on page (from $effect):', userRoleType);
  });
</script>

<svelte:head>
  <title>{data?.user?.name ? 'My Tributes' : 'Login'} | Tributestream</title>
  <meta name="description" content="Access your Tributestream account and manage your tributes." />
</svelte:head>

<PageBackground variant="my-portal" opacity={0.95} />
<div class="fixed inset-0 -z-5 bg-gradient-to-tr from-blue-900/20 via-transparent to-indigo-900/20"></div>

<div class="container min-h-screen px-4 py-16 mx-auto flex flex-col items-center justify-center relative z-10">
  <div class="max-w-4xl w-full">
    <div class="bg-surface-100/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-blue-900/20">
      <div class="p-6 md:p-8 bg-gradient-to-b from-transparent to-blue-50/30">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold" style="color: #D5BA7F;">
            My Tributes
          </h1>
          <div class="flex items-center space-x-4">
            <a
              href="/my-portal/tributes/create"
              class="btn preset-filled-accent-500"
            >
              Create New Tribute
            </a>
            <form method="POST" action="?/logout">
              <button
                type="submit"
                class="btn preset-filled-primary-500"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>

        <div class="mb-8">
          <p class="text-surface-950">
            {#if data?.user?.name}
              Welcome back, <span class="font-medium text-surface-950">{data.user.name}</span>.
              Here are the tributes associated with your account.
            {:else}
              Welcome to Tributestream.
            {/if}
          </p>
        </div>

        <svelte:boundary>
          {@const user = data?.user}
          {@const userRole = user?.role}
          {@const userRoleType = userRole?.type}
          <!-- Conditional rendering based on role type -->
          {#if userRoleType === 'admin'}
            <AdminPortal user={user} tributes={data.tributes} />
          {:else if userRoleType === 'contributor'}
            <ContributorPortal tributes={data.tributes} />
          {:else if userRoleType === 'funeral_director' || userRoleType === 'funeral-director'}
            <FuneralDirectorPortal tributes={data.tributes} />
          {:else if userRoleType === 'family_contact' || userRoleType === 'family-contact'}
            <FamilyContactPortal tributes={data.tributes} />
          {:else if userRoleType === 'producer'}
            <ProducerPortal tributes={data.tributes} />
          {:else if data?.user}
            <p class="text-red-600">Unknown role: {JSON.stringify(userRole)}</p> <!-- Log the whole role object -->
          {:else}
            <p class="text-red-600">No user data available.</p>
          {/if}

          {#snippet failed(error, reset)}
            {@const errorMessage = error instanceof Error ? error.message : String(error)}
            <div class="text-red-700 bg-red-100 border border-red-300 p-4 rounded">
              <p class="font-semibold">Something went wrong loading your portal.</p>
              <p class="text-sm mt-2">{errorMessage}</p>
              <button class="btn mt-4" onclick={reset}>Try again</button>
            </div>
          {/snippet}
        </svelte:boundary>

        <!-- Section for Displaying Tributes -->
        <div class="mt-10 pt-6 border-t border-surface-200 dark:border-surface-700">
          {#if data.error}
            <p class="error-message">Error loading tributes: {data.error}</p>
          {:else if data.tributes && data.tributes.length > 0}
            <h2 class="text-2xl font-semibold mb-4 text-surface-800 dark:text-surface-200">My Tributes</h2>
            <ul class="tributes-list">
              {#each data.tributes as tribute (tribute.id)}
                <li class="tribute-item">
                  <h3 class="text-lg font-medium text-primary-600 dark:text-primary-400">{tribute.name}</h3>
                  {#if tribute.description}
                    <p class="mt-1 text-sm text-surface-600 dark:text-surface-400">{tribute.description}</p>
                  {/if}
                  <p class="mt-2 text-xs text-surface-500 dark:text-surface-500"><em>Status: {tribute.status}</em></p>
                  <!-- Add more details or links as needed, e.g., a link to view/edit the tribute -->
                </li>
              {/each}
            </ul>
          {:else}
            <p class="no-tributes-prompt">You haven't created any tributes yet. <a href="/my-portal/tributes/create" class="text-accent-600 dark:text-accent-400 hover:underline">Create one now!</a></p>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .error-message {
    @apply p-4 my-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800 border border-red-300 dark:border-red-600;
  }

  .tributes-list {
    @apply list-none p-0 space-y-4 mt-4;
  }

  .tribute-item {
    @apply bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow;
  }

  .tribute-item h3 {
    @apply mb-1; /* Basic spacing, specific text styling is in the template */
  }

  .tribute-item p {
    @apply leading-relaxed; /* Basic typography, specific text styling is in the template */
  }

  .no-tributes-prompt {
    @apply text-center py-8 px-4 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 mt-4;
  }
  .no-tributes-prompt a {
    @apply font-medium; /* Specific text styling is in the template */
  }
</style>