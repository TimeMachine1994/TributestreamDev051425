<script lang="ts">
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';
 let button = "bg-[#D5BA7F] text-black  py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out";
    
    // Form state machine
    let formState = $state('initial'); // initial, editing, submitting, success
    
    // Form fields
    let lovedOneName = $state('');
    let fullName = $state('');
    let phoneNumber = $state('');
    let emailAddress = $state('');
    
    // UI state
    let isSubmitting = $state(false);
    let isSearching = $state(false);
    let isEditing = $state(false);
    let tempSlugifiedName = $state('');
    let formError = $state<string | null>(null);
    
    // Video background state
    let isBlurred = $state(false);
    
    // Derived values using Svelte 5's $derived rune
    let slugifiedName = $derived(
        lovedOneName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    );
    
    let customLink = $derived(
        `http://www.tributestream.com/celebration-of-life-for-${slugifiedName}`
    );
    
    // Form validation using $derived for reactive validation
    let isNameValid = $derived(!!lovedOneName.trim());
    let isFullNameValid = $derived(!!fullName.trim());
    let isPhoneValid = $derived(!!phoneNumber.trim());
    let isEmailValid = $derived(
        !!emailAddress.trim() && 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)
    );
    
    let isFormValid = $derived(
        isFullNameValid && isPhoneValid && isEmailValid
    );
    
    // Side effects using $effect
    $effect(() => {
        // Reset form error when form state changes
        formError = null;
        
        // Apply blur effect when editing or submitting
        isBlurred = formState !== 'initial';
        
        // Initialize temp slugified name when editing starts
        if (isEditing) {
            tempSlugifiedName = slugifiedName;
        }
    });
    
    /**
     * Form action handlers
     */
    
    // Handle search action
    async function handleSearch(event?: SubmitEvent) {
        if (event) event.preventDefault();
        if (!lovedOneName.trim()) return;
        
        try {
            isSearching = true;
            await goto(`/search?search=${encodeURIComponent(lovedOneName)}`);
        } catch (error) {
            console.error('Search navigation failed:', error);
            formError = 'Search failed. Please try again.';
        } finally {
            isSearching = false;
        }
    }
    
    // Handle create tribute action - move to contact info form
    function handleCreateTribute() {
        if (!isNameValid) {
            formError = 'Please enter your loved one\'s name';
            return;
        }
        
        formState = 'editing';
    }
    
    // Handle form submission
    function handleSubmit(event?: SubmitEvent) {
        if (event) event.preventDefault();
        
        if (!isFormValid) {
            formError = 'Please fill out all required fields correctly';
            return;
        }
        
        formState = 'submitting';
        isSubmitting = true;
        
        // Submit the form data
        const formData = {
            lovedOneName,
            fullName,
            phoneNumber,
            emailAddress,
            slug: slugifiedName
        };
        
        // Use SvelteKit's form enhancement for actual submission
        // This would typically be handled by the form's use:enhance directive
        // but we're simulating it here for the unified implementation
        
        // Simulate form submission success
        setTimeout(() => {
            isSubmitting = false;
            formState = 'success';
        }, 1000);
    }
    
    // Handle going back to initial state
    function handleGoBack() {
        formState = 'initial';
        isEditing = false;
    }
    
    // Handle editing the slugified name
    function handleEditName() {
        isEditing = true;
    }
    
    // Handle saving the edited slugified name
    function handleSaveNameChange() {
        // Validate the edited name
        if (!tempSlugifiedName.trim()) {
            formError = 'Custom link cannot be empty';
            return;
        }
        
        // Instead of directly updating slugifiedName (which is derived),
        // we need to update the source state variable (lovedOneName)
        // This is a simplified approach that assumes the slug is directly related to the name
        // In a real implementation, you might want to store the slug separately
        lovedOneName = tempSlugifiedName
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
            
        isEditing = false;
    }
    
    // Handle discarding the edited slugified name
    function handleDiscardNameChange() {
        tempSlugifiedName = slugifiedName;
        isEditing = false;
    }
    
    // Reset the form
    function resetForm() {
        formState = 'initial';
        lovedOneName = '';
        fullName = '';
        phoneNumber = '';
        emailAddress = '';
        isSubmitting = false;
        isSearching = false;
        isEditing = false;
        formError = null;
    }
</script>

