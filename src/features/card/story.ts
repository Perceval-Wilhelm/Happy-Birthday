import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import type { ResolvedCard } from "./resolve";

export type StoryHooks = {
  announce(line: string): void;
  releaseBalloons(around?: "anywhere" | "edges"): void;
  /** The cake is up: hush the music, send a shooting star. */
  wishMoment(): void;
  /** The timeline pauses here until the candles are blown out. */
  waitForWish(): void;
  /** Candles are out: music from the top, confetti, a buzz. */
  party(): void;
  cannons(): void;
  fireworks(count: number): void;
  heartRain(): void;
  finished(): void;
};

/**
 * Builds the whole card as one paused GSAP timeline. Scenes share one grid cell; each is revealed,
 * held long enough to read, then lifted away. `reduce` keeps the fades but removes all movement.
 */
export function buildStory(root: HTMLElement, card: ResolvedCard, reduce: boolean, hooks: StoryHooks) {
  const q = gsap.utils.selector(root);
  const one = (selector: string) => q(selector)[0] as HTMLElement;
  const m = reduce ? 0 : 1;
  const grow = (scale: number) => (reduce ? 1 : scale);
  const { text } = card;

  const tl = gsap.timeline({ paused: true, defaults: { duration: 0.9, ease: "power3.out" } });

  const words = (selector: string, className?: string) => {
    const el = one(selector);
    // aria "none": split words stay readable text. The default labels the <p>, where labels are not allowed.
    const list = SplitText.create(el, { type: "words", ignore: ".scribble", aria: "none" }).words as HTMLElement[];
    if (className) list.forEach((word) => word.classList.add(className));
    // SplitText tucks each underline into the last word it covers; it belongs to the whole mark.
    el.querySelectorAll(".mark").forEach((mark) => {
      const scribble = mark.querySelector(".scribble");
      if (scribble) mark.append(scribble);
    });
    return list;
  };

  const HIDDEN = { autoAlpha: 0, y: 28 * m, rotationX: -55 * m, transformPerspective: 500, filter: `blur(${8 * m}px)` };
  const SHOWN = { autoAlpha: 1, y: 0, rotationX: 0, filter: "blur(0px)" };

  const show = (selector: string, line: string, at?: gsap.Position) =>
    tl.set(q(selector), { autoAlpha: 1 }, at).call(hooks.announce, [line], "<");
  const reveal = (selector: string, at?: gsap.Position, stagger = 0.07) =>
    tl.fromTo(words(selector), HIDDEN, { ...SHOWN, stagger }, at);
  const leave = (selector: string, at: gsap.Position) =>
    tl.fromTo(
      q(selector),
      { y: 0, filter: "blur(0px)" },
      {
        autoAlpha: 0,
        y: -26 * m,
        filter: `blur(${8 * m}px)`,
        duration: 0.7,
        ease: "power2.in",
        immediateRender: false,
      },
      at,
    );
  // Gold script words are "written on" by sweeping the --p mask stop across them.
  const write = (selector: string, at: gsap.Position, duration = 1.1) => {
    const list = words(selector, "ink");
    tl.fromTo(list, { "--p": "0%" }, { "--p": "130%", duration, ease: "power1.inOut", stagger: duration * 0.7 }, at);
    return list;
  };
  const line = (selector: string, content: string, hold: number) => {
    show(selector, content.replaceAll("*", ""));
    reveal(selector);
    if (q(`${selector} .scribble`).length) {
      tl.to(q(`${selector} .scribble path`), { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, "-=.2");
    }
    leave(selector, `+=${hold}`);
  };

  // 1 · Hi + name
  show(".hi", `Hi ${card.addressee}. ${text.greeting}`);
  tl.from(q(".hi-word"), { autoAlpha: 0, y: 18 * m, duration: 0.8 });
  write("#name", "-=.3");
  reveal("#greetingText", "-=.2", 0.05);
  leave(".hi", "+=2.8");

  // 2 · It's your birthday!! :D
  show(".bday", `${text.birthday} :D`);
  // Letter-by-letter text reads badly, so it is hidden from screen readers; an sr-only copy sits beside it.
  tl.from(SplitText.create(one(".bday p"), { type: "words,chars", aria: "hidden" }).chars, {
    autoAlpha: 0,
    y: 60 * m,
    scale: grow(0.3),
    rotation: () => gsap.utils.random(-35, 35) * m,
    duration: 0.7,
    ease: "back.out(2.2)",
    stagger: 0.03,
  });
  tl.to(q(".grin"), { rotation: 90, duration: 0.5, ease: "back.out(3)" }, "+=.3");
  leave(".bday", "+=1.8");

  // 3 · The message that almost got sent
  const draft = one(".draft");
  const letters = Array.from(text.message);
  const typed = { n: 0 };
  const render = () => {
    draft.textContent = letters.slice(0, Math.round(typed.n)).join("");
  };
  render();
  show(".chat", text.message);
  tl.from(q(".phone"), { autoAlpha: 0, y: 70 * m, scale: grow(0.92), duration: 1, ease: "back.out(1.4)" });
  tl.to(typed, { n: letters.length, duration: letters.length * 0.04, ease: "none", onUpdate: render }, "+=.3");
  tl.to(
    q(".send"),
    { backgroundColor: "#f6c56f", color: "#3a2410", scale: 1.15, duration: 0.35, ease: "back.out(3)" },
    "+=.3",
  );
  tl.to(typed, { n: 0, duration: 1.4, ease: "power2.in", onUpdate: render }, "+=1.4");
  tl.to(q(".send"), { backgroundColor: "rgba(255, 255, 255, .1)", color: "#fff6ec", scale: 1, duration: 0.3 }, "<");
  tl.to(q(".chat"), { autoAlpha: 0, y: 30 * m, scale: grow(0.94), duration: 0.7, ease: "power2.in" }, "+=.5");

  // 4 · Second thoughts
  line(".idea-1", text.planned, 2.2);
  line(".idea-2", text.rethink, 1.8);
  line(".idea-3", text.special, 2.2);
  line(".idea-4", text.because, 1.1);
  show(".idea-5", `${text.youAre} :)`);
  tl.fromTo(words(".idea-5"), { ...HIDDEN, y: 50 * m, rotationX: -80 * m }, { ...SHOWN, duration: 1.1, stagger: 0.09 });
  tl.to(q(".smile"), { rotation: 90, duration: 0.6, ease: "back.out(3)" }, "+=.6");
  leave(".idea-5", "+=1.8");

  // 5 · S O
  show(".so", "So…");
  tl.fromTo(
    q(".so-letter"),
    { autoAlpha: 0, scale: grow(3), rotation: 18 * m },
    { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.8, ease: "expo.out", stagger: 0.22 },
  );
  tl.to(q(".so-letter"), { color: "rgba(246, 197, 111, 1)", duration: 0.5, stagger: 0.12 }, "-=.2");
  tl.to(
    q(".so-letter"),
    { autoAlpha: 0, scale: grow(3.2), rotation: -18 * m, duration: 0.8, ease: "expo.in", stagger: 0.14 },
    "+=1",
  );

  // 6 · Make a wish: the timeline waits here until the candles are blown out
  tl.call(hooks.releaseBalloons, undefined, "-=.4");
  show(".cake-scene", text.makeAWish, "<");
  tl.from(q(".cake"), { autoAlpha: 0, y: 140 * m, scale: grow(0.8), duration: 1.1, ease: "back.out(1.5)" }, "<");
  tl.call(hooks.wishMoment, undefined, "<.2");
  tl.to(q(".dim"), { autoAlpha: 1, duration: 1.6, ease: "power1.inOut" }, "<");
  reveal(".prompt", "-=.9", 0.05);
  tl.from(q(".mic"), { autoAlpha: 0, y: 12 * m, duration: 0.6 }, "-=.3");
  tl.addPause("+=.2", hooks.waitForWish);

  // 7 · Candles out, party on
  tl.to(q(".prompt, .mic"), { autoAlpha: 0, duration: 0.4, ease: "power1.out" });
  tl.to(
    q(".flame-wrap"),
    {
      autoAlpha: 0,
      scaleX: 0.3,
      scaleY: 0,
      transformOrigin: "50% 100%",
      duration: 0.35,
      ease: "power2.in",
      stagger: 0.12,
    },
    "<",
  );
  tl.to(q(".halo"), { autoAlpha: 0, duration: 0.8 }, "<");
  tl.fromTo(
    q(".smoke"),
    { autoAlpha: 0.8, y: 0 },
    { autoAlpha: 0, y: -28 * m, duration: 1.8, ease: "power1.out", stagger: 0.12, immediateRender: false },
    "<.25",
  );
  tl.addLabel("party", "<.4");
  tl.to(q(".dim"), { autoAlpha: 0, duration: 0.8, ease: "power2.out" }, "party");
  tl.call(hooks.party, undefined, "party");
  tl.to({}, { duration: 2.8, onUpdate: hooks.cannons }, "party");
  tl.call(hooks.releaseBalloons, ["edges"], "party+=.3");
  tl.to(q(".cake-scene"), { autoAlpha: 0, y: 90 * m, duration: 0.8, ease: "power2.in" }, "party+=1.4");

  // 8 · The wish
  show(".wish", `Happy Birthday!!! ${text.wish}`, "party+=2");
  const hbd = write(".wish-hbd", "party+=3.6", 1.2);
  reveal("#wishText", "-=.4", 0.05);
  tl.to(hbd, { y: -10 * m, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 3, stagger: 0.18 }, "+=.3");
  // The prints land in turn and develop like instant photos. They share a fixed stretch, so more photos
  // land faster instead of lengthening the story. Earlier prints rest askew, alternating sides, under the last.
  const prints = q(".polaroid");
  const gap = Math.min(2.8, 5.6 / (prints.length - 1 || 1));
  prints.forEach((print, i) => {
    const under = prints.length - 1 - i;
    const side = under === 0 ? 0 : under % 2 ? 1 : -1;
    const pose = { rotation: side ? side * 7.5 : -3, xPercent: side * 9 };
    tl.fromTo(
      print,
      { autoAlpha: 0, y: -80 * m, xPercent: pose.xPercent, rotation: pose.rotation - 16 * m, scale: grow(1.25) },
      { autoAlpha: 1, y: 0, ...pose, scale: 1, duration: 1.2, ease: "back.out(1.3)" },
      `party+=${2 + i * gap}`,
    );
    tl.fromTo(
      print.querySelector(".photo"),
      { filter: "brightness(2.6) saturate(0) blur(8px)" },
      { filter: "brightness(1) saturate(1) blur(0px)", duration: 3, ease: "power2.out" },
      "<.3",
    );
  });
  // Tape, hat and dates arrive with the top print.
  tl.from(q(".tape"), { autoAlpha: 0, scale: grow(1.8), duration: 0.5, ease: "back.out(2.5)" }, "<.5");
  tl.from(q(".hat"), { autoAlpha: 0, y: -260 * m, rotation: -60 * m, duration: 1.1, ease: "bounce.out" }, "<.2");
  tl.from(q(".date"), { autoAlpha: 0, duration: 0.8 }, "<.5");
  tl.call(hooks.fireworks, [5], "party+=2.6");
  tl.call(hooks.fireworks, [4], "party+=6");

  // 9 · The end: a heart of stars, then the way back to the start
  tl.addLabel("end", "+=3");
  tl.to(q(".wish"), { autoAlpha: 0, y: -40 * m, scale: grow(0.94), duration: 1, ease: "power2.inOut" }, "end");
  show(".end", `${text.reply} ${text.replay}`, "end+=.6");
  tl.from(
    q(".constellation-star"),
    { autoAlpha: 0, scale: grow(0), transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(3)", stagger: 0.08 },
    "end+=.6",
  );
  tl.to(q(".constellation-line"), { strokeDashoffset: 0, duration: 2.2, ease: "power1.inOut" }, "end+=1.2");
  reveal(".end-msg", "end+=1.4", 0.06);
  tl.from(
    q(".end-actions > *"),
    { autoAlpha: 0, y: 24 * m, duration: 0.7, ease: "back.out(2)", stagger: 0.15 },
    "+=.5",
  );
  tl.from(q(".last-smile"), { autoAlpha: 0, scale: grow(0), duration: 0.5, ease: "back.out(3)" }, "+=.2");
  tl.to(q(".last-smile"), { rotation: 90, duration: 0.6, ease: "back.out(2.5)" }, "+=.7");
  tl.to({}, { duration: 6, onUpdate: () => Math.random() < 0.1 && hooks.heartRain() }, "end+=1");
  tl.call(hooks.finished);

  return tl;
}
