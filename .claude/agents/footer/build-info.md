---
name: build-info
description: Add or update commit hash and Vercel deploy ID in page footers
---

# Build Info Footer Agent

Add the `<BuildInfo />` component to any page or layout that needs to display the git commit hash and Vercel deployment ID in its footer.

## Component Location

`src/components/BuildInfo.tsx` — a Server Component that renders:
- Git commit hash (first 7 chars) from `VERCEL_GIT_COMMIT_SHA` or `git rev-parse HEAD`
- Vercel deploy ID (first 9 chars after `dpl_` prefix) from `VERCEL_DEPLOYMENT_ID`

## How to Add

1. Import the component:
   ```tsx
   import BuildInfo from "@/components/BuildInfo";
   ```

2. Place `<BuildInfo />` in the footer area. It renders as a `<span>` with `font-mono text-[10px] text-muted/50` styling, so it fits inline with other footer metadata.

## Existing Placements

- `src/app/page.tsx` — homepage footer bottom bar, after the status indicators
- `src/app/dashboard/layout.tsx` — dashboard footer, right-aligned

## When to Use This Agent

- Adding a new page layout that should show build info
- Verifying build info is present across all layouts
- Updating the BuildInfo component format or styling
