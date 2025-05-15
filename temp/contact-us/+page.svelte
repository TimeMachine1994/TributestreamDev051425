<script lang="ts">
	import PageLayout from '$lib/components/page-templates/page-layout.svelte';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	const siteKey = env.PUBLIC_RECAPTCHA ?? '';

	onMount(() => {
		const script = document.createElement('script');
		script.src = 'https://www.google.com/recaptcha/api.js';
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);
	});

	function onSubmit(token: string) {
		const form = document.getElementById('contact-form') as HTMLFormElement;
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'g-recaptcha-response';
		input.value = token;
		form.appendChild(input);
		form.submit();
	}
	
	export let data: PageData;
	
	// Initialize superForm with the data from load function
	const { form, errors, constraints, message, enhance, submitting } = superForm(data.form, {
		// Form is valid but there was a server error
		onError: ({ result }) => {
			console.error('Error submitting form:', result);
		},
		// Form is valid and was successfully submitted
		onUpdate: ({ form }) => {
			console.log('Form updated:', form);
		},
		// Reset the form after successful submission
		resetForm: true,
		// Scroll to the top of the form after submission
		scrollToError: true
	});
</script>

<PageLayout 
	title="Contact Us" 
	metaDescription="Get in touch with Tributestream for livestreaming services for celebrations of life. We're here to answer your questions and provide information."
>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-12">
		<!-- Contact Form -->
		<div class="card p-8 border border-surface-200-800">
			<h2 class="h2 mb-6">Send Us a Message</h2>
			
			{#if $message}
				<div class="card p-4 mb-6 preset-filled-success-500 animate-in fade-in slide-in-from-top-4">
					<p>{$message}</p>
				</div>
			{/if}
			
			<form id="contact-form" method="POST" action="?/sendMessage" use:enhance class="space-y-6">
				<div>
					<label for="name" class="label">
						<span class="label-text">Your Name</span>
						<input 
							type="text" 
							id="name" 
							bind:value={$form.name} 
							name="name"
							aria-invalid={$errors.name ? 'true' : undefined}
							{...$constraints.name}
							class="input"
						/>
					</label>
				</div>
				
				<div>
					<label for="email" class="label">
						<span class="label-text">Email Address</span>
						<input 
							type="email" 
							id="email" 
							bind:value={$form.email} 
							name="email"
							aria-invalid={$errors.email ? 'true' : undefined}
							{...$constraints.email}
							class="input"
						/>
					</label>
				</div>
				
				<div>
					<label for="phone" class="label">
						<span class="label-text">Phone Number</span>
						<input 
							type="tel" 
							id="phone" 
							bind:value={$form.phone} 
							name="phone"
							aria-invalid={$errors.phone ? 'true' : undefined}
							{...$constraints.phone}
							class="input"
						/>
					</label>
				</div>
				
				<div>
					<label for="message" class="label">
						<span class="label-text">Your Message</span>
						<textarea 
							id="message" 
							bind:value={$form.message} 
							name="message"
							aria-invalid={$errors.message ? 'true' : undefined}
							{...$constraints.message}
							rows="5"
							class="input"
						></textarea>
					</label>
				</div>
				
				<div>
					<button
						class="g-recaptcha btn preset-filled-primary-500 w-full flex items-center justify-center"
						data-sitekey={siteKey}
						data-callback="onSubmit"
						data-action="submit"
						disabled={$submitting}
					>
						{#if $submitting}
							<span>Sending...</span>
						{:else}
							<span>Send Message</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
		
		<!-- Contact Information -->
		<div>
			<h2 class="h2 mb-6">Get in Touch</h2>
			
			<div class="space-y-8">
				<div>
					<h3 class="h3 mb-2">Contact Information</h3>
					<p class="mb-2">
						<span class="text-primary-100 mr-2">Phone:</span>
						<a href="tel:+14072215922" class="anchor text-primary-100">+1 (407) 221-5922</a>
					</p>
					<p>
						<span class="text-primary-100 mr-2">Email:</span>
						<a href="mailto:Contact@tributestream.com" class="anchor text-primary-100">Contact@tributestream.com</a>
					</p>
				</div>
				
				<div>
					<h3 class="h3 mb-2">Office Hours</h3>
					<p class="mb-1">Monday – Friday: 10:00AM – 5:00PM EST</p>
					<p>Saturday – Sunday: 12:00PM – 5:00PM EST</p>
					<p class="mt-3 text-sm text-surface-700-300">
						If you need to contact us after hours, feel free to reach out via text or email.
					</p>
				</div>
				
				<div>
					<h3 class="h3 mb-2">Coverage Areas</h3>
					<p>
						Tributestream currently serves the following Florida counties: Orange, Lake, Osceola, 
						Seminole, Marion, Sumter, Volusia, Flagler, and Brevard.
					</p>
					<p class="mt-3 text-sm text-surface-700-300">
						Please call if your location is not listed to inquire about service availability.
					</p>
				</div>
				
				<div class="pt-6">
					<a href="/schedule-now" class="btn preset-filled-primary-500">
						Schedule a Consultation
					</a>
				</div>
			</div>
		</div>
	</div>
</PageLayout>