# Strapi Login Page Integration Plan

This document outlines the steps to refactor the login route  
to fully integrate the Strapi Client Backend using SvelteKit locals,  
load functions, and form actions.

## Files Involved
- [`+page.svelte`](src/routes/login/+page.svelte:1)  
- [`+page.server.ts`](src/routes/login/+page.server.ts:1)  
- [`src/hooks.server.ts`](src/hooks.server.ts:1)  
- [`src/app.d.ts`](src/app.d.ts:1)  

## Architecture Overview

```mermaid
flowchart LR
  subgraph Server
    hooks[hooks.handle] -->|reads jwt| locals
    loginAction[+page.server.ts action] -->|StrapiClient.login(credentials)| data
    loginAction -->|set cookies| cookies
  end
  subgraph Routing
    pageLoad[+page.server.ts load] -->|if locals.user| Redirect[/my-portal/]
  end
  subgraph Client
    LoginPage[+page.svelte] -->|use:enhance| loginAction
    LoginPage -->|props: error, form| pageLoad
  end
```

## Step-by-step Implementation Plan

1. Type Definitions  
   - Edit [`src/app.d.ts`](src/app.d.ts:1) to extend `App.Locals`:
     ```ts
     declare namespace App {
       interface Locals {
         user?: import('$lib/server/strapi/user').StrapiUser;
       }
     }
     ```

2. hooks.server.ts Guard  
   - Confirm that [`src/hooks.server.ts`](src/hooks.server.ts:1) populates `event.locals.user`  
     using `getUserFromJwt(token)` which returns `StrapiUser | null`.

3. +page.server.ts Load & Action  
   - Add an exported `load({ locals })` in [`+page.server.ts`](src/routes/login/+page.server.ts:1)  
     that throws `redirect(303, '/my-portal')` if `locals.user` is truthy.  
   - Refactor `actions.default` to call `login({ identifier, password })`  
     from `$lib/server/strapi/client` instead of `fetch('/api/auth/login')`.  
   - On success, set `jwt` and `user` cookies; on failure, `return fail(status, { error })`.

4. +page.svelte UI Integration  
   - Remove manual `fetch` and local `handleLogin` in  
     [`+page.svelte`](src/routes/login/+page.svelte:1).  
   - Use `<form method="POST" use:enhance>` to invoke the default action.  
   - Access `form` and `error` from `$page.data` and display errors appropriately.

5. Testing & Validation  
   - Verify successful login via Strapi and that cookies are set.  
   - Confirm redirect when already authenticated.  
   - Ensure error messages surface correctly.