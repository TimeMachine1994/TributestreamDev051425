<script lang="ts">
  import ContributorPortal from '$lib/components/dashboard/ContributorPortal.svelte';
  import FuneralDirectorPortal from '$lib/components/dashboard/FuneralDirectorPortal.svelte';
  import FamilyContactPortal from '$lib/components/dashboard/FamilyContactPortal.svelte';
  import ProducerPortal from '$lib/components/dashboard/ProducerPortal.svelte';
  import PageBackground from '$lib/components/ui/PageBackground.svelte';
  import type { Tribute } from '$lib/server/types';

  interface PageData {
    user: { id: string; name: string; email: string; role: string };
    tributes: Tribute[];
  }

  let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
  <title>{data.user ? 'My Tributes' : 'Login'} | Tributestream</title>
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
            Welcome back, <span class="font-medium text-surface-950">{data.user.name}</span>.
            Here are the tributes associated with your account.
          </p>
        </div>

        {#if data.user.role === 'contributor'}
          <ContributorPortal tributes={data.tributes} />
        {:else if data.user.role === 'funeral-director'}
          <FuneralDirectorPortal tributes={data.tributes} />
        {:else if data.user.role === 'family-contact'}
          <FamilyContactPortal tributes={data.tributes} />
        {:else if data.user.role === 'producer'}
          <ProducerPortal tributes={data.tributes} />
        {:else}
          <p class="text-red-600">Unknown role: {data.user.role}</p>
        {/if}
      </div>
    </div>
  </div>
</div>