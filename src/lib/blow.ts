export type BlowState = { floor: number; since: number | null; start: number | null };

const MIN_LEVEL = 0.3; // a breath on the mic is loud and broadband even on quiet phones
const OVER_FLOOR = 2.5; // ...and clearly louder than the room
const HOLD_MS = 280; // long enough to ignore claps, taps and single words
const CALIBRATE_MS = 500; // listen to the room before arming

export const initialBlowState = (): BlowState => ({ floor: 0.05, since: null, start: null });

/**
 * One step of the "blow out the candles" detector. `level` is the 0–1 loudness of the low
 * frequencies, where blowing on a microphone puts its energy. Returns the next state, whether the
 * candles are blown out, and how strongly the flames should bend (0–1).
 */
export function stepBlow(state: BlowState, level: number, now: number) {
  const start = state.start ?? now;
  const armed = now - start >= CALIBRATE_MS;
  const threshold = Math.max(MIN_LEVEL, state.floor * OVER_FLOOR);
  const loud = armed && level >= threshold;
  // Learn the room's background noise quickly at first, then only while nobody is blowing.
  const floor = !armed ? state.floor * 0.8 + level * 0.2 : loud ? state.floor : state.floor * 0.95 + level * 0.05;
  const since = loud ? (state.since ?? now) : null;
  const blown = since !== null && now - since >= HOLD_MS;
  const intensity = Math.min(1, Math.max(0, (level - floor) / Math.max(threshold - floor, 0.01)));
  return { state: { floor, since, start }, blown, intensity };
}
