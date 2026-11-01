import { gsap } from "gsap";

type Rocket = { x: number; y: number; vx: number; vy: number; g: number; color: string };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; decay: number; color: string; size: number };

const TAU = Math.PI * 2;

/**
 * Rockets that climb, burst and fade with glowing trails. The canvas stays transparent: each frame
 * erases a little of the last one ("destination-out") instead of painting a background over the sky.
 */
export function createFireworks(canvas: HTMLCanvasElement, colors: readonly string[], reduce: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx || reduce) return { salvo() {}, clear() {}, dispose() {} };
  const context = ctx;
  let W = 0;
  let H = 0;
  let unit = 1;
  let rockets: Rocket[] = [];
  let sparks: Spark[] = [];
  let pending: gsap.core.Tween[] = [];
  let running = false;
  let idle = 0;
  const pick = () => colors[Math.floor(Math.random() * colors.length)];

  function resize() {
    const dpr = Math.min(devicePixelRatio, 2);
    W = innerWidth;
    H = innerHeight;
    unit = Math.max(0.6, Math.min(W, H) / 800);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(x: number, y: number, color: string) {
    const count = 64;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * TAU + Math.random() * 0.2;
      const speed = (2 + Math.random() * 3.2) * unit;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.011 + Math.random() * 0.01,
        color: Math.random() < 0.2 ? "#fff6ec" : color,
        size: (1.1 + Math.random() * 1.3) * Math.max(unit, 0.8),
      });
    }
  }

  // Each frame draws a line from where a particle was to where it is, so fast ones leave smooth streaks.
  function streak(fromX: number, fromY: number, toX: number, toY: number, width: number, color: string, alpha: number) {
    context.globalAlpha = alpha;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
  }

  function frame(_time: number, deltaTime: number) {
    const f = Math.min(deltaTime / 16.67, 3); // same speed on 60 Hz and 120 Hz screens
    context.globalCompositeOperation = "destination-out";
    context.fillStyle = `rgba(0, 0, 0, ${Math.min(1, 0.22 * f)})`;
    context.fillRect(0, 0, W, H);
    context.globalCompositeOperation = "lighter";
    context.lineCap = "round";

    rockets = rockets.filter((r) => {
      const { x, y } = r;
      r.vy += r.g * f;
      r.x += r.vx * f;
      r.y += r.vy * f;
      streak(x, y, r.x, r.y, 2.5 * Math.max(unit, 0.8), r.color, 1);
      if (r.vy < 0) return true;
      burst(r.x, r.y, r.color);
      return false;
    });

    sparks = sparks.filter((s) => {
      const { x, y } = s;
      const drag = 0.986 ** f;
      s.vx *= drag;
      s.vy = s.vy * drag + 0.045 * unit * f;
      s.x += s.vx * f;
      s.y += s.vy * f;
      s.life -= s.decay * f;
      if (s.life <= 0) return false;
      streak(x, y, s.x, s.y, s.size * 1.6, s.color, s.life);
      return true;
    });
    context.globalAlpha = 1;

    // Let the last trails fade out, then stop drawing until the next launch.
    idle = rockets.length || sparks.length ? 0 : idle + 1;
    if (idle > 40) stop();
  }

  function start() {
    if (running) return;
    running = true;
    idle = 0;
    gsap.ticker.add(frame);
  }

  function stop() {
    running = false;
    gsap.ticker.remove(frame);
    context.clearRect(0, 0, W, H);
  }

  function launch() {
    const peak = H * (0.12 + Math.random() * 0.28);
    const g = 0.12 * (H / 800);
    // Launch speed that reaches `peak` exactly, where vy turns positive and the rocket bursts.
    rockets.push({
      x: W * (0.15 + Math.random() * 0.7),
      y: H + 10,
      vx: (Math.random() - 0.5) * unit,
      vy: -Math.sqrt(2 * g * (H + 10 - peak)),
      g,
      color: pick(),
    });
    start();
  }

  function clear() {
    pending.forEach((tween) => tween.kill());
    pending = [];
    rockets = [];
    sparks = [];
    stop();
  }

  resize();
  addEventListener("resize", resize);

  return {
    /** Launches `count` rockets over the next couple of seconds. */
    salvo(count = 6) {
      for (let i = 0; i < count; i++) pending.push(gsap.delayedCall(i * 0.45 + Math.random() * 0.25, launch));
    },
    clear,
    dispose() {
      clear();
      removeEventListener("resize", resize);
    },
  };
}
