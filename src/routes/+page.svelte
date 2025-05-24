<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { onMount } from 'svelte';
    import MemorialCard from '$lib/components/home/MemorialCard.svelte';
    
    // Define props using Svelte 5 runes syntax
    const { form, data } = $props();
    
    // Button styling
    let button = "bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out";
    
    // Form state machine
    let formState = $state('initial'); // initial, searching, creating, submitting, success
    
    // Form fields - Search
    let searchTerm = $state('');
    
    // Form fields - Memorial creation (using fd-form simplified fields)
    let creatorFullName = $state('');
    let creatorPhone = $state('');
    let creatorEmail = $state('');
    
    // UI state
    let isSubmitting = $state(false);
    let isSearching = $state(false);
    let showQuickCreateForm = $state(false);
    let formError = $state<string | null>(null);
    let errors = $state<Record<string, string>>({});
    
    // Video background state
    let isBlurred = $state(false);
    
    // Derived values using Svelte 5's $derived rune
    let slugifiedName = $derived(
        searchTerm
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    );
    
    let customLink = $derived(
        `https://tributestream.com/celebration-of-life-for-${slugifiedName}`
    );
    
    // Form validation using $derived for reactive validation
    let isNameValid = $derived(!!searchTerm.trim());
    let isCreatorNameValid = $derived(!!creatorFullName.trim());
    let isPhoneValid = $derived(!!creatorPhone.trim() && creatorPhone.length >= 7);
    let isEmailValid = $derived(
        !!creatorEmail.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creatorEmail)
    );
    
    let isQuickFormValid = $derived(
        isNameValid && isCreatorNameValid && isPhoneValid && isEmailValid
    );
    
    let isSearchValid = $derived(!!searchTerm.trim());
    
    // Side effects using $effect
    $effect(() => {
        // Reset form error and field-specific errors when form state changes
        formError = null;
        errors = {};
        
        // Apply blur effect when not in initial state
        isBlurred = formState !== 'initial';
        
        // Pre-populate form data if returning from failed submission
        if (form?.create && form.error && form.data) {
            // Pre-populate the search field as the loved one's name
            searchTerm = form.data.lovedOneName || '';
            creatorFullName = form.data.creatorFullName || '';
            creatorPhone = form.data.creatorPhone || '';
            creatorEmail = form.data.creatorEmail || '';
            
            // Show the create form and any error message
            showQuickCreateForm = true;
            formError = form.message;
            
            // Handle field-specific errors from server response
            // Map field errors from form.data if available
            // The server returns field values in data rather than dedicated errors object
            if (form?.data) {
                // Create field-specific errors if needed based on validation failure
                const fieldErrors: Record<string, string> = {};
                
                // Add validation error indicators for each field based on server response
                if (!form.data.lovedOneName?.trim()) {
                    fieldErrors.lovedOneName = "Loved one's name is required";
                }
                if (!form.data.creatorFullName?.trim()) {
                    fieldErrors.creatorFullName = "Your full name is required";
                }
                if (!form.data.creatorPhone?.trim()) {
                    fieldErrors.creatorPhone = "Your phone number is required";
                }
                if (!form.data.creatorEmail?.trim()) {
                    fieldErrors.creatorEmail = "Your email address is required";
                }
                
                // Update local errors state with field-specific errors
                errors = fieldErrors;
            }
        }
        
        // Handle search results
        if (form?.search) {
            if (form.error) {
                formError = form.error;
            }
            
            if (form.term) {
                searchTerm = form.term;
            }
        }
    });
    
    // Handle search action
    function handleSearchAction() {
        if (!isSearchValid) {
            formError = 'Please enter a name to search';
            return;
        }
        
        formState = 'searching';
        isSearching = true;
    }
    
    // Handle reset search
    function resetSearch() {
        formState = 'initial';
        searchTerm = '';
        isSearching = false;
    }
    
    // Handle create memorial button click with an event parameter to fix TypeScript error
    function handleCreateMemorial(event: MouseEvent | null = null, nameToUse?: string) {
        // Prevent default if event is provided
        if (event) event.preventDefault();
        
        // If a name was provided via search, use it
        if (nameToUse) {
            searchTerm = nameToUse;
        }
        
        // Only show form if there's a name to use
        if (searchTerm.trim()) {
            showQuickCreateForm = true;
            formState = 'creating';
        } else {
            // If no name, set a temporary one for UX purposes
            searchTerm = 'Your Loved One';
            showQuickCreateForm = true;
            formState = 'creating';
        }
    }
    
    // Handle form submission with field-specific error handling
    function handleMemorialSubmit() {
        // Reset errors before validation
        errors = {};
        let errorMessages = [];
        
        // Field-specific validation with proper error messages
        if (!isNameValid) {
            errors['lovedOneName'] = 'Loved one\'s name is required';
            errorMessages.push('Loved one\'s name is required');
        }
        
        if (!isCreatorNameValid) {
            errors['creatorFullName'] = 'Your full name is required';
            errorMessages.push('Your full name is required');
        }
        
        if (!isPhoneValid) {
            errors['creatorPhone'] = 'A valid phone number is required';
            errorMessages.push('A valid phone number is required');
        }
        
        if (!isEmailValid) {
            errors['creatorEmail'] = 'A valid email address is required';
            errorMessages.push('A valid email address is required');
        }
        
        // If any validation errors occurred, stop submission and show errors
        if (errorMessages.length > 0) {
            formError = errorMessages.join('. ');
            return;
        }
        
        // Clear errors if validation passed
        formError = null;
        errors = {};
        
        // Update form state and show loading indicator
        formState = 'submitting';
        isSubmitting = true;
    }
    
    // Handle go back
    function handleGoBack() {
        formState = 'initial';
        showQuickCreateForm = false;
    }

    // Input styling helpers
    function getInputClass(hasError: boolean): string {
        const baseClass = "w-full px-4 py-2 bg-gray-800 text-white rounded-md mb-2";
        return hasError
            ? `${baseClass} border border-red-500 focus:ring-red-500`
            : `${baseClass} border border-gray-700`;
    }
