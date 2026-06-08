# Count Me In

We knitters always joke that we don't know how to count. I built Count Me In to help answer questions like: *"What row am I at?"* or *"Did I count the last row?"*

### 🧶 [Try it live → countmein.pages.dev](https://countmein.pages.dev)

---

## What it does

Count Me In is a small, focused web app for counting rows while you knit:

- **Onboarding** — name your project and capture the details (session number, garment type, size) before you start. Or skip it and start counting right away with sensible defaults.
- **Counter** — increment with a click or the spacebar. Pause and reset whenever you need to.
- **Timing insights** — every increment is timestamped, so the app can show how long ago you last counted, your average time per row, and gently ask *"Did you miss a row?"* when a gap looks unusual.
- **Finish session** — wrap up with a downloadable, gauge-swatch-style stats card summarizing your session.

## Tech stack

- **React 19** + **TypeScript**
- **Vite** for dev/build tooling
- **CSS Modules** for styling
- **React Router** for navigation
- **Vitest** + **React Testing Library** for component tests
- Deployed on **Cloudflare Pages**

## Getting started

```bash
# install dependencies
npm install

# start the dev server (with hot reload)
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

## Available scripts

| Command              | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server with hot reload         |
| `npm run build`      | Type-check and build for production into `dist/`  |
| `npm run preview`    | Preview the production build locally              |
| `npm run lint`       | Run ESLint across the project                     |
| `npm run test`       | Run the test suite once                           |
| `npm run test:watch` | Run tests in watch mode                           |

## Deployment

The app is deployed to [Cloudflare Pages](https://pages.cloudflare.com/). The `public/_redirects` file routes all paths to `index.html` so client-side routing (React Router) works on hard refreshes and deep links.
