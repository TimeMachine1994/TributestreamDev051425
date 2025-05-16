<script lang="ts">
  import LoginForm from '$lib/components/auth/login-form.svelte';
  import ForgotPassword from '$lib/components/auth/forgot-password.svelte';
  import ContributorPortal from '$lib/components/dashboard/ContributorPortal.svelte';
  import FuneralDirectorPortal from '$lib/components/dashboard/FuneralDirectorPortal.svelte';
  import FamilyContactPortal from '$lib/components/dashboard/FamilyContactPortal.svelte';
  import ProducerPortal from '$lib/components/dashboard/ProducerPortal.svelte';
  import PageBackground from '$lib/components/ui/PageBackground.svelte';
  import type { Tribute } from '$lib/types/tribute';
  import type { SuperValidated } from 'sveltekit-superforms';
  
  interface PageData {
    user: { id: string; name: string; email: string; role: string } | null;
    tributes: Tribute[];
    loginForm: SuperValidated<Record<string, unknown>>;
    resetForm: SuperValidated<Record<string, unknown>>;
  }
  
  let { data } = $props<{ data: PageData }>();
  
  // State
  let showForgotPassword = $state(false);
  
  // Toggle between login and forgot password forms
  function toggleForgotPassword() {
    showForgotPassword = !showForgotPassword;
  }
</script>

<svelte:head>
  <title>{data.user ? 'My Tributes' : 'Login'} | Tributestream</title>
  <meta name="description" content="Access your Tributestream account and manage your tributes." />
</svelte:head>

<!-- Add the PageBackground component with my-portal variant -->
<PageBackground variant="my-portal" opacity={0.95} />

<!-- Add a decorative gradient overlay -->
<div class="fixed inset-0 -z-5 bg-gradient-to-tr from-blue-900/20 via-transparent to-indigo-900/20"></div>

<div class="container min-h-screen px-4 py-16 mx-auto flex flex-col items-center justify-center relative z-10">
  <div class="max-w-4xl w-full">
    {#if data.user}
      <!-- Authenticated user view -->
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
            <ContributorPortal />
          {:else if data.user.role === 'funeral-director'}
            <FuneralDirectorPortal />
          {:else if data.user.role === 'family-contact'}
            <FamilyContactPortal />
          {:else if data.user.role === 'producer'}
            <ProducerPortal />
          {:else}
            <p class="text-red-600">Unknown role: {data.user.role}</p>
          {/if}
        </div>
      </div>
    {:else}
      <!-- Unauthenticated user view -->
      <div class="bg-surface-100/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-blue-900/20">
        <div class="p-6 md:p-8 bg-gradient-to-b from-transparent to-blue-50/30">
          <h1 class="text-3xl md:text-4xl font-bold mb-6 text-center" style="color: black;">
            {showForgotPassword ? 'Reset Your Password' : 'My Portal'}
          </h1>
          
          {#if showForgotPassword}
            <ForgotPassword form={data.resetForm} onCancel={toggleForgotPassword} />
          {:else}
            <div class="mb-6 text-center">
              <p class="text-surface-950">
                Log in to access your tributes and manage your account.
              </p>
            </div>
            
            <LoginForm form={data.loginForm} />
            
            <div class="mt-8 text-center">
              <button
                type="button"
                class="btn preset-filled-primary-500"
                on:click={toggleForgotPassword}
              >
                Forgot your password?
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>