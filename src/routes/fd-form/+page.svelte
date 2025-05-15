<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";
  
  // Define standalone interface for form action results
  interface FormActionResult {
    type: "success" | "failure" | "redirect" | "error";
    status: number;
    data?: {
      success?: boolean;
      error?: boolean;
      message?: string;
      errors?: Record<string, string>;
      formData?: Record<string, string>;
      isPartialSuccess?: boolean;
    };
    location?: string;
    error?: any;
    message?: string;
  }

  // Define types for form fields
  type FormField =
    | "director-name"
    | "family-member-name"
    | "loved-one-name"
    | "email-address"
    | "phone-number"
    | "contact-preference"
    | "location-name"
    | "location-address"
    | "memorial-time"
    | "memorial-date";

  type FormData = Record<FormField, string>;
  type ErrorMap = Partial<Record<FormField, string>>;
  type TouchedMap = Partial<Record<FormField, boolean>>;

  // Component props
  let { fdForm, form } = $props<{
    fdForm?: FormData;
    form?: FormActionResult;
  }>();
  
  // Form data state with default empty values
  let formData = $state<FormData>({
    "director-name": "",
    "family-member-name": "",
    "loved-one-name": "",
    "email-address": "",
    "phone-number": "",
    "contact-preference": "phone-call", // Default to phone call
    "location-name": "",
    "location-address": "",
    "memorial-time": "",
    "memorial-date": ""
  });
  
  // Prefill with passed-in data if available
  if (fdForm) {
    formData = { ...formData, ...fdForm };
  }
  
  // Error state management
  let errors = $state<ErrorMap>({});
  let formError = $state<string>("");
  let isPartialSuccess = $state<boolean>(false);
  let isSubmitting = $state<boolean>(false);
  let touched = $state<TouchedMap>({});

  // Set touched state when field is focused
  function markAsTouched(fieldName: FormField): void {
    touched[fieldName] = true;
  }
  
  // Client-side validation
  function validateField(fieldName: FormField, value: string): void {
    // Only validate if the field has been touched
    if (!touched[fieldName]) return;
    
    // Clear existing error for this field
    delete errors[fieldName];
    
    // Perform validation based on field type
    switch (fieldName) {
      case "director-name":
        if (!value) errors[fieldName] = "Director's name is required";
        break;
      case "loved-one-name":
        if (!value) errors[fieldName] = "Loved one's name is required";
        break;
      case "email-address":
        if (!value) {
          errors[fieldName] = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[fieldName] = "Invalid email format";
        }
        break;
      case "phone-number":
        if (!value) {
          errors[fieldName] = "Phone number is required";
        } else if (!/^[0-9\-\+\(\)\s]{7,20}$/.test(value)) {
          errors[fieldName] = "Invalid phone number format";
        }
        break;
      case "location-name":
        // Location name is no longer required
        break;
      case "memorial-date":
        if (value && isNaN(new Date(value).getTime())) {
          errors[fieldName] = "Invalid date format";
        }
        break;
    }
  }
  
  // Validate all fields at once
  function validateForm(): boolean {
    // Mark all fields as touched
    Object.keys(formData).forEach(key => {
      const fieldName = key as FormField;
      touched[fieldName] = true;
      validateField(fieldName, formData[fieldName]);
    });
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  }
  
  // Get input class based on error state
  function getInputClass(fieldName: FormField): string {
    const baseClass = "w-full py-3 px-4 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d5ba7f] text-black";
    return touched[fieldName] && errors[fieldName] 
      ? `${baseClass} border-red-500 focus:ring-red-500` 
      : baseClass;
  }
  
  // Handle form submission with enhanced client-side validation
  function handleSubmit(event: Event): void {
    // Reset form error
    formError = "";
    
    // Validate all fields
    if (!validateForm()) {
      event.preventDefault();
      formError = "Please correct the errors before submitting.";
      return;
    }
    
    // Submission will continue naturally if validation passes
    isSubmitting = true;
  }

  // Handle server-side form errors and status messages
  function processServerErrors(result: any): void {
    if (result?.error) {
      formError = result.message || "An error occurred during submission.";
      isPartialSuccess = false;
      
      // If the server returned field-specific errors, map them to our errors object
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, message]) => {
          // Map the old field names to new field names if needed
          const mappedKey = key.includes("first-name") || key.includes("last-name") 
            ? key.replace(/-first-name|-last-name/, "-name")
            : key.replace("deceased", "loved-one");
          
          errors[mappedKey as FormField] = message as string;
        });
      }
    } else if (result?.success) {
      // Handle success with possible message
      formError = ""; // Clear any previous errors
      if (result.message) {
        formError = result.message; // Use the message field for notifications
        isPartialSuccess = !!result.isPartialSuccess; // Set partial success flag if present
      }
    }
    
    isSubmitting = false;
  }

  // Format dates to YYYY-MM-DD for date inputs
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  import { onMount } from "svelte";

  // Load reCAPTCHA v3 script on mount
  onMount(() => {
    console.log("🧠 Mounting component and loading reCAPTCHA script...");

    const scriptId = "recaptcha-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.google.com/recaptcha/api.js?render=6LeUcBMlAAAAAK4z7ZcZCzv8kz3Z9ZKX9ZKX9ZKX";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      console.log("📜 reCAPTCHA script appended to document.");
    }

    // Shim for grecaptcha.ready in case it's not defined yet
    window.grecaptcha = window.grecaptcha || {
      ready: (cb) => {
        console.log("⚠️ grecaptcha.ready shim called.");
        cb();
      }
    };
  });

  // Handle reCAPTCHA and submit form
  async function handleRecaptcha(event: MouseEvent) {
    event.preventDefault();
    console.log("🛡️ reCAPTCHA triggered...");

    const formEl = document.querySelector("form");
    if (!formEl) {
      console.error("❌ Form element not found.");
      return;
    }

    // Validate client-side before reCAPTCHA
    if (!validateForm()) {
      console.warn("⚠️ Form validation failed. Aborting reCAPTCHA.");
      formError = "Please correct the errors before submitting.";
      return;
    }

    isSubmitting = true;

    try {
      await window.grecaptcha.ready(async () => {
        console.log("✅ grecaptcha.ready resolved.");
        const token = await window.grecaptcha.execute("6LeUcBMlAAAAAK4z7ZcZCzv8kz3Z9ZKX9ZKX9ZKX", { action: "submit" });
        console.log("🔐 reCAPTCHA token received:", token);

        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = "g-recaptcha-response";
        hiddenInput.value = token;
        formEl.appendChild(hiddenInput);

        console.log("📨 Submitting form with reCAPTCHA token...");
        formEl.submit();
      });
    } catch (err) {
      console.error("❌ Error during reCAPTCHA execution:", err);
      formError = "An error occurred while verifying reCAPTCHA.";
      isSubmitting = false;
    }
  }
