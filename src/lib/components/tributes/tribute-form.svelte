<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Tribute } from '$lib/types/wp-models';
  
  // Props
  export let tribute: Partial<Tribute> = {};
  export let isSubmitting = false;
  export let errors: Record<string, string> = {};
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    submit: Partial<Tribute> | { errors: Record<string, string> };
    cancel: void;
  }>();
  
  // Form state
  let formData: Partial<Tribute> = {
    loved_one_name: '',
    phone_number: '',
    custom_html: '',
    status: 'draft',
    birth_date: '',
    death_date: '',
    obituary: '',
    ...tribute
  };
  
  // Status options
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'published', label: 'Published' }
  ];
  
  // Handle form submission
  function handleSubmit() {
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.loved_one_name?.trim()) {
      newErrors.loved_one_name = 'Loved one name is required';
    }
    
    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be in format: 123-456-7890';
    }
    
    // If there are errors, update the errors object and don't submit
    if (Object.keys(newErrors).length > 0) {
      dispatch('submit', { errors: newErrors });
      return;
    }
    
    // Submit the form
    dispatch('submit', formData);
  }
  
  // Handle cancel
  function handleCancel() {
    dispatch('cancel');
  }
  
  // Format phone number as user types
  function formatPhoneNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    
    if (value.length <= 3) {
      formData.phone_number = value;
    } else if (value.length <= 6) {
      formData.phone_number = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      formData.phone_number = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }
  }
</script>

<form class="tribute-form" on:submit|preventDefault={handleSubmit}>
  <div class="form-section">
    <h2>Basic Information</h2>
    
    <div class="form-group">
      <label for="loved_one_name">Loved One Name <span class="required">*</span></label>
      <input 
        type="text" 
        id="loved_one_name" 
        bind:value={formData.loved_one_name} 
        class:error={errors.loved_one_name}
        disabled={isSubmitting}
      />
      {#if errors.loved_one_name}
        <div class="error-message">{errors.loved_one_name}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="phone_number">Phone Number <span class="required">*</span></label>
      <input 
        type="text" 
        id="phone_number" 
        bind:value={formData.phone_number} 
        on:input={formatPhoneNumber}
        placeholder="123-456-7890"
        class:error={errors.phone_number}
        disabled={isSubmitting}
      />
      {#if errors.phone_number}
        <div class="error-message">{errors.phone_number}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="status">Status</label>
      <select 
        id="status" 
        bind:value={formData.status}
        disabled={isSubmitting}
      >
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="form-section">
    <h2>Life Dates</h2>
    <div class="form-group">
      <label for="birth_date">Birth Date</label>
      <input
        type="date"
        id="birth_date"
        bind:value={formData.birth_date}
        disabled={isSubmitting}
      />
    </div>
    <div class="form-group">
      <label for="death_date">Death Date</label>
      <input
        type="date"
        id="death_date"
        bind:value={formData.death_date}
        disabled={isSubmitting}
      />
    </div>
  </div>

  <div class="form-section">
    <h2>Obituary</h2>
    <div class="form-group">
      <label for="obituary">Obituary</label>
      <textarea
        id="obituary"
        bind:value={formData.obituary}
        rows="8"
        disabled={isSubmitting}
      ></textarea>
    </div>
  </div>
  
  <div class="form-section">
    <h2>Custom HTML</h2>
    <div class="form-group">
      <label for="custom_html">Custom HTML Content</label>
      <textarea 
        id="custom_html" 
        bind:value={formData.custom_html} 
        rows="10"
        disabled={isSubmitting}
      ></textarea>
      <div class="help-text">Enter custom HTML content for the tribute page.</div>
    </div>
  </div>
  
  <div class="form-actions">
    <button 
      type="button" 
      class="cancel-button" 
      on:click={handleCancel}
      disabled={isSubmitting}
    >
      Cancel
    </button>
    
    <button 
      type="submit" 
      class="submit-button" 
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Saving...' : tribute.id ? 'Update Tribute' : 'Create Tribute'}
    </button>
  </div>
</form>

<style>
  .tribute-form {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .form-section {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }
  
  h2 {
    font-size: 1.25rem;
    color: #333;
    margin-top: 0;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  .required {
    color: #e53e3e;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
  }
  
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
  
  input.error, select.error, textarea.error {
    border-color: #e53e3e;
  }
  
  .error-message {
    color: #e53e3e;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
  
  .help-text {
    color: #666;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .cancel-button, .submit-button {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }
  
  .cancel-button {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
  }
  
  .submit-button {
    background-color: #4a90e2;
    color: white;
    border: none;
  }
  
  .cancel-button:hover {
    background-color: #e0e0e0;
  }
  
  .submit-button:hover {
    background-color: #3a80d2;
  }
  
  .cancel-button:disabled, .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>