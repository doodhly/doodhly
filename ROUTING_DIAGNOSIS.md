# Routing Diagnosis & Fix Plan

## 1. Current Route Structure

```text
src/app/
├── layout.tsx (ROOT) - ⚠️ Blocks rendering via AuthProvider
├── not-found.tsx
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx (/)
│   └── products/page.tsx
├── (auth)/
│   ├── layout.tsx
│   └── login/page.tsx
├── (customer)/
│   ├── layout.tsx - ⚠️ "use client" with direct redirect logic
│   └── app/
│       ├── dashboard/page.tsx
│       ├── profile/page.tsx
│       └── ...
├── (admin)/
│   ├── layout.tsx - ⚠️ "use client" with direct redirect logic
│   └── admin/
│       ├── page.tsx
│       └── ...
└── (partner)/
    ├── layout.tsx - ⚠️ "use client" with direct redirect logic
    └── partner/
        └── ...
```

## 2. Identified Issues

1.  **Auth Blocking SEO & Performance (CRITICAL)**:
    -   `src/context/AuthContext.tsx` returns a `Loader` while checking authentication.
    -   Since `AuthProvider` wraps `RootLayout`, **NO PAGE** (even public ones) renders until the client-side auth check completes.
    -   This destroys SEO and First Contentful Paint.

2.  **Fragmented Redirect Logic**:
    -   Auth logic is scattered across `(customer)/layout.tsx`, `(admin)/layout.tsx`, etc.
    -   Code duplication for role checking and redirects.

3.  **Missing Error Boundaries**:
    -   No `error.tsx` in `app/`. Only a custom `ErrorBoundary` component used manually. Next.js App Router expects `error.tsx`.

4.  **Route Redundancy**:
    -   `(customer)/app/...` -> URL is `/app/dashboard`. The `app` folder acts as a URL segment. This is likely intended but unusual naming given `(customer)` is a group.

## 3. Proposed Fix

### A. Refactor `RootLayout` & `AuthProvider`
-   **Step 1**: Modify `AuthContext` to **always render children**. Do not return `null` or `Loader` while loading.
-   **Step 2**: Provide `loading` state to consumers.

### B. Implement `AuthGuard` Component
-   Create `src/components/auth/AuthGuard.tsx`.
-   It will handle the "Show Loader or Redirect" logic.
-   Protected layouts will wrap their content in `<AuthGuard>`.

### C. Update Group Layouts
-   **Public**: No Guard.
-   **Customer**: `<AuthGuard roles={['CUSTOMER']}>`.
-   **Admin**: `<AuthGuard roles={['ADMIN']}>`.

### D. Add Standard Files
-   `src/app/error.tsx` (Global error handler).
-   `src/app/not-found.tsx` (Global 404).

## 4. Verification Plan
-   Visit `/` -> Should render IMMEDIATELY (Server Rendered) without waiting for Auth.
-   Visit `/app/dashboard` (Logged out) -> Should redirect to `/login`.
-   Visit `/admin` (As Customer) -> Should show "Access Denied" or Redirect.