</script>
<section class="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen flex items-center justify-center p-4 text-lg">
  <div class="w-full max-w-6xl">
    <!-- Form Card -->
    <div class="bg-white shadow-xl rounded-xl overflow-hidden">
      <!-- Header Section with Benefits -->
      <div class="bg-gradient-to-r from-[#d5ba7f] to-[#e9d7a7] p-6 text-white">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold mb-2">Memorial Information Form</h1>
          <p class="text-lg opacity-90">You will receive two things after this form has been filled out:</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <!-- Left Column: Free Custom -->
          <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-semibold">Free Custom Shareable Link</h2>
              <p class="text-lg opacity-90">Easily share with family and friends</p>
            </div>
          </div>
          
          <!-- Right Column: Detailed Info Email -->
          <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-semibold">Detailed Information Email</h2>
              <p class="text-lg opacity-90">Complete guide and resources sent to your inbox</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Body -->
      {#if form?.data?.success}
        <div class="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6" role="alert">
          <span class="block text-lg">{form.data.message}</span>
        </div>
      {/if}
      <form
        method="POST"
        class="px-6 py-8"
        onsubmit={handleSubmit}
        use:enhance={() => {
          return async ({ result, update }) => {
            // Cast the ActionResult to our FormActionResult type
            const formResult = result as unknown as FormActionResult;
            if (formResult.type === 'failure') {
              processServerErrors(formResult.data);
              isSubmitting = false;
            } else if (formResult.type === 'redirect') {
              // First, make sure the DOM is updated before the navigation happens
              await update();
              
              // Reset the submitting state to avoid the UI being stuck if navigation is delayed
              isSubmitting = false;
              
              // We don't need to manually handle the redirect as SvelteKit will do it automatically
            } else if (formResult.type === 'success') {
              // Process any success data, including registration status
              processServerErrors(formResult.data);
              await update();
            } else {
              // Other cases
              isSubmitting = false;
            }
          };
        }}
      >
        {#if formError && !isPartialSuccess}
          <div class="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-6" role="alert">
            <span class="block text-lg">{formError}</span>
          </div>
        {/if}
        
        {#if formError && isPartialSuccess}
          <div class="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg relative mb-6" role="alert">
            <span class="block text-lg">{formError}</span>
          </div>
        {/if}
        
        {#if form?.error}
          <div class="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-6" role="alert">
            <span class="block text-lg">{form.message}</span>
          </div>
        {/if}
        
        {#if form?.data?.success && form?.data?.isPartialSuccess}
          <div class="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg relative mb-6" role="alert">
            <span class="block text-lg">{form.data.message}</span>
          </div>
        {/if}

        <!-- Form Grid - Two Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-6">
            <!-- Director's Information -->
            <div class="border-b border-gray-200 pb-6">
              <h2 class="text-2xl font-semibold mb-4 text-gray-800">Director's Full Name</h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-lg font-medium mb-2" for="director-name">Full Name*</label>
                  <input
                    name="director-name"
                    type="text"
                    id="director-name"
                    placeholder="Director's Full Name"
                    class={getInputClass("director-name")}
                    bind:value={formData["director-name"]}
                    onblur={() => validateField("director-name", formData["director-name"])}
                    onfocus={() => markAsTouched("director-name")}
                    aria-invalid={errors["director-name"] ? "true" : "false"}
                    aria-describedby={errors["director-name"] ? "director-name-error" : undefined}
                  />
                  {#if errors["director-name"]}
                    <p id="director-name-error" class="text-red-500 text-base mt-1">{errors["director-name"]}</p>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Family Member Information -->
            <div class="border-b border-gray-200 pb-6">
              <h2 class="text-2xl font-semibold mb-4 text-gray-800">Family Member's Full Name</h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-lg font-medium mb-2" for="family-member-name">Full Name</label>
                  <input
                    name="family-member-name"
                    type="text"
                    id="family-member-name"
                    placeholder="Family Member's Full Name"
                    class={getInputClass("family-member-name")}
                    bind:value={formData["family-member-name"]}
                    onblur={() => validateField("family-member-name", formData["family-member-name"])}
                    onfocus={() => markAsTouched("family-member-name")}
                  />
                  {#if errors["family-member-name"]}
                    <p class="text-red-500 text-base mt-1">{errors["family-member-name"]}</p>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div>
              <h2 class="text-2xl font-semibold mb-4 text-gray-800">Contact Information</h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-lg font-medium mb-2" for="email-address">Email Address*</label>
                  <input
                    name="email-address"
                    type="email"
                    id="email-address"
                    placeholder="Email Address"
                    class={getInputClass("email-address")}
                    bind:value={formData["email-address"]}
                    onblur={() => validateField("email-address", formData["email-address"])}
                    onfocus={() => markAsTouched("email-address")}
                    aria-invalid={errors["email-address"] ? "true" : "false"}
                    aria-describedby={errors["email-address"] ? "email-address-error" : undefined}
                  />
                  {#if errors["email-address"]}
                    <p id="email-address-error" class="text-red-500 text-base mt-1">{errors["email-address"]}</p>
                  {/if}
                </div>
                
                <div>
                  <label class="block text-gray-700 text-lg font-medium mb-2" for="phone-number">Phone Number*</label>
                  <input
                    name="phone-number"
                    type="tel"
                    id="phone-number"
                    placeholder="Phone Number"
                    class={getInputClass("phone-number")}
                    bind:value={formData["phone-number"]}
                    onblur={() => validateField("phone-number", formData["phone-number"])}
                    onfocus={() => markAsTouched("phone-number")}
                    aria-invalid={errors["phone-number"] ? "true" : "false"}
                    aria-describedby={errors["phone-number"] ? "phone-number-error" : undefined}
                  />
                  {#if errors["phone-number"]}
                    <p id="phone-number-error" class="text-red-500 text-base mt-1">{errors["phone-number"]}</p>
                  {/if}
                </div>
                
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <!-- Loved One Information -->
            <div class="border-b border-gray-200 pb-6">
              <h2 class="text-2xl font-semibold mb-4 text-gray-800">Loved One's Full Name</h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-lg font-medium mb-2" for="loved-one-name">Full Name*</label>
                  <input
                    name="loved-one-name"
                    type="text"
                    id="loved-one-name"
                    placeholder="Loved One's Full Name"
                    class={getInputClass("loved-one-name")}
                    bind:value={formData["loved-one-name"]}
                    onblur={() => validateField("loved-one-name", formData["loved-one-name"])}
                    onfocus={() => markAsTouched("loved-one-name")}
                    aria-invalid={errors["loved-one-name"] ? "true" : "false"}
                    aria-describedby={errors["loved-one-name"] ? "loved-one-name-error" : undefined}
                  />
                  {#if errors["loved-one-name"]}
                    <p id="loved-one-name-error" class="text-red-500 text-base mt-1">{errors["loved-one-name"]}</p>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Memorial Information -->
            <div>
              <h2 class="text-2xl font-semibold mb-4 text-gray-800">Memorial Information (Optional)</h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-lg font-medium mb-2" for="location-name">Location Name</label>
                  <input
                    name="location-name"
                    type="text"
                    id="location-name"
                    placeholder="Location Name"
                    class={getInputClass("location-name")}
                    bind:value={formData["location-name"]}
                    onblur={() => validateField("location-name", formData["location-name"])}
                    onfocus={() => markAsTouched("location-name")}
                    aria-required="false"
                  />
                  {#if errors["location-name"]}
                    <p id="location-name-error" class="text-red-500 text-base mt-1">{errors["location-name"]}</p>
                  {/if}
                </div>
                
                <div>
                  <label class="block text-gray-700 text-lg font-medium mb-2" for="location-address">Location Address</label>
                  <input
                    name="location-address"
                    type="text"
                    id="location-address"
                    placeholder="Location Address"
                    class={getInputClass("location-address")}
                    bind:value={formData["location-address"]}
                    onblur={() => validateField("location-address", formData["location-address"])}
                    onfocus={() => markAsTouched("location-address")}
                    aria-required="false"
                  />
                  {#if errors["location-address"]}
                    <p class="text-red-500 text-base mt-1">{errors["location-address"]}</p>
                  {/if}
                </div>
                
                <!-- Add Memorial Date and Time Fields -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label class="block text-gray-700 text-lg font-medium mb-2" for="memorial-date">Memorial Date</label>
                    <input
                      name="memorial-date"
                      type="date"
                      id="memorial-date"
                      class={getInputClass("memorial-date")}
                      bind:value={formData["memorial-date"]}
                      onblur={() => validateField("memorial-date", formData["memorial-date"])}
                      onfocus={() => markAsTouched("memorial-date")}
                      aria-required="false"
                    />
                    {#if errors["memorial-date"]}
                      <p class="text-red-500 text-base mt-1">{errors["memorial-date"]}</p>
                    {/if}
                  </div>
                  
                  <div>
                    <label class="block text-gray-700 text-lg font-medium mb-2" for="memorial-time">Memorial Time</label>
                    <input
                      name="memorial-time"
                      type="time"
                      id="memorial-time"
                      class={getInputClass("memorial-time")}
                      bind:value={formData["memorial-time"]}
                      onblur={() => validateField("memorial-time", formData["memorial-time"])}
                      onfocus={() => markAsTouched("memorial-time")}
                      aria-required="false"
                    />
                    {#if errors["memorial-time"]}
                      <p class="text-red-500 text-base mt-1">{errors["memorial-time"]}</p>
                    {/if}
                  </div>
                </div>
                
                <!-- Contact Preference moved from left column -->
                <div>
                  <label class="block text-gray-700 text-lg font-medium mb-2">Contact Preference</label>
                  <div class="flex space-x-6 mb-4">
                    <div class="flex items-center">
                      <input
                        type="radio"
                        id="phone-call"
                        name="contact-preference"
                        value="phone-call"
                        class="mr-2 h-5 w-5 border-gray-300 text-[#d5ba7f] focus:ring-[#d5ba7f]"
                        checked={formData["contact-preference"] === "phone-call"}
                        onclick={() => formData["contact-preference"] = "phone-call"}
                      />
                      <label for="phone-call" class="text-gray-700 text-lg">Phone call</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        type="radio"
                        id="email-only"
                        name="contact-preference"
                        value="email-only"
                        class="mr-2 h-5 w-5 border-gray-300 text-[#d5ba7f] focus:ring-[#d5ba7f]"
                        checked={formData["contact-preference"] === "email-only"}
                        onclick={() => formData["contact-preference"] = "email-only"}
                      />
                      <label for="email-only" class="text-gray-700 text-lg">Email Only</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hidden fields to map to server-side field names - keeping these for backward compatibility -->
        <input type="hidden" name="director-first-name" value={formData["director-name"].split(" ")[0] || ""} />
        <input type="hidden" name="director-last-name" value={formData["director-name"].split(" ").slice(1).join(" ") || ""} />
        <input type="hidden" name="family-member-first-name" value={formData["family-member-name"].split(" ")[0] || ""} />
        <input type="hidden" name="family-member-last-name" value={formData["family-member-name"].split(" ").slice(1).join(" ") || ""} />
        <input type="hidden" name="deceased-first-name" value={formData["loved-one-name"].split(" ")[0] || ""} />
        <input type="hidden" name="deceased-last-name" value={formData["loved-one-name"].split(" ").slice(1).join(" ") || ""} />

        <!-- Submit Button Area -->
        <div class="mt-8 flex justify-center">
          <button
            type="button"
            onclick={e => { e.preventDefault(); handleRecaptcha(e); }}
            class="bg-[#d5ba7f] hover:bg-[#c5aa6f] text-white text-xl font-bold py-4 px-10 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full max-w-lg"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <div class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </div>
            {:else}
              Submit Memorial Form
            {/if}
          </button>
        </div>

        <!-- Legal notice for reCAPTCHA -->
        <p class="text-sm text-gray-500 text-center mt-4">
          This site is protected by reCAPTCHA and the Google
          <a href="https://policies.google.com/privacy" class="underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          and
          <a href="https://policies.google.com/terms" class="underline" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          apply.
        </p>
      </form>
    </div>
  </div>
</section>