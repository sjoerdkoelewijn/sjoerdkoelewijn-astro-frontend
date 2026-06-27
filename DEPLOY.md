# Deployment

This is the **Astro frontend** for sjoerdkoelewijn.com. It fetches content from the
Strapi backend (separate repo: `sjoerdkoelewijn-strapi-backend`) at **build time** and
ships a fully static site.

## Hosting: Netlify (git-based auto-deploy)

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variable:** `STRAPI_URL` = the Strapi Cloud URL of the backend
  (e.g. `https://your-project.strapiapp.com`). Without it the build falls back to
  `http://localhost:1337` and will fail in CI.

Every push to the connected branch triggers a new Netlify build & deploy.

> Because content is fetched at build time, **re-deploy the frontend after changing
> content in Strapi** (or wire a Strapi webhook → Netlify build hook for automatic rebuilds).

## Backend (Strapi Cloud) — manual, one-time

The backend deploys separately on Strapi Cloud. Connect the `sjoerdkoelewijn-strapi-backend`
repo in the Strapi Cloud dashboard (Project Settings → General → Connected repository,
enable "Deploy on every commit"). Then populate its content (see the backend repo's
`SEED.md`) and copy its public URL into Netlify's `STRAPI_URL`.
