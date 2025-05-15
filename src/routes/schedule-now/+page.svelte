<script lang="ts">
  import PageLayout from '$lib/components/page-templates/page-layout.svelte';
  import SuccessModal from '$lib/components/success-modal.svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';
  
  export let data: PageData;
  
  // Debug: Log the form data received from the server
  console.log('Form data received from server:', data.form);
  
  // State for success modal
  let showSuccessModal = false;
  let successMessage = "";
  
  // Initialize the superForm
  const { form, errors, constraints, message, enhance, submitting } = superForm(data.form, {
    // Form is valid but there was a server error
    onError: ({ result }) => {
      console.error('Error submitting form:', result);
    },
    // Form is valid and was successfully submitted
    onUpdate: ({ form }) => {
      console.log('Form updated:', form);
      
      // Check if the form was successfully submitted
      if ($message) {
        successMessage = $message;
        showSuccessModal = true;
      }
    },
    // Reset the form after successful submission
    resetForm: true,
    // Scroll to the top of the form after submission
    scrollToError: true,
    onSubmit: ({ formData, cancel }) => {
      console.log('Form submission started with data:', Object.fromEntries(formData));
      
      // Add all form fields to the formData
      for (const [key, value] of Object.entries($form)) {
        if (value !== undefined && value !== null) {
          formData.set(key, value.toString());
        }
      }
      
      console.log('Enhanced form data:', Object.fromEntries(formData));
      // Don't cancel the submission
      return;
    },
    onResult: ({ result }) => {
      console.log('Form submission result:', result);
    }
  });
  
  // Create a reactive variable to display validation errors
  $: errorList = Object.entries($errors).flatMap(([field, fieldErrors]) =>
    fieldErrors ? fieldErrors.map(error => ({ field, error })) : []
  );
  
  // Check if we have any errors
  $: hasErrors = errorList.length > 0;
  
  const dateOptions = {
    min: new Date().toISOString().split('T')[0] // Today's date as minimum
  };
  const siteKey = env.PUBLIC_RECAPTCHA ?? '';

  // Load the reCAPTCHA script asynchronously and safely
  onMount(() => {
    console.log('🧠 onMount: Preparing to load reCAPTCHA script...');

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    console.log('📦 reCAPTCHA script appended to document.head');

    // Safe fallback for grecaptcha.ready in case grecaptcha is not yet defined
    if (typeof grecaptcha === 'undefined') {
      console.warn('⚠️ grecaptcha is undefined at mount time. Creating fallback shim...');
      grecaptcha = {
        ready: function (cb) {
          const c = '___grecaptcha_cfg';
          window[c] = window[c] || {};
          (window[c]['fns'] = window[c]['fns'] || []).push(cb);
          console.log('✅ Callback pushed to grecaptcha fallback queue');
        }
      };
    }
  });

  // Hide reCAPTCHA badge
  onMount(() => {
    const style = document.createElement('style');
    style.innerHTML = '.grecaptcha-badge { visibility: hidden; }';
    document.head.appendChild(style);
  });

  function onSubmit(token: string) {
    const form = document.querySelector('form[action="?/submit"]') as HTMLFormElement;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'g-recaptcha-response';
    input.value = token;
    form.appendChild(input);
    form.submit();
  }

  // Handle reCAPTCHA v3 execution and form submission
  async function handleRecaptcha() {
    console.log('🛡️ handleRecaptcha: Waiting for grecaptcha to be ready...');
    grecaptcha.ready(async () => {
      console.log('✅ grecaptcha is ready. Executing...');
      try {
        const token = await grecaptcha.execute(siteKey, { action: 'submit' });
        console.log('🔐 Token received from grecaptcha:', token);
        onSubmit(token);
      } catch (err) {
        console.error('❌ Error executing grecaptcha:', err);
      }
    });
  }
</script>

<PageLayout 
  title="Schedule Now" 
  metaDescription="Schedule a consultation for Tributestream's professional livestreaming service for celebrations of life and memorial services."
