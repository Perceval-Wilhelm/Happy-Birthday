"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { formatRemaining, remainingUntil } from "@/lib/countdown";
import { moment } from "@/lib/moments";
import { emphasis } from "@/lib/text";
import { createBalloons } from "./balloons";
import { Cake } from "./Cake";
import { Constellation } from "./Constellation";
import { buzz, effects, originOf, PALETTE } from "./effects";
import { createFireworks } from "./fireworks";
import { GiftBox } from "./GiftBox";
import { listenForBlow } from "./mic";
import { createMusic } from "./music";
import type { ResolvedCard } from "./resolve";
import { createSky } from "./sky";
import { buildStory } from "./story";

gsap.registerPlugin(useGSAP, SplitText);

type MicState = "off" | "starting" | "listening" | "unavailable";
type Controls = {
  music: ReturnType<typeof createMusic>;
  fireworks: ReturnType<typeof createFireworks>;
};

const MIC_LABEL: Record<MicState, string> = {
  off: "🎤 Hoặc thổi thật vào micro",
  starting: "Đang mở micro…",
  listening: "Đang nghe… thổi thật mạnh nha 🌬️",
  unavailable: "Micro không mở được, chạm vào nến nha",
};

const keepAwake = () => navigator.wakeLock?.request("screen").catch(() => {});

/** Renders a story line, giving words marked with *asterisks* the hand-drawn gold underline. */
function Line({ text }: { text: string }) {
  return emphasis(text).map((segment) =>
    segment.marked ? (
      <span key={`mark-${segment.text}`} className="mark">
        {segment.text}
        <svg className="scribble" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
          <path d="M6 12C56 4 130 2 196 7C150 9 90 12 30 18" pathLength={1} />
        </svg>
      </span>
    ) : (
      segment.text
    ),
  );
}

