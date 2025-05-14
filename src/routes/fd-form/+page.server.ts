import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { validateFuneralDirectorForm } from '$lib/utils/form-validation';

function parseFormData(formData: FormData) {
  return {
    directorName: formData.get('director-name') as string,
    familyMemberName: formData.get('family-member-name') as string,
    lovedOneName: formData.get('loved-one-name') as string,
    email: formData.get('email-address') as string,
    phone: formData.get('phone-number') as string,
    contactPreference: formData.get('contact-preference') as string,
    locationName: formData.get('location-name') as string,
    locationAddress: formData.get('location-address') as string,
    memorialTime: formData.get('memorial-time') as string,
    memorialDate: formData.get('memorial-date') as string,

    // Hyphenated fields for validation compatibility
    'director-name': formData.get('director-name') as string,
    'family-member-name': formData.get('family-member-name') as string,
    'loved-one-name': formData.get('loved-one-name') as string,
    'email-address': formData.get('email-address') as string,
    'phone-number': formData.get('phone-number') as string,
    'contact-preference': formData.get('contact-preference') as string,
    'location-name': formData.get('location-name') as string,
    'location-address': formData.get('location-address') as string,
    'memorial-time': formData.get('memorial-time') as string,
    'memorial-date': formData.get('memorial-date') as string
  };
}

export const actions = {
  default: async ({ request, fetch }) => {
    // STEP 1: Parse
    const form = await request.formData();
    const data = parseFormData(form);

    // STEP 2: Validate
    const validation = validateFuneralDirectorForm(data);
    if (!validation.isValid) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        if (error.includes("Director's name")) {
          fieldErrors['director-name'] = error;
        } else if (error.includes("Loved one's name")) {
          fieldErrors['loved-one-name'] = error;
        } else if (error.includes("Email address")) {
          fieldErrors['email-address'] = error;
        } else if (error.includes("phone number")) {
          fieldErrors['phone-number'] = error;
        } else if (error.includes("Memorial location")) {
          fieldErrors['location-name'] = error;
        } else if (error.includes("memorial date")) {
          fieldErrors['memorial-date'] = error;
        }
      });

      return fail(400, {
        error: true,
        message: validation.errors.join('. '),
        errors: fieldErrors,
        formData: {
          'director-name': data.directorName || "",
          'family-member-name': data.familyMemberName || "",
          'loved-one-name': data.lovedOneName || "",
          'email-address': data.email || "",
          'phone-number': data.phone || "",
          'location-name': data.locationName || "",
          'location-address': data.locationAddress || "",
          'memorial-time': data.memorialTime || "",
          'memorial-date': data.memorialDate || ""
        }
      });
    }

    // STEP 3: Send email via SendGrid
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'dual', formData: data })
    });

    const result = await response.json();
    if (!result.success) {
      return fail(500, {
        error: true,
        message: result.message || 'Failed to send email.'
      });
    }

    // Success
    return {
      success: true,
      message: 'Your memorial form has been submitted successfully. A confirmation email has been sent.',
      isPartialSuccess: true
    };
  }
} satisfies Actions;
