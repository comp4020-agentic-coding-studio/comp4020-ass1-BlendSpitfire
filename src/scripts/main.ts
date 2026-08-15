import { playMelody, playNote } from "./audio-player";
import { buildScaleRunDegrees, realizeDegrees } from "./melody";
import { MODES } from "./modes";
import type { Mode } from "./modes";
import { renderBaselineWheel, renderModeLabel, renderWheel } from "./render-mode-view";

const TONIC_HZ = 261.63; // C4
const NOTE_DURATION_MS = 400;

const wheel = document.querySelector<HTMLElement>("#wheel");
const label = document.querySelector<HTMLElement>("#mode-label");
const buttons = document.querySelectorAll<HTMLButtonElement>("[data-mode-button]");
const scaleButton = document.querySelector<HTMLButtonElement>("#play-scale-button");
const baselineWheel = document.querySelector<HTMLElement>("#baseline-wheel");

let stopCurrentPlayback: (() => void) | null = null;

// Wraps an (possibly octave-spanning) degree back onto the wheel's 12
// positions, so playback can highlight the note actually sounding.
function playAndTrack(degrees: number[], mode: Mode, onDegree: (degree: number) => void) {
  stopCurrentPlayback?.();
  const events = realizeDegrees(TONIC_HZ, mode, degrees, NOTE_DURATION_MS);
  const playback = playMelody(events, (event) => onDegree(((event.degree - 1) % mode.offsets.length) + 1));
  stopCurrentPlayback = () => playback.stop();
}

function playSingleNote(semitone: number) {
  stopCurrentPlayback?.();
  playNote(TONIC_HZ * 2 ** (semitone / 12));
}

if (baselineWheel) {
  renderBaselineWheel(baselineWheel, playSingleNote);
}

if (wheel && label && buttons.length > 0) {
  let currentMode = MODES[0];

  const activate = (modeId: string) => {
    const mode = MODES.find((candidate) => candidate.id === modeId);
    if (!mode) return;
    currentMode = mode;

    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.modeButton === modeId));
    }

    renderModeLabel(label, mode);
    renderWheel(wheel, mode, null, playSingleNote);

    playAndTrack(mode.tune, mode, (degree) => renderWheel(wheel, mode, degree, playSingleNote));
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const modeId = button.dataset.modeButton;
      if (modeId) activate(modeId);
    });
  }

  scaleButton?.addEventListener("click", () => {
    playAndTrack(buildScaleRunDegrees(currentMode.offsets.length), currentMode, (degree) =>
      renderWheel(wheel, currentMode, degree, playSingleNote),
    );
  });

  renderModeLabel(label, MODES[0]);
  renderWheel(wheel, MODES[0], null, playSingleNote);
}
