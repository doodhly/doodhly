# Doodhly Frontend Scaffolding

This is the Next.js App Router structure for Doodhly.

## Setup

Since the environment lacked `Node.js` during scaffolding, this project was created manually.
To run this project, you must have Node.js (v18+) installed.

1.  Navigate to this folder:
    ```bash
    cd doodhly-web
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

## Structure

- **src/app/(public)**: Marketing pages (Home, About).
- **src/app/(auth)**: Login and OTP verification.
- **src/app/(customer)**: Customer Dashboard, Subscription Management.
- **src/app/(partner)**: Delivery Partner App (Mobile-first).
- **src/app/(internal)**: Admin & Sales Dashboards.

## Authentication

Authentication is currently **SIMULATED** in `src/lib/auth.ts` and the various `layout.tsx` files.
- Customer Layout: Auto-approves session.
- Partner Layout: Auto-approves session.

## Core Libraries

- **Styling**: Tailwind CSS (Configured in `tailwind.config.ts` and `src/styles/globals.css`).
- **Icons**: Lucide React (referenced in dependencies).
- **Fonts**: Inter & Merriweather (in `layout.tsx`).
