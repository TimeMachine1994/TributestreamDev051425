# Backbone.js Integration with SvelteKit

This directory contains the Backbone.js integration with SvelteKit for WordPress REST API interaction. The integration provides a way to interact with WordPress data using Backbone.js models and collections, while leveraging SvelteKit's features.

## Dependencies

Before using this integration, you need to install the following dependencies:

```bash
npm install backbone underscore jwt-decode
npm install --save-dev @types/backbone @types/underscore @types/jwt-decode
```

## Structure

The integration consists of the following files:

- `wp-models.ts`: TypeScript interfaces for WordPress entities
- `wp-backbone.ts`: Backbone.js models and collections for WordPress entities
- `../services/auth-service.ts`: Authentication service for WordPress JWT
- `../services/wp-backbone-service.ts`: Service for using Backbone.js models and collections in SvelteKit components

## Usage

### Initializing Backbone.js

Before using the Backbone.js models and collections, you need to initialize Backbone.js. This is typically done in a layout component or in the root layout:

```typescript
import { onMount } from 'svelte';
import { initializeBackbone } from '$lib/services/wp-backbone-service';

onMount(() => {
  initializeBackbone();
});
```

### Authentication

To authenticate with the WordPress API, use the `authStore` from the `auth-service.ts` file:

```typescript
import { authStore } from '$lib/services/auth-service';

// Login
const success = await authStore.login(username, password);

// Logout
authStore.logout();

// Check if the token is still valid
const isValid = authStore.checkAuth();

// Access the auth state
const { token, user, isAuthenticated } = $authStore;
```

### Using the Services

The `wp-backbone-service.ts` file provides services for working with WordPress entities:

```typescript
import { postService, pageService, tributeService } from '$lib/services/wp-backbone-service';

// Get all tributes
const tributes = await tributeService.getTributes();

// Get a single tribute
const tribute = await tributeService.getTribute(id);

// Get a tribute by slug
const tribute = await tributeService.getTributeBySlug(slug);

// Create a new tribute
const newTribute = await tributeService.createTribute({
  user_id: 1,
  loved_one_name: 'John Doe',
  phone_number: '123-456-7890'
});

// Update an existing tribute
const updatedTribute = await tributeService.updateTribute(id, {
  loved_one_name: 'Jane Doe'
});

// Delete a tribute
await tributeService.deleteTribute(id);
```

Similar methods are available for posts and pages through the `postService` and `pageService` objects.

### Direct Access to Models and Collections

If you need more control, you can directly use the Backbone.js models and collections:

```typescript
import { TributeModel, TributesCollection } from '$lib/models/wp-backbone';

// Create a new model instance
const tribute = new TributeModel({
  user_id: 1,
  loved_one_name: 'John Doe',
  phone_number: '123-456-7890'
});

// Save the model to the server
await tribute.save();

// Create a new collection
const tributes = new TributesCollection();

// Fetch all tributes
await tributes.fetch();

// Access the models in the collection
const models = tributes.models;
```

## Example Components

The integration includes example components to demonstrate how to use the services:

- `../components/tribute-list.svelte`: A component that displays a list of tributes
- `../../routes/tributes/+page.svelte`: A page that uses the TributeList component
- `../../routes/login/+page.svelte`: A login page that uses the authStore

## Notes

- The integration uses the existing API proxy endpoints in `src/routes/api` to interact with the WordPress REST API.
- JWT authentication is used to secure the API requests.
- The integration is designed to work with the WordPress REST API and custom endpoints for tributes.