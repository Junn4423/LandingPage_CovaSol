# Covasol Platform Migration Plan

## Objectives
- Rebuild the marketing + admin experience on Next.js 14 App Router for SSR/ISR, routing, and component reuse.
- Split responsibilities into dedicated `frontend` and `backend` workspaces with clear API contracts.
- Replace the embedded SQLite storage with an external MySQL/MariaDB instance hosted via Laragon + phpMyAdmin.
- Preserve feature parity (public marketing site, blog/products detail pages, admin editors, database viewer) while enabling future redesigns.
- Improve DX with TypeScript, ESLint, and shared UI primitives.

## Frontend (Next.js) Architecture
1. **Workspace Layout**
   - Location: `apps/frontend` (Next 14, App Router, TypeScript, ESLint, Tailwind + CSS Modules for gradual migration of existing styles).
   - Directory map:
     ```
     apps/frontend/
       app/
         layout.tsx
         page.tsx (home)
         blog/page.tsx, blog/[slug]/page.tsx
         products/page.tsx, products/[slug]/page.tsx
         admin/...
       components/
         ui/, layout/, data/
       lib/
         api-client.ts (fetch wrapper)
         types.ts (shared DTOs)
       styles/
         globals.css (import legacy CSS vars + reset)
     ```
   - Use Route Groups for admin area (`app/(admin)/admin/...`) guarded by middleware reading session token (via backend issued JWT).

2. **Data Fetching Strategy**
   - Public pages use Next Server Components with `fetch` hitting backend REST endpoints. Configure `NEXT_PUBLIC_API_BASE_URL` + server-only `API_BASE_URL`.
   - ISR for marketing pages (`revalidate = 30`). Blog/product detail pages use dynamic metadata pulled via API.
   - Admin editor pages rendered as Client Components leveraging React Query for live updates.

3. **Styling & Assets**
   - Bootstrap with Tailwind for layout primitives; gradually port existing `assets/css` slices into CSS Modules if designs must match.
   - Legacy images move into `apps/frontend/public/`. Optimize via Next/Image when possible (phase 2).

4. **State & Auth**
   - Use Next middleware to forward authenticated requests (cookie `cova_token`).
   - Client state handled via TanStack Query + Zod validated responses.
   - Use `next-auth` later if SSO required; initial version consumes backend-issued JWT tokens.

5. **Build & Tooling**
   - Commands: `npm run dev:frontend`, `npm run build:frontend`, `npm run lint:frontend` from repo root using npm workspaces.
   - Add Playwright smoke tests for critical flows (phase 3).

## Backend (API) Architecture
1. **Workspace Layout**
   - Location: `apps/backend` (Express 5 + TypeScript + Zod + Prisma for MySQL).
   - Directory map:
     ```
     apps/backend/
       src/
         server.ts
         config.ts
         routes/
           auth.ts, blog.ts, products.ts, users.ts, analytics.ts
         services/
           blog.service.ts, product.service.ts, user.service.ts
         db/
           prisma/
             schema.prisma
       prisma/
         migrations/
     ```
   - Shared DTOs exported to `packages/types` for reuse.

2. **Database**
   - Use MySQL (Laragon). Connection string via `.env` (`DATABASE_URL=mysql://user:pass@localhost:3306/covasol`).
   - Model tables for `users`, `sessions`, `blogs`, `products`, `categories`, `media`, `reviews`.
   - Seed scripts to import legacy JSON/SQLite data (phase 2) using Prisma seed.

3. **Auth & Sessions**
   - Replace express-session with stateless JWT (access + refresh). Store refresh tokens in `sessions` table.
   - Password hashing via bcrypt, login endpoint issues tokens consumed by frontend.

4. **API Surface**
   - `/v1/auth/login`, `/v1/auth/refresh`, `/v1/auth/logout`.
   - `/v1/blog` CRUD, `/v1/products` CRUD, `/v1/users`, `/v1/database/metrics`.
   - Public endpoints served with cache headers; admin endpoints protected by JWT middleware.

5. **Tooling**
   - `npm run dev:backend` (ts-node-dev), `npm run build:backend`, `npm run start:backend`.
   - ESLint + Prettier config shared via root `packages/eslint-config`.

## Cross-Cutting Concerns
- **Monorepo**: Convert root `package.json` to npm workspaces (`apps/frontend`, `apps/backend`, `packages/types`, `packages/eslint-config`).
- **Env Management**: `.env.example` at root summarizing required vars for both apps.
- **API Client Types**: Export TypeScript interfaces from backend to frontend via shared package.
- **Deployment**: Plan for Vercel (frontend) + Render/Fly/VM (backend) connecting to managed MySQL; local dev uses Laragon MySQL container.

## Phase Breakdown
1. **Phase 1 (current)**
   - Set up monorepo scaffolding, Next app skeleton, Express API skeleton, Prisma schema stub, Docker compose for local MySQL (optional) + Laragon instructions.
   - Implement read-only endpoints and public pages using mock data from API.

2. **Phase 2**
   - Complete CRUD flows for admin, integrate auth, port styling, migrate data from SQLite to MySQL.

3. **Phase 3**
   - Polish UI, add testing (Playwright + Vitest), CI/CD pipelines, observability hooks.

---
This document tracks migration decisions; update as new requirements emerge.
