const pad = (value: number) => String(value).padStart(2, "0");

/** "02:13:45", or "1 ngày 02:13:45" when more than a day is left. */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const days = Math.floor(total / 86_400);
  const clock = `${pad(Math.floor((total % 86_400) / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
  return days > 0 ? `${days} ngày ${clock}` : clock;
}

/** Milliseconds until `unlockAt`, or 0 when the card is open (or the date is missing/invalid). */
export function remainingUntil(unlockAt: string | null, now: number): number {
  if (!unlockAt) return 0;
  const target = Date.parse(unlockAt);
  return Number.isNaN(target) ? 0 : Math.max(0, target - now);
}
