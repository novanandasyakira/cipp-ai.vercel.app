# cipp-ai.vercel.app

This repository is prepared to deploy a TanStack Start app to Vercel.

## Notes for Vercel

- Recommended package manager: **pnpm**. If you use `pnpm`, set the **Install Command** in Vercel to `pnpm install`.
- If your app lives in a subfolder, set the **Root Directory** in the Vercel project settings to that folder (e.g., `apps/web`).
- Ensure the environment variable `GOOGLE_GENERATIVE_AI_API_KEY` is set in your Vercel Project Settings (Project → Settings → Environment Variables).

## What this change adds

- `package.json` with a `build` script that runs `vite build` and `vite` as a devDependency.

If you prefer `npm` instead of `pnpm`, reply and I will update `packageManager` and adjust README instructions.
