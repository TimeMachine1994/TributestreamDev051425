# My Portal Authentication & Data Load Plan

## Overview

This document outlines the steps to implement the server-side `load` function for `/my-portal`, including:

- Authenticating the user via JWT stored in an HTTP-only cookie  
- Fetching the full user profile (with role) from Strapi  
- Loading user-specific tributes from Strapi  
- Returning data for role-based rendering in the Svelte component  

## Flow Diagram

```mermaid
flowchart TD
  A[Incoming Request to /my-portal] --> B[Extract JWT from Cookie]
  B --> C{JWT present?}
  C -->|No| D[Redirect to /login]
  C -->|Yes| E[Verify JWT]
  E --> F{Valid?}
  F -->|No| D
  F -->|Yes| G[Fetch User from Strapi (populate role)]
  G --> H[Fetch User Tributes from Strapi]
  H --> I[Return { user, tributes } to Page]
```

## Detailed Steps

1. **Extract JWT**  
   - `const raw = cookies.get('jwt')`  
   - `const token = extractTokenFromCookie(\`jwt=${raw}\`);`

2. **Verify JWT**  
   - `const user = await getUserFromToken(token);`  
   - Redirect to `/login` if missing or invalid.

3. **Fetch Full User Profile**  
   - Use your Strapi client or raw fetch to GET `/users/me?populate=role` with the JWT:  
     ```ts
     const userProfile = await strapiClient.fetch('users/me', { populate: ['role'] });
     // or:
     const userRes = await fetch(`/api/users/me?populate=role`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     ```
   - Map the returned data into `{ id, name, email, role }`.

4. **Fetch Tributes**  
   - `const tributesRes = await fetch(\`/api/tributes?filters[user][id][$eq]=${me.id}\`, {
       headers: { Authorization: \`Bearer ${token}\` }
     });`
   - If OK, parse JSON and map the `data` array into tribute objects.

5. **Return Data**  
   - `return { user: me, tributes };`

## Error Handling

- Redirect on missing/invalid token.  
- Throw `error(500)` on any Strapi fetch failures.

## Next Steps

1. Review this plan.  
2. Switch to Code mode to implement the server load function.