# Happy Birthday contributor guide

A personal, Vietnamese-language birthday card for one recipient at a time. It is public on GitHub and on Vercel, so treat the recipient's name and photo with care: never add more personal data than the card shows.

## Architecture

- Next.js App Router. `src/app/page.tsx` renders `BirthdayCard` with the resolved content; the page is static.
- `src/content/card.ts` holds everything personal: names, pronouns, every line of the story, the photo, `unlockAt` and `replyUrl`. `src/features/card/resolve.ts` fills the `{me}`/`{you}` templates on the server.
- `src/features/card/BirthdayCard.tsx` is the client component: markup for every scene, the gate, the cake interaction, sound, replay and the polaroid tilt.
- `story.ts` builds the whole card as one paused GSAP timeline. Scenes share one grid cell. It pauses at the cake (`addPause`) until `blow()` resumes it. Keep new scenes inside this timeline so replay (`restart()`) resets them.
- Imperative layers live in their own modules, each with a dispose function: `sky.ts` (stars, shooting stars), `fireworks.ts`, `balloons.ts`, `music.ts`, `effects.ts` (confetti on the card's own canvas, haptics) and `mic.ts` (microphone blow detection using `src/lib/blow.ts`).
- Separate CSS/GSAP/microphone concerns onto separate elements: GSAP overwrites inline transforms, CSS animations override inline styles, and GSAP 3.11+ folds CSS `rotate`/`translate` into its own transform. The flames show the pattern: `.flame-wrap` (GSAP), `.flame-lean` (breath via `--breath`), `.flame` (CSS flicker).
- SplitText uses `aria: "none"` for words. Its default labels the split `<p>`, where labels are not allowed, and hides the words. Letter splits are hidden with an `sr-only` copy beside them. Scene text is also announced through the live region.
- `src/app/opengraph-image.tsx` draws the share image at build time from the content file. `next.config.ts` owns the security headers.

## Development

Use Node.js from `.nvmrc` (the supported floor is 24.19.0, Vercel's current patch) and Yarn through Corepack.

```sh
corepack yarn install --immutable
corepack yarn dev
corepack yarn verify
```

`check:all` runs formatting, ESLint (zero warnings), route types, TypeScript, Vitest, lint regression tests and the production build. `verify` adds the Playwright tests; they fast-forward the story with Playwright's fake clock and scan the gate and ending with axe. The test server defaults to port 4330; set `PLAYWRIGHT_PORT` instead of killing unrelated processes.

For visual changes, check every scene on a 375 px phone and a 1440 px desktop, with and without reduced motion, and confirm there are no console errors or failed requests.

## Product boundaries

- Keep added copy free of pronouns where possible, so personalising stays one edit in `card.ts`.
- Telemetry is milestone names (`/moments/*` virtual page views) and error reports only. Never send story text, names, photos or query strings. Analytics mount only in Vercel production builds.
- The card must stay `noindex` with its robots rules and CSP. New third-party origins need a CSP change and a reason.
- Every interaction needs a fallback: tap for the microphone, the 25-second auto-blow for a missed hint, autoplay-blocked music that the sound button can start.
- Respect `prefers-reduced-motion`: movement scales to zero, confetti and fireworks are off, fades stay.

## Dependencies and delivery

- Pin direct dependency versions and commit `yarn.lock` with intentional dependency changes. Prefer the newest stable versions that work together; do not force installs or add broad resolutions.
- Keep Vercel configured as Next.js through `vercel.json`, with install and build run through `corepack yarn`.
- See `docs/deployment.md` before changing GitHub or Vercel settings. Keep actions pinned to full commit SHAs, keep read-only workflow permissions and the two check names, and do not add deployment credentials: Vercel's Git integration deploys.
- Use Conventional Commits. Never change Git identity or add co-author/tool attribution. Commit and push only when authorized.