</script>

<!-- Main component with video background -->
<section class="relative bg-gray-900 text-white min-h-screen">
    <!-- Video background with conditional blur effect -->
    <div
        class="absolute inset-0 w-full h-full z-0 bg-gray-900 overflow-hidden"
        class:blur-sm={isBlurred}
    >
        <iframe
            src="https://player.vimeo.com/video/1074841232?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"
            class="absolute w-full h-full object-cover"
            frameborder="0"
            allow="autoplay; fullscreen"
            title="Background Video"
        ></iframe>
    </div>
    
    <!-- Overlay for better text readability -->
    <div class="absolute inset-0 bg-black opacity-50 z-10"></div>
    
    <!-- Main content container -->
    <div class="relative z-20 flex flex-col items-center justify-center min-h-screen pt-8 px-4 font-['Fanwood_Text']">
        <!-- Header section -->
        <h1 class="text-4xl md:text-6xl text-center mb-4">
            We Make Hearts Full Again
        </h1>
        
        <!-- Error message display -->
        {#if formError}
            <div class="bg-red-500 text-white px-4 py-2 rounded-md mb-4 max-w-md text-center">
                {formError}
            </div>
        {/if}
        
        <!-- Main content area -->
        <div class="w-full max-w-lg flex flex-col flex-grow p-6 bg-black bg-opacity-10 rounded-xl shadow-2xl">
            {#if formState === 'initial'}
                <!-- Initial state - Name input form and actions -->
                <div class="bg-black bg-opacity-30 p-6 rounded-lg shadow-lg">
                    <p class="text-center mb-8 text-lg md:text-xl">
                    Tributestream broadcasts high quality audio and video of your loved one's celebration of life. <br> 
                    Enter your loved one's name below to search, or create a new memorial.
                </p>
                
                <form method="POST" action="?/search" use:enhance={() => {
                    handleSearchAction();
                    return ({ update }) => {
                        update({ reset: false });
                        isSearching = false;
                    };
                }} class="w-full">
                    <input
                        type="text"
                        id="searchTerm"
                        name="searchTerm"
                        placeholder="Enter a name to search"
                        class="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg mb-6 text-center text-lg placeholder-gray-400 focus:ring-2 focus:ring-[#D5BA7F] focus:border-transparent border border-gray-700"
                        bind:value={searchTerm}
                        aria-label="Search for a memorial"
                    />
                    
                    <div class="flex space-x-4 justify-center">
                        <button 
                            type="button"
                            on:click={handleCreateMemorial}
                            class={button}
                        >
                            Create Memorial
                        </button>
                        
                        <button
                            type="submit"
                            class={button}
                            disabled={isSearching || !isSearchValid}
                        >
                            {isSearching ? 'Searching...' : 'Search Memorials'}
                        </button>
                    </div>
                </form>
                </div>
                
            {:else if formState === 'searching' || (form?.search && form.results)}
                <!-- Search results state -->
                <div class="bg-black bg-opacity-30 p-6 rounded-lg shadow-lg">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-semibold">
                            Search Results for "{form?.term || searchTerm}"
                        </h2>
                        <button 
                            on:click={resetSearch}
                            class="text-white hover:text-gray-300 focus:outline-none"
                            aria-label="Close search results"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {#if form?.search && form.results && form.results.length > 0}
                        <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {#each form.results as tribute}
                                <MemorialCard tribute={tribute} />
                            {/each}
                        </div>
                        
                        {#if form.totalPages > 1}
                            <div class="mt-4 flex justify-center space-x-2">
                                <span class="text-gray-300">
                                    Page {form.currentPage} of {form.totalPages}
                                </span>
                            </div>
                        {/if}
                        
                    {:else}
                        <div class="text-center py-8">
                            <p class="text-lg mb-4">No memorials found matching "{form?.term || searchTerm}"</p>
                            <button 
                                on:click={handleCreateMemorial}
                                class={button}
                            >
                               Create Tribute
                            </button>
                        </div>
                    {/if}
                </div>
                
            {:else if formState === 'creating' || showQuickCreateForm}
                <!-- Enhanced Create Memorial Form with transitions -->
                <div
                    class="bg-black bg-opacity-30 p-6 rounded-lg shadow-lg"
                    transition:slide={{ duration: 300, easing: quintOut }}
                >
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-semibold">Create a Memorial</h2>
                        <button
                            on:click={handleGoBack}
                            class="text-white hover:text-gray-300 focus:outline-none"
                            aria-label="Close form"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <form
                        method="POST"
                        action="?/createMemorial"
                        use:enhance={() => {
                            handleMemorialSubmit();
                            return ({ update }) => {
                                update({ reset: false });
                                isSubmitting = false;
                            };
                        }}
                        class="space-y-4"
                    >
                        <!-- Hidden field for loved one's name - using the search term -->
                        <input type="hidden" name="lovedOneName" value={searchTerm} />
                        
                        <!-- Prominently display the loved one's name from the search field -->
                        <div class="bg-gray-800 p-4 rounded-md mb-6 border-l-4 border-[#D5BA7F]">
                            <h3 class="text-2xl font-semibold text-white mb-1">In Memory of</h3>
                            <p class="text-[#D5BA7F] text-2xl font-bold">{searchTerm}</p>
                        </div>
                        
                        <div>
                            <label for="creatorFullName" class="block text-sm font-medium text-gray-300 mb-1">
                                Your Full Name *
                            </label>
                            <input
                                type="text"
                                id="creatorFullName"
                                name="creatorFullName"
                                placeholder="Your full name"
                                class={getInputClass(!!errors?.creatorFullName)}
                                bind:value={creatorFullName}
                                required
                            />
                            {#if !isCreatorNameValid && creatorFullName !== ''}
                                <p class="text-red-500 text-xs mt-1">Full name is required</p>
                            {/if}
                        </div>
                        
                        <div>
                            <label for="creatorPhone" class="block text-sm font-medium text-gray-300 mb-1">
                                Your Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="creatorPhone"
                                name="creatorPhone"
                                placeholder="(555) 123-4567"
                                class={getInputClass(!!errors?.creatorPhone)}
                                bind:value={creatorPhone}
                                required
                            />
                            {#if !isPhoneValid && creatorPhone !== ''}
                                <p class="text-red-500 text-xs mt-1">Valid phone number is required</p>
                            {/if}
                        </div>
                        
                        <div>
                            <label for="creatorEmail" class="block text-sm font-medium text-gray-300 mb-1">
                                Your Email *
                            </label>
                            <input
                                type="email"
                                id="creatorEmail"
                                name="creatorEmail"
                                placeholder="your.email@example.com"
                                class={getInputClass(!!errors?.creatorEmail)}
                                bind:value={creatorEmail}
                                required
                            />
                            {#if !isEmailValid && creatorEmail !== ''}
                                <p class="text-red-500 text-xs mt-1">Valid email address is required</p>
                            {/if}
                            <p class="text-xs text-gray-400 mt-1">
                                Used to create your account and manage the memorial page.
                            </p>
                        </div>
                        
                        <!-- Preview of memorial page URL -->
                        {#if searchTerm}
                            <div class="bg-gray-800 p-3 rounded-md text-sm overflow-hidden border border-gray-700">
                                <p class="text-gray-400 mb-1">Memorial page URL:</p>
                                <p class="text-[#D5BA7F] truncate font-mono">{customLink}</p>
                            </div>
                        {/if}
                        
                        <!-- Submit button -->
                        <button
                            type="submit"
                            class={`${button} w-full mt-4`}
                            disabled={isSubmitting || !isQuickFormValid}
                        >
                            {isSubmitting ? 'Creating Memorial...' : 'Create Memorial'}
                        </button>
                    </form>
                </div>
                
            {:else if formState === 'submitting'}
                <!-- Submitting state - Loading indicator -->
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    <p class="mt-4 text-xl">Creating your memorial page...</p>
                </div>
            {/if}
            
            <!-- Optional - Search results from server -->
            {#if form?.search && !showQuickCreateForm && formState !== 'creating'}
                <div class="mt-8 text-center">
                    <p class="text-gray-300 mb-2">Don't see what you're looking for?</p>
                    <button 
                        on:click={handleCreateMemorial}
                        class={button}
                    >
                        Create a New Memorial
                    </button>
                </div>
            {/if}
        </div>
    </div>
</section>

<svelte:head>
    <script src="https://player.vimeo.com/api/player.js"></script>
</svelte:head>

<style>
    /* Simple styling for the video background */
    iframe {
        border: 0;
        margin: 0;
        padding: 0;
        width: 100vw !important;
        height: 100vh !important;
        object-fit: cover;
        transform: scale(1.1); /* Slightly scale up to avoid any borders */
    }
</style>
