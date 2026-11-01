import { describe, expect, it } from "vitest";
import { initialBlowState, stepBlow } from "./blow";

/** Feeds one level per 16 ms frame and reports when (if ever) the candles go out. */
function run(levels: number[]) {
  let state = initialBlowState();
  for (const [frame, level] of levels.entries()) {
    const step = stepBlow(state, level, frame * 16);
    if (step.blown) return frame * 16;
    state = step.state;
  }
  return null;
}

const frames = (level: number, ms: number) => Array<number>(Math.round(ms / 16)).fill(level);

describe("blow detector", () => {
  it("stays lit in a quiet room", () => {
    expect(run(frames(0.04, 3000))).toBeNull();
  });

  it("blows out after a sustained breath", () => {
    const at = run([...frames(0.05, 500), ...frames(0.7, 600)]);
    expect(at).not.toBeNull();
    expect(at!).toBeGreaterThanOrEqual(500 + 280);
  });

  it("ignores a short clap or tap", () => {
    expect(run([...frames(0.05, 500), ...frames(0.9, 120), ...frames(0.05, 1000)])).toBeNull();
  });

  it("adapts to a noisy room instead of firing on its hum", () => {
    expect(run(frames(0.35, 4000))).toBeNull();
  });

  it("does not fire while it is still listening to the room", () => {
    expect(run(frames(0.8, 450))).toBeNull();
  });

  it("reports how hard someone is blowing", () => {
    const quiet = stepBlow(initialBlowState(), 0.05, 0).intensity;
    const strong = stepBlow(initialBlowState(), 0.6, 0).intensity;
    expect(quiet).toBe(0);
    expect(strong).toBe(1);
  });
});
