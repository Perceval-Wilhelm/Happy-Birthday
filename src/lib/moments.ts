import { pageview } from "@vercel/analytics";

export type Moment = "gift-opened" | "wish-tap" | "wish-mic" | "wish-auto" | "story-finished" | "replayed";

/**
 * Hobby plans drop custom events, so story milestones are recorded as virtual pages: Web Analytics
 * then shows how far the card was watched under /moments/*. Without the analytics script (local and
 * preview builds) this does nothing.
 */
export function moment(name: Moment) {
  pageview({ route: "/moments/[moment]", path: `/moments/${name}` });
}
