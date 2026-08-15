import type { MelodyEvent } from "./melody";

export interface PlaybackHandle {
  stop: () => void;
}

export function playMelody(
  events: MelodyEvent[],
  onNoteStart: (event: MelodyEvent) => void,
): PlaybackHandle {
  const audioContext = new AudioContext();
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const oscillators: OscillatorNode[] = [];

  for (const event of events) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = event.frequency;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    const startAt = audioContext.currentTime + event.startMs / 1000;
    const stopAt = startAt + event.durationMs / 1000;
    gain.gain.setValueAtTime(0.2, startAt);
    gain.gain.setValueAtTime(0.2, stopAt - 0.03);
    gain.gain.linearRampToValueAtTime(0, stopAt);

    oscillator.start(startAt);
    oscillator.stop(stopAt);
    oscillators.push(oscillator);

    timeouts.push(setTimeout(() => onNoteStart(event), event.startMs));
  }

  return {
    stop: () => {
      for (const timeout of timeouts) clearTimeout(timeout);
      for (const oscillator of oscillators) {
        try {
          oscillator.stop();
        } catch {
          // already stopped
        }
      }
      void audioContext.close();
    },
  };
}
