import { initialBlowState, stepBlow } from "@/lib/blow";

type Listeners = { onLevel(intensity: number): void; onBlow(): void };

/**
 * Listens for someone blowing on the microphone. Resolves to a stop function once listening; rejects
 * if the browser has no microphone or permission is refused. The stream is released after a blow.
 */
export async function listenForBlow({ onLevel, onBlow }: Listeners): Promise<() => void> {
  // Noise suppression would remove exactly the sound of a breath, so all processing is off.
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const audio = new AudioContext();
  const analyser = audio.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.2;
  audio.createMediaStreamSource(stream).connect(analyser);

  const bins = new Uint8Array(analyser.frequencyBinCount);
  // A breath is mostly below ~1.5 kHz.
  const low = Math.max(4, Math.round(1500 / (audio.sampleRate / analyser.fftSize)));
  let state = initialBlowState();
  let frame = 0;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    stream.getTracks().forEach((track) => track.stop());
    void audio.close();
    onLevel(0);
  };

  const tick = (now: number) => {
    analyser.getByteFrequencyData(bins);
    let sum = 0;
    for (let i = 1; i <= low; i++) sum += bins[i];
    const step = stepBlow(state, sum / low / 255, now);
    state = step.state;
    onLevel(step.intensity);
    if (step.blown) {
      stop();
      onBlow();
    } else {
      frame = requestAnimationFrame(tick);
    }
  };
  frame = requestAnimationFrame(tick);
  return stop;
}
