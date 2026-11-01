import confetti from "canvas-confetti";

export const PALETTE = ["#ff8fb1", "#ffd36e", "#b79bff", "#7fd8c8", "#ffb38a", "#fff6ec"] as const;

type Point = { x: number; y: number };

// Bound to the card's own aria-hidden canvas: the default one is appended to <body>, outside every landmark.
let fire: confetti.CreateTypes | null = null;

const pop = (options: confetti.Options) => fire?.({ colors: [...PALETTE], disableForReducedMotion: true, ...options });

// Created on first use: canvas-confetti draws the emoji onto a canvas, which only exists in the browser.
let heart: confetti.Shape | undefined;
const heartShape = () => (heart ??= confetti.shapeFromText({ text: "💗", scalar: 2 }));

/** Where an element sits, as the 0–1 viewport fractions canvas-confetti expects. */
export function originOf(el: Element, fy = 0.5): Point {
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * fy) / innerHeight };
}

export const effects = {
  attach(canvas: HTMLCanvasElement) {
    fire = confetti.create(canvas, { resize: true });
  },
  detach() {
    fire?.reset();
    fire = null;
  },
  giftBurst: (origin: Point) =>
    pop({ particleCount: 90, spread: 80, startVelocity: 38, shapes: ["star", "circle"], origin }),
  candleBurst: (origin: Point) =>
    pop({
      particleCount: 160,
      spread: 110,
      startVelocity: 48,
      scalar: 1.1,
      shapes: ["star", "circle", "square"],
      origin,
    }),
  cannons() {
    pop({ particleCount: 2, angle: 60, spread: 60, startVelocity: 55, origin: { x: 0, y: 0.9 } });
    pop({ particleCount: 2, angle: 120, spread: 60, startVelocity: 55, origin: { x: 1, y: 0.9 } });
  },
  sparkle: (origin: Point) =>
    pop({
      particleCount: 12,
      spread: 360,
      startVelocity: 12,
      gravity: 0.5,
      decay: 0.9,
      ticks: 60,
      scalar: 0.6,
      shapes: ["star"],
      origin,
    }),
  heartRain: () =>
    pop({
      particleCount: 1,
      shapes: [heartShape()],
      scalar: 2,
      flat: true,
      startVelocity: 0,
      gravity: 0.35,
      ticks: 500,
      drift: Math.random() - 0.5,
      origin: { x: Math.random(), y: -0.05 },
    }),
  heartBurst: (origin: Point) =>
    pop({
      particleCount: 12,
      shapes: [heartShape()],
      scalar: 2,
      flat: true,
      spread: 90,
      startVelocity: 22,
      gravity: 0.35,
      ticks: 500,
      origin,
    }),
  reset: () => fire?.reset(),
};

/** A short vibration where supported (Android); iOS ignores it. */
export const buzz = (pattern: number | number[]) => navigator.vibrate?.(pattern);
