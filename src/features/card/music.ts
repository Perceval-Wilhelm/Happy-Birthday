import { gsap } from "gsap";

/**
 * The song plays from the gift onwards, goes quiet for the wish and starts again from the top when
 * the candles go out. iOS ignores `volume`, so fades there are instant; everything else still works.
 */
export function createMusic(audio: HTMLAudioElement, onBlocked: () => void) {
  const level = { value: audio.volume };
  let wanted = false;

  const fade = (to: number, duration: number, onComplete?: () => void) =>
    gsap.to(level, {
      value: to,
      duration,
      overwrite: true,
      onUpdate: () => {
        audio.volume = level.value;
      },
      onComplete,
    });

  const play = () => {
    audio.play().catch(onBlocked);
  };

  return {
    /** Must run inside the tap that opens the gift: that gesture is what lets phones play audio. */
    start() {
      wanted = true;
      level.value = audio.volume = 0;
      play();
      fade(1, 2.5);
    },
    hush() {
      wanted = false;
      fade(0, 1.2, () => audio.pause());
    },
    restart() {
      wanted = true;
      audio.currentTime = 0;
      level.value = audio.volume = 0;
      play();
      fade(1, 1);
    },
    /** Mutes or unmutes; returns whether it is now muted. Unmuting after a blocked start retries playback. */
    toggleMute() {
      audio.muted = !audio.muted;
      if (!audio.muted && wanted && audio.paused) play();
      return audio.muted;
    },
    onHidden() {
      audio.pause();
    },
    onVisible() {
      if (wanted) play();
    },
    dispose() {
      gsap.killTweensOf(level);
      audio.pause();
    },
  };
}