export function BirthdayCard({ card }: { card: ResolvedCard }) {
  const { text } = card;
  const rootRef = useRef<HTMLDivElement>(null);
  const songRef = useRef<HTMLAudioElement>(null);
  const storyRef = useRef<gsap.core.Timeline | null>(null);
  const controlsRef = useRef<Controls | null>(null);
  const startedRef = useRef(false);
  const waitingRef = useRef(false);
  const autoBlowRef = useRef<gsap.core.Tween | null>(null);
  const stopMicRef = useRef<(() => void) | null>(null);
  const [muted, setMuted] = useState(false);
  const [mic, setMic] = useState<MicState>("off");
  const [micSupported, setMicSupported] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [now, setNow] = useState<number | null>(null);

  const remaining = card.unlockAt ? (now === null ? Infinity : remainingUntil(card.unlockAt, now)) : 0;
  const locked = remaining > 0;

  function blow(how: "tap" | "mic" | "auto") {
    if (!waitingRef.current) return;
    waitingRef.current = false;
    rootRef.current?.querySelector(".cake")?.removeAttribute("data-waiting");
    autoBlowRef.current?.kill();
    stopMicRef.current?.();
    stopMicRef.current = null;
    setMic((state) => (state === "listening" || state === "starting" ? "off" : state));
    moment(`wish-${how}`);
    storyRef.current?.play();
  }

  const { context } = useGSAP(
    () => {
      const el = rootRef.current!;
      const q = gsap.utils.selector(el);
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const sky = createSky(q(".sky")[0] as HTMLCanvasElement, reduce);
      const fireworks = createFireworks(q(".fireworks")[0] as HTMLCanvasElement, PALETTE, reduce);
      const balloons = createBalloons(q(".balloons")[0] as HTMLElement, reduce);
      const music = createMusic(songRef.current!, () => setMuted(true));
      controlsRef.current = { music, fireworks };
      effects.attach(q(".confetti")[0] as HTMLCanvasElement);
      // Dates differ between the server and the viewer's timezone, so the captions are filled in here.
      const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
      for (const date of q(".date")) date.textContent = `♡ ${today}`;

      const tl = buildStory(el, card, reduce, {
        announce: setAnnouncement,
        releaseBalloons: balloons.release,
        wishMoment() {
          music.hush();
          sky.shoot();
        },
        waitForWish() {
          waitingRef.current = true;
          const cake = q(".cake")[0] as HTMLButtonElement;
          cake.dataset.waiting = "true"; // shows the "tap here" ring until the candles are out
          cake.focus({ preventScroll: true });
          autoBlowRef.current = gsap.delayedCall(25, () => blow("auto")); // nobody stays stuck if the hint is missed
        },
        party() {
          music.restart();
          effects.candleBurst(originOf(q(".cake")[0], 0.2));
          buzz([30, 40, 30]);
        },
        cannons: effects.cannons,
        fireworks: fireworks.salvo,
        heartRain: effects.heartRain,
        finished: () => moment("story-finished"),
      });
      const bar = q(".progress span");
      tl.eventCallback("onUpdate", () => gsap.set(bar, { scaleX: tl.progress() }));
      storyRef.current = tl;

      const onTap = (event: PointerEvent) =>
        effects.sparkle({ x: event.clientX / innerWidth, y: event.clientY / innerHeight });
      addEventListener("pointerdown", onTap);

      // On a mouse, the polaroid leans toward the pointer.
      const wish = q(".wish")[0] as HTMLElement;
      const tilt = q(".polaroid-tilt")[0] as HTMLElement;
      const leanX = gsap.quickTo(tilt, "rotationY", { duration: 0.6, ease: "power3" });
      const leanY = gsap.quickTo(tilt, "rotationX", { duration: 0.6, ease: "power3" });
      gsap.set(tilt, { transformPerspective: 800 });
      const lean = (event: PointerEvent) => {
        const r = tilt.getBoundingClientRect();
        leanX(((event.clientX - r.left) / r.width - 0.5) * 16);
        leanY(-((event.clientY - r.top) / r.height - 0.5) * 16);
      };
      const straighten = () => {
        leanX(0);
        leanY(0);
      };
      const canLean = !reduce && matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (canLean) {
        wish.addEventListener("pointermove", lean);
        wish.addEventListener("pointerleave", straighten);
      }

      return () => {
        removeEventListener("pointerdown", onTap);
        wish.removeEventListener("pointermove", lean);
        wish.removeEventListener("pointerleave", straighten);
        autoBlowRef.current?.kill();
        stopMicRef.current?.();
        sky.dispose();
        fireworks.dispose();
        balloons.dispose();
        music.dispose();
        effects.detach();
      };
    },
    { scope: rootRef },
  );

  // The gift can stay locked until a set moment; the clock only runs in the browser.
  useEffect(() => {
    if (!card.unlockAt) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [card.unlockAt]);

  useEffect(() => {
    const supported = typeof navigator.mediaDevices?.getUserMedia === "function" && "AudioContext" in window;
    const timer = setTimeout(() => setMicSupported(supported), 0);
    const onVisibility = () => {
      if (!startedRef.current) return;
      if (document.hidden) {
        controlsRef.current?.music.onHidden();
      } else {
        controlsRef.current?.music.onVisible();
        keepAwake();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Animations started from events join the useGSAP context, so they are cleaned up with the card.
  function open() {
    const q = gsap.utils.selector(rootRef);
    if (locked) {
      context.add(() =>
        gsap.fromTo(
          q(".gift-box"),
          { x: 0 },
          { x: 8, duration: 0.06, repeat: 5, yoyo: true, ease: "none", clearProps: "x" },
        ),
      );
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    controlsRef.current?.music.start();
    keepAwake();
    moment("gift-opened");
    buzz(20);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const m = reduce ? 0 : 1;
    context.add(() =>
      gsap
        .timeline({ onComplete: () => storyRef.current?.play() })
        .add(() => q(".gift")[0].classList.add("is-open"))
        .to(q(".lid"), {
          y: -90 * m,
          x: 18 * m,
          rotation: 30 * m,
          autoAlpha: 0,
          transformOrigin: "50% 100%",
          duration: 0.8,
          ease: "power2.out",
        })
        .fromTo(
          q(".gift-glow"),
          { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" },
          { opacity: 1, scale: 1.4, duration: 0.6 },
          "<",
        )
        .call(() => effects.giftBurst(originOf(q(".gift-box")[0], 0.45)), undefined, "<.1")
        .fromTo(
          q(".gate"),
          { filter: "blur(0px)" },
          { autoAlpha: 0, scale: reduce ? 1 : 1.15, filter: `blur(${10 * m}px)`, duration: 1, ease: "power2.in" },
          "+=.5",
        )
        .to(q(".sound, .progress"), { autoAlpha: 1, duration: 0.6 }, "-=.3"),
    );
  }

  const startMic = async () => {
    if (mic === "starting" || mic === "listening" || !waitingRef.current) return;
    setMic("starting");
    try {
      stopMicRef.current = await listenForBlow({
        onLevel: (level) => rootRef.current?.style.setProperty("--breath", level.toFixed(3)),
        onBlow: () => blow("mic"),
      });
      if (waitingRef.current) setMic("listening");
    } catch {
      setMic("unavailable");
    }
  };

  const replay = () => {
    effects.reset();
    controlsRef.current?.fireworks.clear();
    moment("replayed");
    storyRef.current?.restart();
  };

  const toggleSound = () => {
    const nowMuted = controlsRef.current?.music.toggleMute();
    if (nowMuted !== undefined) setMuted(nowMuted);
  };

  const hearts = (event: MouseEvent<HTMLButtonElement>) => effects.heartBurst(originOf(event.currentTarget));

  return (
    <div ref={rootRef} className="card">
      <canvas className="sky" aria-hidden="true" />
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="moon" aria-hidden="true" />
      <div className="balloons" aria-hidden="true" />
      <div className="dim" aria-hidden="true" />
      <canvas className="fireworks" aria-hidden="true" />
      <canvas className="confetti" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="progress" aria-hidden="true">
        <span />
      </div>
      {/* Background music: the only words are the birthday song itself. */}
      {/* eslint-disable-next-line jsx-a11y-x/media-has-caption */}
      <audio ref={songRef} className="song" src={card.music} loop preload="auto" />

      <section className="gate" aria-label="Món quà">
        <p className="gate-to">Gửi {card.addressee} 💌</p>
        {card.unlockAt && locked && (
          <p className="countdown" role="timer">
            <span className="countdown-label">Quà sẽ mở sau</span>
            <span className="countdown-time">{now === null ? "··:··:··" : formatRemaining(remaining)}</span>
          </p>
        )}
        <button className="gift" type="button" onClick={open} aria-disabled={locked}>
          <span className="gift-box">
            <GiftBox />
          </span>
          <span className="gift-label">{locked ? "Chưa tới giờ đâu nha 🤫" : "Mở quà"}</span>
        </button>
        <p className="gate-hint">🔊 Bật âm thanh để trọn vẹn hơn nha</p>
      </section>

      <main className="stage">
        <section className="scene hi">
          <h1>
            <span className="hi-word">Hi</span>{" "}
            <span id="name" className="script">
              {card.addressee}
            </span>
          </h1>
          <p className="two" id="greetingText">
            {text.greeting}
          </p>
        </section>

        <section className="scene bday">
          <p>
            {text.birthday} <span className="grin">:D</span>
          </p>
          <span className="sr-only">{text.birthday} :D</span>
        </section>

        <section className="scene chat">
          <div className="phone">
            <header className="chat-head">
              <svg className="back" viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <Image className="avatar" src={card.photos[0]} alt="" width={38} height={38} sizes="38px" />
              <div>
                <strong>{card.addressee}</strong>
                <small>Đang hoạt động</small>
              </div>
            </header>
            <div className="chat-body">
              <Image className="avatar avatar-lg" src={card.photos[0]} alt="" width={78} height={78} sizes="78px" />
              <strong>{card.addressee}</strong>
              <small>Hôm nay</small>
            </div>
            <div className="composer">
              <p className="field">
                <span className="draft hbd-chatbox">{text.message}</span>
                <i className="caret" />
              </p>
              <span className="send" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </span>
            </div>
          </div>
        </section>

        <p className="scene line idea-1">
          <Line text={text.planned} />
        </p>
        <p className="scene line idea-2">
          <Line text={text.rethink} />
        </p>
        <p className="scene line idea-3">
          <Line text={text.special} />
        </p>
        <p className="scene line idea-4">
          <Line text={text.because} />
        </p>
        <p className="scene line idea-5">
          <Line text={text.youAre} /> <span className="smile">:)</span>
        </p>
        <p className="scene so">
          <span className="so-letter" aria-hidden="true">
            S
          </span>
          <span className="so-letter" aria-hidden="true">
            O
          </span>
          <span className="sr-only">So</span>
        </p>

        <section className="scene cake-scene">
          <button className="cake" type="button" aria-label="Thổi nến" onClick={() => blow("tap")}>
            <span className="halo" />
            <Cake />
            <span className="tap" />
          </button>
          <p className="prompt">
            <Line text={text.makeAWish} />
          </p>
          <button className="mic" type="button" data-state={mic} hidden={!micSupported} onClick={startMic}>
            {MIC_LABEL[mic]}
          </button>
        </section>

        <section className="scene wish">
          <div className="polaroid-tilt">
            {card.photos.map((photo) => (
              <figure className="polaroid" key={photo.src}>
                <Image
                  className="photo"
                  src={photo}
                  alt={`Ảnh của ${card.addressee}`}
                  sizes="(min-width: 900px) 330px, 62vw"
                  placeholder="blur"
                />
                <figcaption className="date" />
              </figure>
            ))}
            <span className="tape" />
            <Image className="hat" src="/hat.svg" alt="" width={582} height={930} unoptimized />
            <i className="sparkle" />
            <i className="sparkle" />
            <i className="sparkle" />
            <i className="sparkle" />
            <i className="sparkle" />
          </div>
          <div className="wish-text">
            <h2 className="wish-hbd">Happy Birthday!!!</h2>
            <p id="wishText">{text.wish}</p>
          </div>
        </section>

        <section className="scene end">
          <Constellation />
          <p className="end-msg">{text.reply}</p>
          <div className="end-actions">
            {card.replyUrl && (
              <a className="reply" href={card.replyUrl} target="_blank" rel="noopener noreferrer">
                {text.replyButton}
              </a>
            )}
            <button id="replay" className="replay" type="button" onClick={replay}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <span>{text.replay}</span>
            </button>
          </div>
          <button className="last-smile" type="button" aria-label="Thả tim" onClick={hearts}>
            :)
          </button>
        </section>
      </main>

      <button className="sound" type="button" aria-label="Nhạc nền" aria-pressed={!muted} onClick={toggleSound}>
        <span />
        <span />
        <span />
      </button>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
