import type { Mode } from "./modes";
import { modePattern } from "./modes";
import { layoutWheel } from "./wheel-layout";

const SVG_NS = "http://www.w3.org/2000/svg";
const VIEW_SIZE = 300;
const CENTER = { x: VIEW_SIZE / 2, y: VIEW_SIZE / 2 };
const RING_RADIUS = 94;
const BIG_RADIUS = 32;
const SMALL_RADIUS = 16;

// Uses the container's own document (not the global `document`) so this is
// callable from a test with no ambient DOM, and from the real page either way.
export function renderWheel(container: HTMLElement, mode: Mode, activeDegree: number | null): void {
  const doc = container.ownerDocument;
  container.innerHTML = "";
  container.dataset.mode = mode.id;

  const scaleSemitones = new Set(mode.offsets);
  const activeSemitone = activeDegree !== null ? mode.offsets[activeDegree - 1] : null;

  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEW_SIZE} ${VIEW_SIZE}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${mode.name} scale wheel`);

  for (const note of layoutWheel(CENTER, RING_RADIUS, BIG_RADIUS, SMALL_RADIUS)) {
    const isInScale = scaleSemitones.has(note.semitone);
    const isPlaying = note.semitone === activeSemitone;

    const circle = doc.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", String(note.point.x));
    circle.setAttribute("cy", String(note.point.y));
    circle.setAttribute("r", String(note.radius));
    const classes = ["wheel-note", note.isNatural ? "wheel-note-natural" : "wheel-note-accidental"];
    if (isInScale) classes.push("wheel-note-in-scale");
    if (isPlaying) classes.push("wheel-note-playing");
    circle.setAttribute("class", classes.join(" "));
    circle.dataset.semitone = String(note.semitone);
    if (isInScale) {
      circle.style.fill = mode.color;
    }
    svg.append(circle);

    const label = doc.createElementNS(SVG_NS, "text");
    label.setAttribute("x", String(note.point.x));
    label.setAttribute("y", String(note.point.y));
    label.setAttribute("class", note.isNatural ? "wheel-note-label" : "wheel-note-label-small");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "central");
    label.textContent = note.label;
    svg.append(label);
  }

  container.append(svg);
}

// A static "here is everything" wheel: all 12 notes in one neutral color,
// no scale or playing state — the baseline every mode picks a subset from.
export function renderBaselineWheel(container: HTMLElement): void {
  const doc = container.ownerDocument;
  container.innerHTML = "";

  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${VIEW_SIZE} ${VIEW_SIZE}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "All 12 notes, with no mode applied");

  for (const note of layoutWheel(CENTER, RING_RADIUS, BIG_RADIUS, SMALL_RADIUS)) {
    const circle = doc.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", String(note.point.x));
    circle.setAttribute("cy", String(note.point.y));
    circle.setAttribute("r", String(note.radius));
    circle.setAttribute(
      "class",
      ["wheel-note", "wheel-note-baseline", note.isNatural ? "wheel-note-natural" : "wheel-note-accidental"].join(
        " ",
      ),
    );
    circle.dataset.semitone = String(note.semitone);
    svg.append(circle);

    const label = doc.createElementNS(SVG_NS, "text");
    label.setAttribute("x", String(note.point.x));
    label.setAttribute("y", String(note.point.y));
    label.setAttribute(
      "class",
      ["wheel-note-baseline", note.isNatural ? "wheel-note-label" : "wheel-note-label-small"].join(" "),
    );
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "central");
    label.textContent = note.label;
    svg.append(label);
  }

  container.append(svg);
}

export function renderModeLabel(container: HTMLElement, mode: Mode): void {
  const doc = container.ownerDocument;
  container.innerHTML = "";

  const name = doc.createElement("span");
  name.className = "mode-name";
  name.textContent = `${mode.name} — ${mode.character}`;

  const pattern = doc.createElement("span");
  pattern.className = "mode-pattern";
  pattern.textContent = modePattern(mode);

  const description = doc.createElement("p");
  description.className = "mode-description";
  description.textContent = mode.description;

  container.append(name, pattern, description);
}
