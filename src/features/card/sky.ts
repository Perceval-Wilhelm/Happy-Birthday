import { gsap } from "gsap";

type Star = { x: number; y: number; r: number; alpha: number; speed: number; phase: number };
type Shot = { t: number; x: number; y: number };

/** Twinkling stars plus the odd shooting star; `shoot()` sends one across on the next frame. */
export function createSky(canvas: HTMLCanvasElement, reduce: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { shoot() {}, dispose() {} };
  const context = ctx;
  let W = 0;
  let H = 0;
  let stars: Star[] = [];
  let shot: Shot | null = null;
  let nextShot = 4;

  function draw(t: number) {
    context.clearRect(0, 0, W, H);
    context.fillStyle = "#fff";
    for (const s of stars) {
      context.globalAlpha = s.alpha * (0.65 + 0.35 * Math.sin(t * s.speed + s.phase));
      context.beginPath();
      context.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      context.fill();
    }
    if (!reduce && !shot && t > nextShot)
      shot = { t, x: W * (0.45 + Math.random() * 0.55), y: H * Math.random() * 0.35 };
    if (shot) {
      const p = Math.min((t - shot.t) / 0.9, 1);
      const x = shot.x - p * W * 0.5;
      const y = shot.y + p * W * 0.22;
      const tail = context.createLinearGradient(x, y, x + 120, y - 53);
      tail.addColorStop(0, "#fff");
      tail.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.globalAlpha = Math.sin(p * Math.PI);
      context.strokeStyle = tail;
      context.lineWidth = 1.6;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + 120, y - 53);
      context.stroke();
      if (p === 1) {
        shot = null;
        nextShot = t + 5 + Math.random() * 9;
      }
    }
    context.globalAlpha = 1;
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio, 2);
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round((W * H) / 4500) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.3 + 0.2,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 1.5 + 0.4,
      phase: Math.random() * 7,
    }));
    if (reduce) draw(0);
  }

  resize();
  addEventListener("resize", resize);
  if (!reduce) gsap.ticker.add(draw);

  return {
    shoot() {
      nextShot = 0;
    },
    dispose() {
      removeEventListener("resize", resize);
      gsap.ticker.remove(draw);
    },
  };
}
