<script lang="ts">
  // Define props for customizing the gradient
  let {
    variant = 'default', // default, home, how-it-works, contact, etc.
    opacity = 0.9,
    blur = false
  } = $props();

  // Define gradient variants for different pages
  const gradients: Record<string, string> = {
    default: 'bg-gradient-to-br from-zinc-900 via-black to-zinc-900',
    home: 'bg-gradient-to-br from-zinc-900 via-black to-zinc-800',
    'how-it-works': 'bg-gradient-to-br from-indigo-950 via-black to-zinc-900',
    'contact-us': 'bg-gradient-to-br from-zinc-900 via-black to-purple-950',
    'schedule-now': 'bg-gradient-to-br from-amber-950 via-black to-zinc-900',
    'why-tributestream': 'bg-gradient-to-br from-zinc-900 via-black to-emerald-950',
    'fd-form': 'bg-gradient-to-br from-blue-950 via-black to-zinc-900',
    'my-portal': 'bg-gradient-to-br from-zinc-900 via-black to-blue-950'
  };

  // Get the gradient class based on the variant
  const gradientClass = gradients[variant] || gradients.default;
</script>

<div
  class="fixed inset-0 w-full h-full -z-10 {gradientClass}"
  style="opacity: {opacity};"
  class:blur-sm={blur}
>
  <!-- Removed noise texture as requested -->
</div>

<style>
  /* Styles removed as texture is no longer needed */
</style>