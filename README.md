# Happy Birthday 🎂

An interactive birthday card that plays like a short film under a starlit sky: a gift to open, a message that almost gets sent, a wish to make, and candles to blow out by tapping them or by really blowing into the phone's microphone.

**Live:** [happy-birthday-to-you-from-perceval.vercel.app](https://happy-birthday-to-you-from-perceval.vercel.app)

## The story

| Scene       | What happens                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Gift        | The recipient's name above a wiggling gift. Opening it starts the music (and it can be locked until a set time). |
| Greeting    | The name is written on in gold ink.                                                                              |
| Chat        | A Messenger-style screen types the birthday wish, almost sends it, then erases it.                               |
| Rethink     | "Đó là những gì mà anh đã định làm…": lines rise out of a blur; _đặc biệt_ gets a hand-drawn underline.          |
| Make a wish | The sky dims, the music falls silent, a shooting star crosses, and the card waits by the cake.                   |
| Candles     | Tap the candles or blow on the mic: the flames bend with the breath, go out, and the song restarts from the top. |
| Wish        | Confetti, fireworks and balloons; the photos land one by one and develop like instant prints under a party hat.  |
| Ending      | A heart drawn in stars, the closing line, a replay button, and falling hearts.                                   |

## Make it for someone else

Everything personal is in [`src/content/card.ts`](src/content/card.ts):

- `name`, `fullName`, and the pronouns `me` / `you` (for example `anh` / `em`, `em` / `chị`, or `mình` and the name itself for someone you call by name).
- Every line of the story. `{me}` and `{you}` are filled in, `{Me}` and `{You}` start a sentence, and `*words*` get the gold underline.
- `photos`: images in [`src/content/`](src/content/), in the order they land in the wish scene; the first is also the chat avatar. Portrait (3:4) works best.
- `music`: the song. Replace [`public/music/hbd.mp3`](public/music/hbd.mp3) or point it at another file in `public/`.
- `unlockAt`: keep the gift locked behind a countdown until a moment such as `"2026-11-02T00:00:00+07:00"`.
- `replyUrl`: add a "Nhắn lại cho anh 💌" button that opens Messenger, Zalo or any link.

The share image for Messenger/Zalo previews is generated from the same file.

## Develop

Use Node.js 24 (see [`.nvmrc`](.nvmrc)) and the Yarn version pinned in `package.json` through Corepack.

```sh
corepack yarn install --immutable
corepack yarn dev
corepack yarn verify
```

`verify` runs formatting, ESLint, TypeScript, unit tests, lint regression tests, the production build and the Playwright browser tests at phone, tablet and desktop sizes. Browser tests need Chromium once: `corepack yarn exec playwright install chromium`.

## How it is built

- Next.js 16 (App Router), React 19 and TypeScript; the page is prerendered as static HTML.
- One GSAP 3.15 timeline drives the story, with SplitText for word reveals; it pauses at the cake until the candles are blown out.
- Hand-written canvas starfield and fireworks, CSS balloons, canvas-confetti for confetti and hearts.
- Self-hosted Be Vietnam Pro, Playfair Display and Dancing Script, each with the Vietnamese subset.
- `next/image` for the photos (AVIF/WebP and a blur placeholder) and `next/og` for the share image.
- A strict Content Security Policy and `noindex` headers: the card stays out of search engines.
- Reduced-motion users get the same story with fades only.

## Monitoring

Production builds on Vercel load Web Analytics and Speed Insights; local and preview builds do not.

- **How far the card was watched:** story milestones are recorded as virtual pages under `/moments/*` in Web Analytics (`gift-opened`, `wish-tap` / `wish-mic` / `wish-auto`, `story-finished`, `replayed`). Custom events need a paid plan; page views do not.
- **Speed:** Speed Insights reports real-device Core Web Vitals.
- **Errors:** browser errors are sent to `/api/telemetry` and server errors through `instrumentation.ts`; both appear in the deployment's runtime logs as one JSON line each.

Only milestone names and error messages are collected: no names, text or query strings.

## Delivery

GitHub Actions runs **Happy Birthday quality** and **Happy Birthday browser** on every pull request; Vercel builds a preview of every branch and deploys `main` to production once both checks pass. See [docs/deployment.md](docs/deployment.md) for the full setup and release routine.

## Credits

Made by [Bùi Quốc Thịnh](https://github.com/Perceval-Wilhelm). Started from [fajarghifar/happybirthday](https://github.com/fajarghifar/happybirthday) (MIT, see [LICENSE](LICENSE)); the party hat and favicon still come from it.
