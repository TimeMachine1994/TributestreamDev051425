<script lang="ts">
  export let tribute: {
    slug: string;
    loved_one_name: string;
    created_at: string; 
    // Add other fields you might want to display, e.g., description, image_url
  };

  // Helper to format date if needed
  const formattedDate = new Date(tribute.created_at).toLocaleDateString();
</script>

<a 
  href={`/celebration-of-life-for-${tribute.slug}`} 
  class="block p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 ease-in-out border border-gray-700 hover:border-brand-gold"
>
  <h3 class="text-xl font-semibold text-brand-gold mb-2">{tribute.loved_one_name}</h3>
  <!-- Add other details like description if available -->
  <!-- <p class="text-gray-300 text-sm mb-3">A brief description here...</p> -->
  <p class="text-sm text-gray-400">Created: {formattedDate}</p>
</a>