>
  <section class="content-section">
    <p class="text-lg mb-10">
      Ready to provide a meaningful livestreaming experience for your celebration of life event? 
      Fill out the form below to request a consultation with our team. We'll respond within 24 hours 
      to discuss your needs and arrange our livestreaming services.
    </p>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <!-- Booking Form -->
      <div class="col-span-2 bg-zinc-900 p-8 rounded-lg border border-[#D5BA7F]/20">
        <h2 class="text-2xl text-[#D5BA7F] font-semibold mb-6">Request a Consultation</h2>
        
        {#if $message}
          <div class="bg-emerald-900/30 p-4 rounded-md mb-6 border border-emerald-500/30 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
            <p class="text-emerald-300">{$message}</p>
          </div>
        {/if}
        
        {#if hasErrors}
          <div class="bg-red-900/30 p-4 rounded-md mb-6 border border-red-500/30">
            <p class="text-red-300 font-medium mb-2">Please correct the following errors:</p>
            <ul class="list-disc pl-5 space-y-1">
              {#each errorList as { field, error }}
                <li class="text-red-300">{field}: {error}</li>
              {/each}
            </ul>
          </div>
        {/if}
        
        <form method="POST" action="?/submit" use:enhance class="space-y-6">
          <!-- Contact Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="name" class="block text-sm font-medium mb-2">Your Name*</label>
              <input 
                type="text" 
                id="name" 
                bind:value={$form.name}
                aria-invalid={$errors.name ? 'true' : undefined}
                {...$constraints.name}
                class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-transparent"
              />
            </div>
            
            <div>
              <label for="phone" class="block text-sm font-medium mb-2">Phone Number*</label>
              <input 
                type="tel" 
                id="phone" 
                bind:value={$form.phone}
                aria-invalid={$errors.phone ? 'true' : undefined}
                {...$constraints.phone}
                class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium mb-2">Email Address*</label>
            <input 
              type="email" 
              id="email" 
              bind:value={$form.email}
              aria-invalid={$errors.email ? 'true' : undefined}
              {...$constraints.email}
              class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-transparent"
            />
          </div>
          
          <div>
            <label for="contact-method" class="block text-sm font-medium mb-2">Preferred Contact Method</label>
            <div id="contact-method" class="flex space-x-4">
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  bind:group={$form.preferredContactMethod}
                  value="email"
                  class="form-radio text-[#D5BA7F] focus:ring-[#D5BA7F]"
                />
                <span class="ml-2">Email</span>
              </label>
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  bind:group={$form.preferredContactMethod}
                  value="phone"
                  class="form-radio text-[#D5BA7F] focus:ring-[#D5BA7F]"
                />
                <span class="ml-2">Phone</span>
              </label>
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  bind:group={$form.preferredContactMethod}
                  value="text"
                  class="form-radio text-[#D5BA7F] focus:ring-[#D5BA7F]"
                />
                <span class="ml-2">Text</span>
              </label>
            </div>
          </div>
          
          <hr class="border-zinc-700" />
          
          <!-- Service Details -->
          <div>
            <h3 class="text-lg font-medium mb-4 text-[#D5BA7F]">Event Details</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="serviceDate" class="block text-sm font-medium mb-2">Event Date</label>
                <input 
                  type="date" 
                  id="serviceDate" 
                  bind:value={$form.serviceDate}
                  aria-invalid={$errors.serviceDate ? 'true' : undefined}
                  {...$constraints.serviceDate}
                  min={dateOptions.min}
                  class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-transparent"
                />
              </div>
              
              <div>
                <label for="serviceTime" class="block text-sm font-medium mb-2">Event Time</label>
                <input 
                  type="time" 
                  id="serviceTime" 
                  bind:value={$form.serviceTime}
                  aria-invalid={$errors.serviceTime ? 'true' : undefined}
                  {...$constraints.serviceTime}
                  class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label for="serviceLocation" class="block text-sm font-medium mb-2">Event Location</label>
              <input 
                type="text" 
                id="serviceLocation" 
                placeholder="Venue Name and Address"
                bind:value={$form.serviceLocation}
                aria-invalid={$errors.serviceLocation ? 'true' : undefined}
                {...$constraints.serviceLocation}
                class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label for="attendees" class="block text-sm font-medium mb-2">Estimated Number of Remote Viewers</label>
            <input 
              type="number" 
              id="attendees" 
              bind:value={$form.attendees}
              aria-invalid={$errors.attendees ? 'true' : undefined}
              {...$constraints.attendees}
              placeholder="Approximate number"
              min="0"
              class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-transparent"
            />
          </div>
          
          <div>
            <label for="serviceType" class="block text-sm font-medium mb-2">Type of Service</label>
            <select 
              id="serviceType" 
              bind:value={$form.serviceType}
              aria-invalid={$errors.serviceType ? 'true' : undefined}
              {...$constraints.serviceType}
              class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-transparent"
            >
              <option value="funeral">Funeral Service</option>
              <option value="memorial">Memorial Service</option>
              <option value="graveside">Graveside Service</option>
              <option value="celebration">Celebration of Life</option>
              <option value="other">Other (Please specify in notes)</option>
            </select>
          </div>
          
          <div>
            <label for="additionalInfo" class="block text-sm font-medium mb-2">Additional Information</label>
            <textarea 
              id="additionalInfo" 
              bind:value={$form.additionalInfo}
              aria-invalid={$errors.additionalInfo ? 'true' : undefined}
              {...$constraints.additionalInfo}
              rows="4"
              placeholder="Please share any special requests or questions you may have."
              class="w-full bg-black border border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5BA7F] focus:border-transparent"
            ></textarea>
          </div>
          
          <div>
            <button
              class="gold-btn w-full flex items-center justify-center"
              on:click|preventDefault={handleRecaptcha}
              disabled={$submitting}
            >
              {#if $submitting}
                <span>Submitting Request...</span>
              {:else}
                <span>Request Consultation</span>
              {/if}
            </button>

            <!-- Legal notice for reCAPTCHA -->
            <p class="text-xs text-zinc-400 text-center mt-2">
              This site is protected by reCAPTCHA and the Google
              <a href="https://policies.google.com/privacy" class="underline" target="_blank">Privacy Policy</a> and
              <a href="https://policies.google.com/terms" class="underline" target="_blank">Terms of Service</a> apply.
            </p>
          </div>
        </form>
      </div>
      
      <!-- Sidebar Information -->
      <div>
        <div class="bg-zinc-900 p-6 rounded-lg border border-[#D5BA7F]/20 mb-8">
          <h3 class="text-xl text-[#D5BA7F] font-medium mb-4">Our Process</h3>
          <ol class="space-y-4 pl-6 list-decimal">
            <li>Fill out the scheduling request form</li>
            <li>Receive a confirmation call or email within 24 hours</li>
            <li>Schedule a detailed consultation to discuss your needs</li>
            <li>Finalize service details and receive a confirmation</li>
            <li>Our team arrives early on the service day for setup</li>
          </ol>
        </div>
        
        <div class="bg-zinc-900 p-6 rounded-lg border border-[#D5BA7F]/20">
          <h3 class="text-xl text-[#D5BA7F] font-medium mb-4">Need Help?</h3>
          <p class="mb-4">If you prefer to schedule by phone or have immediate questions, please call us directly:</p>
          <p class="text-xl">
            <a href="tel:+14072215922" class="hover:text-[#D5BA7F] transition-colors">+1 (407) 221-5922</a>
          </p>
          <p class="mt-4 text-sm text-gray-400">
            Available Monday – Friday: 10:00AM – 5:00PM EST<br>
            Saturday – Sunday: 12:00PM – 5:00PM EST
          </p>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Success Modal -->
  <SuccessModal
    show={showSuccessModal}
    title="Thank You!"
    message={successMessage || "Your consultation request has been sent. We'll be in touch soon!"}
    redirectUrl="/"
  />
</PageLayout>