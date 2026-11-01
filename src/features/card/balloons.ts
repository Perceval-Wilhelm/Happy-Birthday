import { gsap } from "gsap";

const COLORS = [
  ["#ff8fb1", "#d64f7e"],
  ["#ffd36e", "#d9952b"],
  ["#b79bff", "#7756d1"],
  ["#7fd8c8", "#38998a"],
  ["#ffb38a", "#d96c3f"],
];

/** CSS sways each balloon; GSAP floats them up. Created on the client so positions can be random. */
export function createBalloons(container: HTMLElement, reduce: boolean) {
  const balloons = reduce
    ? []
    : Array.from({ length: innerWidth < 600 ? 12 : 20 }, (_, i) => {
        const [c, d] = COLORS[i % COLORS.length];
        const el = document.createElement("div");
        el.className = "balloon";
        el.innerHTML = '<div class="b"></div>';
        el.style.cssText = `left:${gsap.utils.random(-4, 92)}%;--size:${gsap.utils.random(48, 90)}px;--c:${c};--d:${d};--sway:${gsap.utils.random(2.2, 3.8)}s`;
        container.append(el);
        return el;
      });

  return {
    /**
     * Runs outside the story timeline, so balloons keep floating while it waits at the cake.
     * `edges` sends them up the sides, framing the photo and wish instead of crossing them.
     */
    release(around: "anywhere" | "edges" = "anywhere") {
      for (const [i, b] of balloons.entries()) {
        const side = i % 2 ? gsap.utils.random(80, 94) : gsap.utils.random(-4, 10);
        b.style.left = `${around === "edges" ? side : gsap.utils.random(-4, 92)}%`;
        gsap.fromTo(
          b,
          { y: 0 },
          {
            y: -(innerHeight + 320),
            duration: gsap.utils.random(6, 9.5),
            delay: gsap.utils.random(0, 2.5),
            ease: "none",
            overwrite: true,
          },
        );
      }
    },
    dispose() {
      gsap.killTweensOf(balloons);
      balloons.forEach((b) => b.remove());
    },
  };
}