<!-- Unified HomePage component with video background -->
<section class="relative bg-gray-900 text-white min-h-screen">
    <!-- Video background with conditional blur effect -->
    <video 
        autoplay 
        muted 
        loop 
        playsinline 
        class="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-300" 
        class:blur-sm={isBlurred}
    >
        <source src="https://209.74.64.181:12091/down/FCymVumu4aQG.mp4" type="video/mp4" />
        Your browser does not support the video tag.
    </video>
    
    <!-- Overlay for better text readability -->
    <div class="absolute inset-0 bg-black opacity-50 z-10"></div>
    
    <!-- Main content container -->
    <div class="relative z-20 flex flex-col items-center justify-start min-h-screen pt-8 px-4 font-['Fanwood_Text']">
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
        
        <!-- Form section with conditional rendering based on form state -->
        <div class="w-full max-w-md">
            {#if formState === 'initial'}
                <!-- Initial state - Name input form -->
                <p class="text-center mb-8 text-lg md:text-xl">
                    Tributestream broadcasts high quality audio and video of your loved one's celebration of life. <br> 
                    Enter your loved one's name below to begin your journey with Tributestream.
                </p>
                
                <form on:submit|preventDefault={handleSearch} class="w-full">
                    <input
                        type="text"
                        id="lovedOneName"
                        placeholder="Loved One's Name Here"
                        class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center"
                        bind:value={lovedOneName}
                        aria-label="Loved One's Name"
                        aria-required="true"
                    />
                    
                    <div class="flex space-x-4 justify-center">
                        <button 
                            type="button"
                            on:click={handleCreateTribute}
                            class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out"
                            disabled={!isNameValid}
                        >
                            Create Tribute
                        </button>
                        
                        <button
                            type="submit"
                            class={button}
                            disabled={isSearching || !isNameValid}
                        >
                            {isSearching ? 'Searching...' : 'Search Streams'}
                        </button>
                    </div>
                </form>
                
            {:else if formState === 'editing'}
                <!-- Editing state - Contact information form -->
                <p class="text-center mb-8 text-lg md:text-xl">
                    Your Loved One's Custom Link:
                </p>
                
                <form 
                    method="POST" 
                    action="?/create" 
                    use:enhance={() => {
                        isSubmitting = true;
                        return async ({ result }) => {
                            isSubmitting = false;
                            if (result.type === 'success') {
                                formState = 'success';
                            } else {
                                formError = 'Submission failed. Please try again.';
                            }
                        };
                    }}
                    class="w-full"
                >
                    <!-- Custom link editor -->
                    <div class="flex items-center justify-center mb-4 flex-wrap">
                        <span class="text-white">http://www.tributestream.com/celebration-of-life-for-</span>
                        {#if isEditing}
                            <div class="flex items-center">
                                <input
                                    type="text"
                                    class="px-2 py-1 text-gray-900 rounded-md"
                                    bind:value={tempSlugifiedName}
                                    aria-label="Custom URL slug"
                                />
                                <button 
                                    type="button"
                                    class="ml-2 text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                    on:click={handleSaveNameChange}
                                    aria-label="Save custom URL"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                                <button 
                                    type="button"
                                    class="ml-2 text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500" 
                                    on:click={handleDiscardNameChange}
                                    aria-label="Cancel editing custom URL"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        {:else}
                            <div class="flex items-center">
                                <span class="text-white">{slugifiedName}</span>
                                <button 
                                    type="button"
                                    class="ml-2 text-white focus:outline-none focus:ring-2 focus:ring-white" 
                                    on:click={handleEditName}
                                    aria-label="Edit custom URL"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            </div>
                        {/if}
                    </div>
                    
                    <!-- Contact information fields -->
                    <div class="space-y-4">
                        <div>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Your Name"
                                class="w-full px-4 py-2 text-gray-900 rounded-md"
                                bind:value={fullName}
                                aria-label="Your Full Name"
                                aria-required="true"
                                aria-invalid={!isFullNameValid}
                            />
                        </div>
                        
                        <div>
                            <input
                                type="email"
                                id="emailAddress"
                                name="emailAddress"
                                placeholder="Email Address"
                                class="w-full px-4 py-2 text-gray-900 rounded-md"
                                bind:value={emailAddress}
                                aria-label="Your Email Address"
                                aria-required="true"
                                aria-invalid={!isEmailValid}
                            />
                        </div>
                        
                        <div>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                class="w-full px-4 py-2 text-gray-900 rounded-md"
                                bind:value={phoneNumber}
                                aria-label="Your Phone Number"
                                aria-required="true"
                                aria-invalid={!isPhoneValid}
                            />
                        </div>
                    </div>
                    
                    <!-- Hidden fields for form submission -->
                    <input type="hidden" name="slug" value={slugifiedName} />
                    <input type="hidden" name="lovedOneName" value={lovedOneName} />
                    
                    <!-- Form action buttons -->
                    <div class="flex justify-between items-center mt-6">
                        <button 
                            type="button" 
                            on:click={handleGoBack} 
                        class={button}
                            aria-label="Go back to previous step"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        
                        <button 
                            type="submit" 
                            class={button}
                            disabled={isSubmitting || !isFormValid}
                            aria-label="Create tribute page"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Tribute'}
                        </button>
                    </div>
                </form>
                
            {:else if formState === 'submitting'}
                <!-- Submitting state - Loading indicator -->
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    <p class="mt-4 text-xl">Creating your tribute page...</p>
                </div>
                
            {:else if formState === 'success'}
                <!-- Success state - Confirmation message -->
                <div class="text-center py-12 space-y-6">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <h2 class="text-2xl font-bold">Tribute Created Successfully!</h2>
                    <p class="text-lg">Your tribute page for {lovedOneName} has been created.</p>
                    <p class="text-md break-all">{customLink}</p>
                    
                    <div class="flex justify-center space-x-4 mt-8">
                        <a 
                            href={customLink}
                            class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            View Tribute
                        </a>
                        <button 
                            type="button"
                            on:click={resetForm}
                            class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Create Another
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</section>