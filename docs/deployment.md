# GitHub and Vercel delivery

Configuration reviewed on **1 November 2026**. The card is a static Next.js page with one serverless route (`/api/telemetry`). It needs no API keys, databases or paid add-ons.

## Project identity

- GitHub: [Perceval-Wilhelm/Happy-Birthday](https://github.com/Perceval-Wilhelm/Happy-Birthday).
- Vercel: [happy-birthday](https://vercel.com/perceval-wilhelms-projects/happy-birthday), in the personal `perceval-wilhelms-projects` workspace (Hobby).
- Production: [happy-birthday-to-you-from-perceval.vercel.app](https://happy-birthday-to-you-from-perceval.vercel.app), also served at `happy-birthday-perceval-wilhelms-projects.vercel.app`. The share image URL is fixed at build time from the production domain, so redeploy after renaming it.
- Production branch: `main`. Every other branch gets a preview deployment, protected by Vercel Authentication.

## CI

`.github/workflows/check.yml` runs on pull requests to `main`, pushes to `main` and manual dispatch. Newer runs cancel older ones for the same branch or PR.

| Check                  | Verification                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Happy Birthday quality | Immutable install, high/critical dependency audit, formatting, zero-warning ESLint, route types, TypeScript, unit tests, lint regression tests, build |
| Happy Birthday browser | A fresh production build, then Playwright at phone, tablet and desktop sizes: the full story, axe scans, reduced motion, headers, share image, 404    |

Each job has a 15-minute limit. Browser failure reports, screenshots and traces are kept for seven days. The workflow declares `contents: read`, disables persisted checkout credentials, pins actions to full commit SHAs and uses no Vercel token.

Dependabot opens grouped weekly updates for npm and GitHub Actions (Monday 03:00, Asia/Ho_Chi_Minh). Dependabot PRs are never queued for auto-merge. TypeScript and `@types/node` majors need a compatibility review.

## GitHub protections

The `main` ruleset and repository settings, based on the open-kiln setup:

- Pull requests are required, with all review conversations resolved. Required approvals: zero, for a solo owner.
- **Happy Birthday quality** and **Happy Birthday browser** must pass, from GitHub Actions, on an up-to-date branch.
- Force pushes and branch deletion are blocked; history stays linear. Only squash merging is enabled, using the PR title, and merged branches are deleted.
- Auto-merge is allowed, unlike open-kiln. A PR queued with `gh pr merge <number> --squash --auto` squash-merges itself once both required checks pass; the ruleset still applies. Queue it as the repository owner. Nothing is queued automatically.
- Secret scanning with push protection, Dependabot alerts and security updates, and CodeQL default setup are enabled.

## Vercel settings

| Setting               | Configuration                                                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework             | Next.js, from `vercel.json`                                                                                                                                                |
| Install / build       | `corepack yarn install --immutable` / `corepack yarn build`, from `vercel.json`                                                                                            |
| Output directory      | Framework default (`outputDirectory: null`)                                                                                                                                |
| Node.js               | 24.x; `.nvmrc` pins the local patch, `engines` allows `>=24.19.0 <25`                                                                                                      |
| Functions             | Fluid compute in `iad1`. Pages are prerendered; only `/api/telemetry` runs as a function                                                                                   |
| Deployment protection | Vercel Authentication on previews and deployment URLs; production domains public                                                                                           |
| Environment variables | None required                                                                                                                                                              |
| Web Analytics         | On; the SDK mounts only when `VERCEL_ENV` is `production`                                                                                                                  |
| Speed Insights        | On for production with nothing to switch on: Hobby's free tier includes 10K events per rolling 30 days                                                                     |
| Deployment checks     | Happy Birthday quality and Happy Birthday browser, from GitHub. A production deployment gets the production domains only after both pass on its commit (20-minute timeout) |
| Firewall              | AI crawlers denied, AI assistants logged. Custom rule "Rate limit error reports": 20 requests per minute per IP to `/api/telemetry`                                        |
| Deployment retention  | Deployments expire after 30 days; the 10 newest production deployments are kept                                                                                            |

These settings live in Vercel, not in this repository. Change them with the CLI (`vercel project web-analytics`, `vercel project checks`, `vercel firewall`) or the dashboard. Do not run `vercel project speed-insights enable` or `vercel project observability enable`: they turn on the paid Plus tiers. Analytics routes and function settings take effect from the next deployment. Keep build settings in `vercel.json` rather than as dashboard overrides.

Not used: Vercel CI (beta, 200 CPU minutes a month on Hobby) would repeat the GitHub Actions jobs, whose results already gate production. Bot Protection's challenge could block the chat apps that fetch the share preview. Skew Protection, Rolling Releases, alerts, custom monitors, drains and longer log retention need a paid plan.

## Monitoring and logs

- **Web Analytics → Pages:** `/` counts visits. `/moments/gift-opened`, `/moments/wish-tap`, `/moments/wish-mic`, `/moments/wish-auto`, `/moments/story-finished` and `/moments/replayed` show how far the card was watched. Hobby plans drop custom events, so milestones are virtual page views.
- **Speed Insights:** Core Web Vitals from real devices.
- **Firewall:** denied AI crawlers and rate-limited telemetry bursts; `vercel firewall overview` prints the last day.
- **Logs / Observability:** browser errors (`source: window | promise | boundary`) and server errors (`source: server`) arrive as one JSON line each with the commit. Hobby keeps runtime logs for one hour, so check soon after a problem.

## Routine release

1. Branch from `main`. Edit `src/content/card.ts` and `src/content/photo.jpg` for a new recipient.
2. Run `corepack yarn verify`.
3. Review the whole diff, including the photo and lockfile, then push and open a PR.
4. Wait for both checks and the Vercel preview. Open the preview while signed in to Vercel; play it through on a phone, including the microphone if you use it.
5. Squash-merge, or queue auto-merge so it merges as soon as the checks pass. Vercel builds `main` and moves the production domains to it once both checks pass on that commit. Confirm the production domain serves the new commit and the share preview looks right.

## Recovery

A `main` commit whose checks fail never takes over the production domains; the previous deployment stays live. For a problem the checks missed, use Vercel's **Instant Rollback** (Hobby can return only to the previous production deployment), then fix forward with a PR. Rollback moves the domain; it does not change Git history. Do not bypass required checks or force-push `main`.
