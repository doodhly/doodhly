# Audit Fix Queue

## CRITICAL PRIORITY (Release Blockers)
- [x] **Dependency Security Patch (Frontend):** Upgrade `next` to 14.2.36+ or 15.x to fix Image Optimizer DoS (GHSA-9g9p-9gw9-jx7f).
- [x] **Dependency Security Patch (Backend):** Upgrade `axios` to fix mergeConfig DoS (GHSA-43fc-jf86-j433).

## HIGH PRIORITY (Security & Stability)
- [ ] **Automated Tests:** The project has 0% test coverage. Implement core payment and delivery verification tests.
- [ ] **API Documentation:** Generate Swagger/OpenAPI definitions for the 5+ controllers for external integration.
- [ ] **Secret Rotation:** Initiate first rotation of production secrets as per the rotation guide.

## MEDIUM PRIORITY (Maintenance)
- [x] **Refine Error Boundaries:** Add specific error boundaries to the (admin) and (partner) dashboard views.
- [ ] **Lint Enforcement:** Fix 12+ potential lint warnings in `doodhly-web` revealed during build optimization.

## LOW PRIORITY (Polish)
- [x] **3D Optimization:** Optimize Framer Motion variants in `TiltCard.tsx` to reduce main thread load on mobile.
- [x] **Accessibility:** Add ARIA labels to the mobile navigation items in `CustomerLayout`.
