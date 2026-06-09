# Count Me In

A cozy knitting row counter web app. Live at https://countmein.club (also reachable at countmein.pages.dev).

It answers the two questions that derail a knitting project: "What row am I on?" and "Did I already count that one?"

## Stack
- React 19 + TypeScript
- Vite (dev/build)
- CSS Modules for styling
- React Router for navigation
- Vitest + React Testing Library for tests
- Deployed on Cloudflare Pages

## Structure
- `src/pages/Onboarding/` — entry screen. Capture project name, session number, garment type, size, needle size, gauge (stitches/rows), and stitch pattern. Has a skip path that starts with sensible defaults.
- `src/pages/Counter/` — the main screen.
  - `Counter.tsx` — row counting (click or spacebar), pause/reset, timing insights, theme/alerts/focus controls.
  - `FinishSession.tsx` / `StatsCard.tsx` — wrap-up flow and the downloadable stats card.
- `src/components/` — shared UI (`CustomSelect`, `ThemeSelector`).
- `src/constants/` — `themes.ts` (theme list + storage key), `garmentTypes.ts`.
- `src/utils/` — `formatters.ts` (time/label formatting), `downloadStatsCard.ts` (renders the card to an image via `html-to-image`).

Routes: `/` (Onboarding) and `/counter` (Counter).

## Features (built)
- Onboarding form with a skip-to-defaults option.
- Counter: increment by click or spacebar, plus pause and reset.
- Timing insights: every increment is timestamped to show "last counted x ago" and average time per row.
- Anomaly detection: prompts "Did you miss a row?" on an unusual gap; can be toggled off.
- Session persistence via localStorage (survives refresh/close).
- Multiple color themes.
- Finish session with a downloadable, notebook-style stats card.

## Conventions
- CSS Modules per component (`*.module.css`); no global UI framework.
- Tests are colocated (`*.test.ts[x]`) and run with Vitest. `npm run test` runs once; `npm run test:watch` watches.
- `npm run build` type-checks then builds to `dist/`. `npm run lint` runs ESLint.
- SPA routing on Cloudflare relies on `public/_redirects` (all paths → `index.html`).
- Social/link previews depend on the Open Graph tags in `index.html`; keep their URLs pointed at the live domain.

## Possible future work
- Package it as a native app (e.g. iOS/Android) so it works offline and lives on the home screen.
