# Tributestream Homepage Implementation

This document outlines the implementation of the dual-function homepage interface, which allows users to either search for existing memorials or create new ones.

## Features Implemented

### 1. Search Functionality
- **Frontend:** Search form with input field and search button
- **Backend:** Server action that queries the tributes API with search term
- **Results Display:** Responsive grid of matching memorials with links

### 2. Quick Memorial Creation
- **Frontend:** Expandable form with essential memorial fields
- **Backend:** Server action for user registration and tribute creation
- **UX Flow:** Form validation, feedback, and redirect to the new memorial page

## Implementation Details

### Key Files
- `src/routes/+page.svelte` - Homepage component with search and memorial creation interfaces
- `src/routes/+page.server.ts` - Server actions for search and memorial creation
- `src/lib/utils/form-validation.ts` - Added memorial form validation function

### User Flow

1. **Search Flow:**
   - User enters a name in the search field
   - Submits the form via the "Search Memorials" button
   - Results are returned and displayed without page reload
   - User can click on a result to view the memorial
   - Or create a new memorial if no matches are found

2. **Creation Flow:**
   - User clicks "Create Memorial" button
   - Fills out the quick creation form with essential details
   - Form validates in real-time with feedback
   - On submission, backend creates user, tribute, and metadata
   - User is redirected to the new memorial page

### Error Handling

- Invalid form data shows specific validation errors
- API failures provide actionable error messages
- Redirect pattern properly handles navigation after creation
- Form data is preserved on failed submission attempts

## Technical Notes

### Search Implementation

The search functionality uses progressive enhancement with SvelteKit's form actions:

```typescript
// Server -- NOT CORRECT
export const actions = {
  search: async ({ request, fetch }) => {
    const formData = await request.formData();
    const searchTerm = formData.get('searchTerm');
    
    // Call API and return results
    const response = await fetch(`/api/tributes?search=${searchTerm}`);
    const results = await response.json();
    
    return { search: true, results: results.tributes, term: searchTerm };
  }
};

// Client
<form method="POST" action="?/search" use:enhance>
  <input name="searchTerm" bind:value={searchTerm} />
  <button type="submit">Search</button>
</form>
```

### Memorial Creation Implementation

The memorial creation process follows these steps:

1. Register a new user account with the provided email
2. Authenticate and get JWT token
3. Store memorial metadata
4. Create the tribute/memorial record
5. Send welcome email with credentials
6. Redirect to the new memorial page

```typescript
// Form submission with enhanced client-side handling
<form 
  method="POST" 
  action="?/createMemorial" 
  use:enhance={() => {
    isSubmitting = true;
    return ({ update }) => {
      update({ reset: false });
      isSubmitting = false;
    };
  }}
>
  <!-- Form fields -->
</form>
```

## Usage

The homepage provides a seamless way for users to either find existing memorials or create new ones without complex workflows. The implementation leverages SvelteKit's form actions for progressive enhancement, ensuring that the core functionality works even without JavaScript.

## Accessibility Considerations

- All form fields have proper labels and ARIA attributes
- Error messages are clearly displayed and associated with inputs
- Focus management is maintained during form interaction
- Color contrast meets WCAG standards

## Future Enhancements

1. Add pagination controls for search results
2. Implement auto-suggestions for search
3. Add social sharing options for new memorials
4. Include option to upload a photo during quick creation
