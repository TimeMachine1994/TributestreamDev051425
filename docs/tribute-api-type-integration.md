# Tribute API Type Integration Plan

## Objective

Update `src/routes/api/tributes/+server.ts` to use the generated Strapi types from `src/lib/types/generated/contentTypes.d.ts`, specifically the `ApiTributeTribute` type, to ensure type safety and clarity in the tribute API handlers.

---

## 1. Understand the Target Type

From `contentTypes.d.ts`, the `ApiTributeTribute` interface defines the structure of a tribute:

```ts
export interface ApiTributeTribute extends Struct.CollectionTypeSchema {
  collectionName: 'tributes';
  info: { ... };
  options: { draftAndPublish: true };
  attributes: {
    name: string;
    description: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    owner: Relation<'manyToOne', 'plugin::users-permissions.user'>;
    createdAt: Date;
    updatedAt: Date;
    ...
  };
}
```

---

## 2. Define Tribute Types

Create a new file `src/lib/types/tribute.ts` to define the runtime-friendly types:

```ts
// src/lib/types/tribute.ts
import type { ApiTributeTribute } from '$lib/types/generated/contentTypes';

export type TributeAttributes = ApiTributeTribute['attributes'];

export interface Tribute {
  id: number;
  attributes: TributeAttributes;
}
```

---

## 3. Update `searchTributes` and `createTribute` Return Types

Ensure the functions in `src/lib/server/strapi/tribute.ts` return typed data:

```ts
// src/lib/server/strapi/tribute.ts
import type { Tribute } from '$lib/types/tribute';

export async function searchTributes(...): Promise<{ items: Tribute[]; meta: PaginationMeta }> { ... }

export async function createTribute(...): Promise<Tribute> { ... }
```

---

## 4. Refactor `+server.ts` to Use Types

Update the GET and POST handlers to use the `Tribute` type:

```ts
import type { Tribute } from '$lib/types/tribute';

export const GET: RequestHandler = async (...) => {
  ...
  const { items, meta } = await searchTributes(...);
  return json({
    tributes: items as Tribute[],
    ...
  });
};

export const POST: RequestHandler = async (...) => {
  ...
  const tribute = await createTribute(...);
  return json({ tribute: tribute as Tribute });
};
```

---

## 5. Optional: Validate Input Payload

Define a `CreateTributePayload` type and validate the request body:

```ts
export interface CreateTributePayload {
  name: string;
  description: string;
  status?: 'draft' | 'published' | 'archived';
}
```

Use Zod or a similar library to validate the payload before calling `createTribute`.

---

## 6. Benefits

- Strong typing for tribute data
- Autocompletion and validation in IDE
- Reduced runtime errors
- Easier refactoring and documentation