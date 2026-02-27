# Frontend Project Structure (doodhly-web)

```
doodhly-web/
├── .github/                   # CI/CD workflows (Playwright)
├── public/                    # Static assets (images, icons)
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── (admin)/           # Admin dashboard routes
│   │   ├── (auth)/            # Authentication routes (login, verify)
│   │   ├── (customer)/        # Customer-facing app routes
│   │   ├── (partner)/         # Delivery partner app routes
│   │   ├── (public)/          # Landing page and marketing routes
│   │   ├── api/               # Next.js API Routes (if any)
│   │   ├── error.tsx          # Global error boundary
│   │   ├── layout.tsx         # Root layout
│   │   └── not-found.tsx      # 404 Page
│   ├── components/            # React Components
│   │   ├── auth/              # Auth-related components (forms, guards)
│   │   ├── ui/                # Reusable UI elements (buttons, inputs)
│   │   └── ...                # Feature-specific components
│   ├── context/               # Global State (AuthContext, etc.)
│   ├── hooks/                 # Custom Hooks (useAuth, useOfflineSync)
│   ├── lib/                   # Utilities & Logic
│   │   ├── api.ts             # Axios instance & API interceptors
│   │   ├── auth.ts            # Auth helpers
│   │   └── constants.ts       # App constants
│   └── styles/                # CSS & Styling
│       └── globals.css        # Global Tailwind imports
├── tests/                     # Playwright E2E Tests
│   ├── analytics.spec.ts
│   └── auth.spec.ts
├── playwright.config.ts       # Playwright Configuration
├── tailwind.config.ts         # Tailwind CSS Configuration
├── next.config.js             # Next.js Configuration
├── package.json               # Dependencies & Scripts
└── tsconfig.json              # TypeScript Configuration
```

## Directory Details

- **src/app**: Uses Route Groups `(group)` to organize separate layouts for Admin, Customer, Partner, and Public views without affecting the URL structure.
- **src/components/ui**: Contains atomic design elements, likely built with Shadcn UI or similar.
- **src/lib**: Holds core business logic helpers and the API client that communicates with the backend.
- **tests**: Contains end-to-end automation tests run by Playwright.
