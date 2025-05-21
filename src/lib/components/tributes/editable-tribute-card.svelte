<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { canEditTribute } from '$lib/utils/tribute-permissions';
  import type { Tribute } from '$lib/types/tribute';

  // Props
  let { tribute } = $props<{
    tribute: Tribute;
  }>();

  // State variables
  let isEditing = $state(false);
  let isSaving = $state(false);
  let error = $state<string | null>(null);
  let nameValue = $state('');
  let descriptionValue = $state('');
  
  // Store initial values for cancel operation
  let originalName = $state('');
  let originalDescription = $state('');

  // Validation state
  let nameError = $derived(nameValue.length < 2 ? "Name must be at least 2 characters" : "");
  let descriptionError = $derived(
    descriptionValue.length > 0 && descriptionValue.length < 10
      ? "Description must be at least 10 characters if provided"
      : descriptionValue.length > 1000
        ? "Description must be less than 1000 characters"
        : ""
  );
  
  // Form validity
  let formIsValid = $derived(!nameError && !descriptionError && nameValue.length > 0);
  
  // Check if the user can edit this tribute
  let canEdit = $derived(() => {
    const user = page.data?.user;
    if (!user || !tribute) return false;
    
    const tributeForPermissionCheck = {
      id: tribute.id || 0,
      attributes: {
        owner: {
          data: {
            id: tribute?.attributes?.owner?.data?.id || 0
          }
        }
      }
    };
    
    return canEditTribute(user, tributeForPermissionCheck);
  });

  // Format date helper function
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
      console.error('🔴 Error formatting date:', error);
      return 'Invalid date';
    }
  }

  // Navigate to tribute page
  function navigateToTribute() {
    if (isEditing) return; // Don't navigate while editing
    
    if (!tribute?.attributes?.slug) {
      console.warn('🟠 Tribute has no slug, cannot navigate');
      return;
    }
    goto(`/celebration-of-life-for-${tribute.attributes.slug}`);
  }

  // Toggle edit mode
  function toggleEdit() {
    if (isEditing) {
      // Cancel editing - reset values
      nameValue = originalName;
      descriptionValue = originalDescription;
      error = null;
    } else {
      // Start editing - store original values with null safety
      originalName = tribute?.attributes?.name || '';
      originalDescription = tribute?.attributes?.description || '';
      nameValue = originalName;
      descriptionValue = originalDescription;
    }
    
    isEditing = !isEditing;
  }

  // Using placeholder image until real images are implemented
  const placeholderImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22450%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22800%22%20height%3D%22450%22%20fill%3D%22%23e0e0e0%22%2F%3E%3Ccircle%20cx%3D%22400%22%20cy%3D%22175%22%20r%3D%2280%22%20fill%3D%22%23cccccc%22%2F%3E%3Crect%20x%3D%22320%22%20y%3D%22280%22%20width%3D%22160%22%20height%3D%2220%22%20fill%3D%22%23cccccc%22%2F%3E%3Crect%20x%3D%22350%22%20y%3D%22320%22%20width%3D%22100%22%20height%3D%2215%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22225%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20fill%3D%22%23888888%22%3EMemorial%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
  
  // Handle image error
  function handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = placeholderImage;
  }

  // Save changes
  async function saveChanges() {
    if (!formIsValid) return;
    
    try {
      isSaving = true;
      error = null;
      
      console.log('🔄 Saving tribute changes...');
      
      // Debug log the tribute object
      console.log('🔍 Tribute data being edited:', JSON.stringify(tribute, null, 2));
        
      if (!tribute) {
        error = "Invalid tribute data: Missing tribute";
        console.error('❌', error);
        isSaving = false;
        return;
      }
      
      if (!tribute.id) {
        error = "Invalid tribute data: Missing ID";
        console.error('❌', error);
        isSaving = false;
        return;
      }
      
      // Get the tribute ID
      // Keep the ID in its original format - Strapi client will handle conversion
      const tributeId = tribute.id;
      console.log(`🔑 Using tribute ID for update: ${tributeId} (type: ${typeof tributeId})`);
      
      console.log(`📤 Sending update request for tribute ID: ${tributeId} (type: ${typeof tributeId})`);
      // Note: We send the data directly (not wrapped in a 'data' property)
      // This is different from AdminPortal.svelte which wraps in { data: ... }
      // The /api/tributes/[id] endpoint handles both formats
      const response = await fetch(`/api/tributes/${tributeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nameValue,
          description: descriptionValue
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || 'Failed to save changes';
        
        // Special handling for 404 errors
        if (response.status === 404) {
          error = `Can't update tribute: ${errorMessage}. The tribute may have been deleted or doesn't exist.`;
        } else {
          error = `Failed to save changes: ${errorMessage}`;
        }
        
        console.error(`❌ API error (${response.status}):`, error);
        isSaving = false;
        return;
      }
      
      const result = await response.json();
      console.log('✅ Tribute updated successfully:', result);
      
      // Update the tribute with new values
      tribute.attributes.name = nameValue;
      tribute.attributes.description = descriptionValue;
      
      // Exit edit mode
      isEditing = false;
      
    } catch (err) {
      console.error('❌ Error saving tribute:', err);
      error = err instanceof Error ? err.message : 'An unknown error occurred';
      
      // Show more detailed error information
      if (err instanceof Error) {
        console.error('Error details:', err);
      }
    } finally {
      isSaving = false;
    }
  }
</script>

<div
  class="bg-card rounded-lg shadow-md overflow-hidden transition-shadow duration-300 {isEditing ? 'shadow-lg' : 'hover:shadow-lg'}"
  class:cursor-pointer={!isEditing}
  on:click={isEditing ? undefined : navigateToTribute}
  on:keydown={(e) => !isEditing && e.key === 'Enter' && navigateToTribute()}
  tabindex={isEditing ? -1 : 0}
  role={isEditing ? "form" : "button"}
  aria-label={isEditing ? "Edit tribute" : `View tribute for ${tribute?.attributes?.name || 'Unnamed Tribute'}`}
>
  {#if isEditing}
    <div class="p-5 bg-muted/10">
      <div class="mb-4">
        <label for="tribute-name" class="block text-sm font-medium text-foreground mb-1">Name <span class="text-red-500">*</span></label>
        <input 
          id="tribute-name"
          type="text"
          class="w-full px-3 py-2 border rounded-md {nameError ? 'border-red-500' : 'border-gray-300'}"
          bind:value={nameValue}
          required
        />
        {#if nameError}
          <p class="text-red-600 text-sm mt-1">{nameError}</p>
        {/if}
      </div>
      
      <div class="mb-4">
        <label for="tribute-description" class="block text-sm font-medium text-foreground mb-1">Description</label>
        <textarea
          id="tribute-description"
          class="w-full px-3 py-2 border rounded-md h-20 resize-none {descriptionError ? 'border-red-500' : 'border-gray-300'}"
          bind:value={descriptionValue}
        ></textarea>
        {#if descriptionError}
          <p class="text-red-600 text-sm mt-1">{descriptionError}</p>
        {/if}
      </div>
      
      {#if error}
        <div class="mb-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-200">
          <p>{error}</p>
        </div>
      {/if}
      
      <div class="flex justify-end gap-3 mt-6">
        <button 
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          on:click={toggleEdit}
          disabled={isSaving}
        >
          Cancel
        </button>
        
        <button 
          type="button"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          on:click={saveChanges}
          disabled={!formIsValid || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  {:else}
    <div class="aspect-video bg-muted relative overflow-hidden">
      <!-- Placeholder for tribute image -->
      <img
        src={placeholderImage}
        alt="Memorial for {tribute?.attributes?.name || 'Unknown'}"
        class="w-full h-full object-cover"
        on:error={handleImageError}
      />
      {#if canEdit()}
        <button
          class="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background/95 transition-colors"
          on:click|stopPropagation={toggleEdit}
          aria-label="Edit tribute"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-foreground">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
      {/if}
    </div>
    
    <div class="p-4">
      <h3 class="text-lg font-semibold text-foreground mb-1 truncate">{tribute?.attributes?.name || 'Unnamed Tribute'}</h3>
      
      <div class="flex items-center text-sm text-muted-foreground mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <span>{formatDate(tribute?.attributes?.created_at)}</span>
      </div>
      
      {#if tribute?.attributes?.description}
        <p class="text-sm text-muted-foreground line-clamp-2 mb-3">{tribute.attributes.description}</p>
      {/if}
      
      <div class="flex justify-between items-center">
        <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
          {tribute?.attributes?.status || 'draft'}
        </span>
        
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-primary">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </div>
  {/if}
</div>