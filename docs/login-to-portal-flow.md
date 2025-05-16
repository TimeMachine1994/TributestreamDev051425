# Login → My Portal Data Flow

This document describes how data flows from the login form to the "My Portal" page in the SvelteKit application.

## 1. Login Form

In [`src/routes/login/+page.svelte:1`](src/routes/login/+page.svelte:1), the login form uses SvelteKit's `use:enhance` to handle submissions via JavaScript:

- Binds `email` and `password` inputs to component state.
- Uses `<form method="POST" use:enhance(...)>` to intercept the submit event.

On submit, the form POSTs to the **default action** in [`src/routes/login/+page.server.ts:15`](src/routes/login/+page.server.ts:15).

## 2. Server Form Action

In [`src/routes/login/+page.server.ts:15`](src/routes/login/+page.server.ts:15), the `actions.default` function:

1. Reads and validates `request.formData()` (lines 20–31).
2. Proxies credentials to the internal API endpoint via `fetch('/api/auth/login', …)` ([`src/routes/api/auth/login/+server.ts:1`](src/routes/api/auth/login/+server.ts:1)).
3. If the API response is not OK, returns `fail(status, { error })`. The form enhancer then displays the error.
4. If the API response is OK, throws `redirect(303, '/my-portal')`.

## 3. Client-Side Redirect

The form enhancer automatically follows the 303 redirect and navigates the browser to `/my-portal`.

## 4. Portal Page Load

In [`src/routes/my-portal/+page.server.ts:1`](src/routes/my-portal/+page.server.ts:1), the `load` function:

- Reads `locals.user` to ensure the user is authenticated.
- Fetches the user’s `tributes`.
- If no `locals.user`, throws a redirect back to `/login`.

## 5. Portal Page Component

In [`src/routes/my-portal/+page.svelte:1`](src/routes/my-portal/+page.svelte:1), the component:

- Receives `{ data: { user, tributes } }` as a prop.
- Renders the appropriate sub-component (`ContributorPortal`, `FuneralDirectorPortal`, etc.) based on `data.user.role`.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant C as Login Component
    participant S as Login Action
    participant API as /api/auth/login
    participant P as Portal Load
    participant V as Portal Component

    U->>C: submit(email, password)
    Note over C,S: use:enhance intercepts
    C->>S: POST to action.default
    S->>API: POST {identifier, password}
    API-->>S: 200 OK + auth cookie
    alt success
        S-->>C: 303 Redirect to /my-portal
        C->>P: GET /my-portal
        P-->>V: 200 + { user, tributes }
        V->>U: render portal based on data.user.role
    else failure
        S-->>C: 400 + {error}
        C->>C: display error
    end