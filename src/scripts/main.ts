import type { PlaybackHandle } from "./audio-player";
import { playMelody } from "./audio-player";
import { realizeMelody } from "./melody";
import { MODES } from "./modes";
import { renderModeLabel, renderWheel } from "./render-mode-view";

const TONIC_HZ = 261.63; // C4
const NOTE_DURATION_MS = 400;

const wheel = document.querySelector<HTMLElement>("#wheel");
const label = document.querySelector<HTMLElement>("#mode-label");
const buttons = document.querySelectorAll<HTMLButtonElement>("[data-mode-button]");

if (wheel && label && buttons.length > 0) {
  let playback: PlaybackHandle | null = null;

  const activate = (modeId: string) => {
    const mode = MODES.find((candidate) => candidate.id === modeId);
    if (!mode) return;

    playback?.stop();

    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.modeButton === modeId));
    }

    renderModeLabel(label, mode);
    renderWheel(wheel, mode, null);

    const events = realizeMelody(TONIC_HZ, mode, NOTE_DURATION_MS);
    playback = playMelody(events, (event) => {
      renderWheel(wheel, mode, event.degree);
    });
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const modeId = button.dataset.modeButton;
      if (modeId) activate(modeId);
    });
  }

  renderModeLabel(label, MODES[0]);
  renderWheel(wheel, MODES[0], null);
}
