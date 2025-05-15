# Next.js Build Error Fix Guide

This guide addresses the common errors you're seeing during Vercel deployments with your Next.js application.

## Common Errors

### 1. Functions Passed to Client Components

```
Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".
```

This error occurs when functions from Server Components are being passed to Client Components without the proper "use server" directive.

### 2. Use Client and Static Params Conflict

```
Error: Page "/[lang]/activities/[slug]/page" cannot use both "use client" and export function "generateStaticParams()".
```

This error occurs when a page is marked as a Client Component with "use client" but also exports a `generateStaticParams()` function, which is only allowed in Server Components.

### 3. Metadata Export in Client Component

```
Error: You are attempting to export "metadata" from a component marked with "use client", which is disallowed.
```

This occurs when a layout or page attempts to export a metadata object but is also marked with "use client".

### 4. Use Server Directive Placement

```
Error: The "use server" directive must be at the top of the file.
```

This happens when "use server" directives are placed in the middle of a file rather than at the top.

### 5. Only Async Functions in Use Server Files

```
Error: Only async functions are allowed to be exported in a "use server" file.
```

This occurs when a file with the "use server" directive at the top tries to export constants like `dynamic`, `revalidate`, or `fetchCache`. In files with the "use server" directive at the top, only async functions can be exported.

## Fix Scripts

Six fix scripts have been created to address different aspects of these issues:

1. **fix-build-errors.js** - Fixes the global error component by adding "use client" directive
2. **fix-nextjs-components.js** - Adds "use client" directives to components that need it
3. **fix-functions.js** - Adds "use server" directives to functions that are passed from Server to Client Components
4. **fix-static-params-conflicts.js** - Resolves conflicts between "use client" and generateStaticParams in the same file
5. **fix-api-and-metadata.js** - Fixes layouts with metadata exports and API routes with misplaced "use server" directives
6. **fix-server-exports.js** - Fixes API routes that have "use server" at the top but also export constants

## How to Use

You can run these scripts individually:

```bash
# Fix global error component issues
npm run fix-build

# Fix components missing "use client" directive
npm run fix-components

# Fix functions missing "use server" directive
npm run fix-functions

# Fix conflicts between "use client" and generateStaticParams
npm run fix-static-params

# Fix API routes and layouts with metadata
npm run fix-api-metadata

# Fix API routes with "use server" and config exports
npm run fix-server-exports

# Run all fixes at once
npm run fix-all
```

After running these fixes, rebuild your application:

```bash
npm run build
```

Or use the all-in-one fix and rebuild script:

```bash
npm run fix-and-rebuild
```

## Important Next.js Concepts

### Server Components and Client Components

In Next.js 14, there are two types of components:

- **Server Components**: Run only on the server, can't use hooks or browser APIs
- **Client Components**: Run on both server and client, can use hooks and browser APIs

### When to Use "use client" and "use server"

- Add `'use client'` at the top of a file to mark all components in that file as Client Components.
- Add `'use server'` at the top of a file or before a function to mark it as a Server Action that can be called from Client Components.
- In files with `'use server'` at the top, only async functions can be exported, not constants. Put config exports before the directive.

### Common Patterns to Fix

1. **The Global Error Component Issue**:
   - The global error component must be a Client Component.
   - Add `'use client'` at the top of `app/global-error.tsx`.

2. **Functions Passed to Client Components**:
   - Functions from Server Components must be marked with `'use server'` to be used in Client Components.
   - Example: `export async function handleSubmit() {...}` becomes:
     ```js
     'use server';
     export async function handleSubmit() {...}
     ```

3. **Components That Should Be Client Components**:
   - Any component that uses hooks, event handlers, or browser APIs needs to be a Client Component.
   - Add `'use client'` at the top of these component files.

4. **Static Params Conflict**:
   - Files that export `generateStaticParams()` must be Server Components.
   - Remove `'use client'` from any file that exports this function.

5. **Metadata and Layouts**:
   - Layout files that export metadata must be Server Components.
   - Remove `'use client'` from any layout file that exports metadata.

6. **API Route Files**:
   - If using `'use server'` in API routes, it must be at the top of the file.
   - Move any `'use server'` directive to the top of the file.

7. **API Routes with Config Exports**:
   - In files that export constants like `dynamic`, `revalidate`, or `fetchCache`, the `'use server'` directive must be placed after these exports.
   - Move the `'use server'` directive to after the config exports but before any async functions.

## Further Resources

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Server and Client Components](https://nextjs.org/docs/getting-started/react-essentials)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
