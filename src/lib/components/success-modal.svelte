<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { goto } from '$app/navigation';
  
  export let show = false;
  export let title = "Success";
  export let message = "Your request has been processed successfully.";
  export let redirectUrl = "/";
  
  // For accessibility - trap focus within modal when open
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  
  let modalElement: HTMLDivElement;
  let closeButton: HTMLButtonElement;
  
  // Handle keyboard events for accessibility
  function handleKeydown(event: KeyboardEvent) {
    if (!show) return;
    
    // Close on escape key
    if (event.key === 'Escape') {
      handleClose();
    }
  }
  
  // Focus the close button when modal opens
  $: if (show && closeButton) {
    tick().then(() => {
      closeButton.focus();
    });
  }
  
  function handleClose() {
    show = false;
    // Redirect to the homepage after closing
    goto(redirectUrl);
  }
  
  onMount(() => {
    // Add global keydown listener
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      // Clean up listener on component destroy
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<svelte:head>
  {#if show}
    <!-- Prevent scrolling when modal is open -->
    <style>
      body {
        overflow: hidden;
      }
    </style>
  {/if}
</svelte:head>

{#if show}
  <!-- Modal backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    transition:fade={{ duration: 200 }}
    on:click={handleClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    bind:this={modalElement}
  >
    <!-- Modal content -->
    <div 
      class="bg-zinc-900 rounded-lg border border-[#D4AF37]/30 p-6 max-w-md w-full mx-4"
      transition:scale={{ duration: 200, start: 0.95 }}
      on:click|stopPropagation
    >
      <!-- Modal header -->
      <div class="flex justify-between items-center mb-4">
        <h2 id="modal-title" class="text-2xl text-[#D4AF37] font-semibold">{title}</h2>
        <button 
          class="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800"
          on:click={handleClose}
          aria-label="Close modal"
          bind:this={closeButton}
        >
          ×
        </button>
      </div>
      
      <!-- Modal body -->
      <div class="mb-6">
        <p class="text-white">{message}</p>
      </div>
      
      <!-- Modal footer -->
      <div class="flex justify-end">
        <button 
          class="bg-[#D4AF37] hover:bg-[#C09F27] text-black font-medium py-2 px-4 rounded transition-colors"
          on:click={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}