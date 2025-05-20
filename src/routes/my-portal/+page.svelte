<script lang="ts">
  import AdminPortal from '$lib/components/dashboard/AdminPortal.svelte';
  import ContributorPortal from '$lib/components/dashboard/ContributorPortal.svelte';
  import FuneralDirectorPortal from '$lib/components/dashboard/FuneralDirectorPortal.svelte';
  import FamilyContactPortal from '$lib/components/dashboard/FamilyContactPortal.svelte';
  import ProducerPortal from '$lib/components/dashboard/ProducerPortal.svelte';
  import PageBackground from '$lib/components/ui/PageBackground.svelte';
  import type { Tribute } from '$lib/types/tribute';

  interface PageData {
    user: { id: string; name: string; email: string; role: string };
    tributes: Tribute[];
  }

  let { data } = $props<{ data: PageData }>();
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

          <form method="POST" action="?/logout">
            <button
              type="submit"
              class="btn preset-filled-primary-500"
            >
              Log Out
            </button>
          </form>
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
          {#if data?.user?.role?.type === 'admin'}
            <AdminPortal user={data.user} tributes={data.tributes} />
          {:else if data?.user?.role?.type === 'contributor'}
            <ContributorPortal tributes={data.tributes} />
          {:else if data?.user?.role?.type === 'funeral-director'}
            <FuneralDirectorPortal tributes={data.tributes} />
          {:else if data?.user?.role?.type === 'family-contact'}
            <FamilyContactPortal tributes={data.tributes} />
          {:else if data?.user?.role?.type === 'producer'}
            <ProducerPortal tributes={data.tributes} />
          {:else if data?.user}
            <p class="text-red-600">Unknown role: {JSON.stringify(data.user.role)}</p>
          {:else}
            <p class="text-red-600">No user data available.</p>
          {/if}

          {#snippet failed(error, reset)}
            <div class="text-red-700 bg-red-100 border border-red-300 p-4 rounded">
              <p class="font-semibold">Something went wrong loading your portal.</p>
              <p class="text-sm mt-2">{error.message}</p>
              <button class="btn mt-4" onclick={reset}>Try again</button>
            </div>
          {/snippet}
        </svelte:boundary>
      </div>
    </div>
  </div>
</div>