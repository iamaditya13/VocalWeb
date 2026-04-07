/**
 * BONEYARD SKELETON AUDIT
 * =======================
 * Every async/loading state in the app is catalogued here.
 * This file drives which components receive <Skeleton> wrappers from boneyard-js.
 *
 * After wrapping components, run:
 *   npm run bones
 * from the `frontend/` directory (with the dev server running on :3000) to
 * generate the pixel-perfect .bones.json layout files in frontend/bones/.
 *
 * Re-run `npm run bones` any time you change UI inside a <Skeleton> wrapper.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * IDENTIFIED LOADING STATES
 * ─────────────────────────
 *
 * 1. name: "dashboard-stats-card"
 *    file: app/dashboard/page.tsx
 *    trigger: statsLoading (React Query — GET /dashboard/stats)
 *    wraps: <StatsCard> — one instance per stat (4 total in a grid)
 *    notes: each card is individually wrapped so breakpoint snapshots are per-card
 *
 * 2. name: "dashboard-recent-websites"
 *    file: app/dashboard/page.tsx
 *    trigger: websitesLoading (React Query — GET /websites?limit=6)
 *    wraps: the recent-websites grid section (3-card grid + empty-state fallback)
 *    minHeight: 220
 *
 * 3. name: "websites-grid"
 *    file: app/dashboard/websites/page.tsx
 *    trigger: isLoading (React Query — GET /websites)
 *    wraps: the full website grid (up to N cards + empty-state fallback)
 *    minHeight: 300
 *
 * 4. name: "website-detail"
 *    file: app/dashboard/websites/[id]/page.tsx
 *    trigger: isLoading (React Query — GET /websites/:id)
 *    wraps: the full page content — header, preview iframe, sidebar panel
 *    minHeight: 600
 *    notes: replaces the manual <WebsiteDetailSkeleton> component
 *
 * 5. name: "github-push-status"
 *    file: components/GitHubPushModal.tsx
 *    trigger: isLoading (PAT auth → repo create → file push in progress)
 *    wraps: the step-progress panel inside the modal form view
 *    minHeight: 80
 *    notes: fallback shows the manual step-tracker before bones are generated
 *
 * 6. name: "vercel-deploy-status"
 *    file: components/VercelDeployModal.tsx
 *    trigger: isLoading (deployment create → polling until READY)
 *    wraps: the step-progress panel inside the modal form view
 *    minHeight: 80
 *    notes: fallback shows the manual step-tracker before bones are generated
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * NOT WRAPPED (intentionally excluded)
 * ─────────────────────────────────────
 *
 * - app/dashboard/loading.tsx
 *   Route-level Next.js Suspense boundary. Serves server-side streaming — not
 *   a client data-fetch state. Boneyard wraps client isLoading flags only.
 *
 * - app/dashboard/websites/loading.tsx
 *   Same reason as above.
 *
 * - components/create/GeneratingState.tsx
 *   This component IS the loading UI (animated progress bar). There is no
 *   "real content" underneath it to reveal — on completion the router navigates
 *   away. Boneyard is not applicable here.
 */

// No runtime exports — this file is documentation only.
export {};
