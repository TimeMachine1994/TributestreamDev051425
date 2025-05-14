import type { MasterStore, DirectorInfo, LovedOneInfo, UserInfo, MemorialInfo, LiveStreamInfo, PackageInfo, BillingInfo } from '$lib/stores/master-store.svelte';

/**
 * Type for common form action response
 */
export interface FormActionResult {
  success?: boolean;
  error?: boolean;
  message?: string;
  data?: Record<string, any>;
  redirectTo?: string;
  values?: Record<string, any>;
}

/**
 * Generic validation function for required fields
 * @param formData Form data to validate
 * @param requiredFields Array of required field names
 * @returns Validation result with error message if any fields are missing
 */
export function validateRequiredFields(
  formData: FormData,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = formData.get(field) as string;
    if (!value || !value.trim()) {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Process a form action response to update the master store
 * This should be used in page components when handling form action results
 *
 * @param form The form result from the action
 * @param masterStore The master store instance
 * @param nextPage Optional URL to navigate to on success (not needed if using server redirects)
 */
export function processFormActionResult(
  form: FormActionResult | null | undefined,
  masterStore: MasterStore,
  nextPage?: string
): void {
  // If form is not successful or has no data, don't proceed
  if (!form?.success || !form?.data) return;

  // Update different sections of the master store based on the data
  if (form.data.directorInfo) {
    // Handle potential new field naming format
    if (form.data.directorInfo["director-name"] && !form.data.directorInfo.directorFirstName) {
      // Split the full name into first and last name for compatibility with existing code
      const nameParts = form.data.directorInfo["director-name"].split(' ');
      form.data.directorInfo.directorFirstName = nameParts[0] || '';
      form.data.directorInfo.directorLastName = nameParts.slice(1).join(' ') || '';
    }
    
    masterStore.updateDirectorInfo(form.data.directorInfo);
  }

  if (form.data.lovedOneInfo) {
    masterStore.updateLovedOneInfo(form.data.lovedOneInfo);
  }

  if (form.data.userInfo) {
    masterStore.updateUserInfo(form.data.userInfo);
  }

  if (form.data.memorialInfo) {
    masterStore.updateMemorialInfo(form.data.memorialInfo);
  }

  if (form.data.liveStreamInfo) {
    masterStore.updateLiveStreamInfo(form.data.liveStreamInfo);
  }

  if (form.data.packageInfo) {
    masterStore.updatePackageInfo(form.data.packageInfo);
  }

  if (form.data.billingInfo) {
    masterStore.updateBillingInfo(form.data.billingInfo);
  }
  
  if (form.data.scheduleDays) {
    masterStore.updateScheduleDays(form.data.scheduleDays);
  }

  // Persist changes to localStorage
  masterStore.saveToLocalStorage();

  // Note: We don't need to handle redirects here anymore
  // When using SvelteKit's redirect() function, the browser
  // will automatically follow the HTTP redirect from the server
}