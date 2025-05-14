<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Tribute } from '$lib/types/tribute';

  // Props
  let { tribute } = $props<{
    tribute: Tribute;
  }>();

  // Format date
  function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  // Navigate to tribute page
  function navigateToTribute() {
    if (!tribute.slug) {
      console.warn('Tribute has no slug, cannot navigate');
      return;
    }
    goto(`/celebration-of-life-for-${tribute.slug}`);
  }

  // Use a data URI for the placeholder image to avoid needing an external file
  const placeholderImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22450%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22800%22%20height%3D%22450%22%20fill%3D%22%23e0e0e0%22%2F%3E%3Ccircle%20cx%3D%22400%22%20cy%3D%22175%22%20r%3D%2280%22%20fill%3D%22%23cccccc%22%2F%3E%3Crect%20x%3D%22320%22%20y%3D%22280%22%20width%3D%22160%22%20height%3D%2220%22%20fill%3D%22%23cccccc%22%2F%3E%3Crect%20x%3D%22350%22%20y%3D%22320%22%20width%3D%22100%22%20height%3D%2215%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22225%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23888888%22%3EMemorial%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
  
  // Handle image error - not needed with data URI
  function handleImageError(event: Event) {
    // This is a fallback but shouldn't be needed with a data URI
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = placeholderImage;
  }
</script>

<div 
  class="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
  on:click={navigateToTribute}
  on:keydown={(e) => e.key === 'Enter' && navigateToTribute()}
  tabindex="0"
  role="button"
  aria-label="View tribute for {tribute.loved_one_name}"
>
  <div class="aspect-video bg-muted relative overflow-hidden">
    <!-- Placeholder for tribute image - in a real implementation, this would use the actual image -->
    <img
      src={placeholderImage}
      alt="Memorial for {tribute.loved_one_name}"
      class="w-full h-full object-cover"
      on:error={handleImageError}
    />
  </div>
  
  <div class="p-4">
    <h3 class="text-lg font-semibold text-foreground mb-1 truncate">{tribute.loved_one_name || 'Unnamed Tribute'}</h3>
    
    <div class="flex items-center text-sm text-muted-foreground mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
      <span>{formatDate(tribute.created_at)}</span>
    </div>
    
    <div class="flex justify-between items-center">
      <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
        {tribute.number_of_streams ?? 0} {(tribute.number_of_streams ?? 0) === 1 ? 'Stream' : 'Streams'}
      </span>
      
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-primary">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  </div>
</div>