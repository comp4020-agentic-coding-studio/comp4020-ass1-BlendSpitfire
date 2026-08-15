import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import {
  buildScaleRunDegrees,
  CHARACTER_SKELETON,
  CHARACTER_SKELETON_PENTATONIC,
  realizeMelody,
} from "../src/scripts/melody";
import { MODES, frequencyForDegree, modePattern } from "../src/scripts/modes";
import { renderBaselineWheel, renderModeLabel, renderWheel } from "../src/scripts/render-mode-view";
import { layoutWheel } from "../src/scripts/wheel-layout";

const TONIC_HZ = 261.63; // C4

describe("mode interval tables", () => {
  it("every mode has ascending offsets within an octave, with at least 5 notes", () => {
    for (const mode of MODES) {
      expect(mode.offsets.length).toBeGreaterThanOrEqual(5);
      expect(mode.offsets[0]).toBe(0);
      for (let i = 1; i < mode.offsets.length; i++) {
        expect(mode.offsets[i]).toBeGreaterThan(mode.offsets[i - 1]);
        expect(mode.offsets[i]).toBeLessThan(12);
      }
    }
  });

  it("every mode has a group and a non-empty description", () => {
    for (const mode of MODES) {
      expect(["church", "other", "pentatonic"]).toContain(mode.group);
      expect(mode.description.length).toBeGreaterThan(0);
    }
  });

  it("has exactly 7 church modes, and at least one other and one pentatonic scale", () => {
    expect(MODES.filter((m) => m.group === "church")).toHaveLength(7);
    expect(MODES.filter((m) => m.group === "other").length).toBeGreaterThan(0);
    expect(MODES.filter((m) => m.group === "pentatonic").length).toBeGreaterThan(0);
  });

  it("ionian's third is a major third above the tonic", () => {
    const ionian = MODES.find((m) => m.id === "ionian")!;
    const third = frequencyForDegree(TONIC_HZ, ionian, 3);
    expect(third).toBeCloseTo(TONIC_HZ * 2 ** (4 / 12), 1);
  });

  it("aeolian's third is a minor third above the tonic, lower than ionian's", () => {
    const ionian = MODES.find((m) => m.id === "ionian")!;
    const aeolian = MODES.find((m) => m.id === "aeolian")!;
    const minorThird = frequencyForDegree(TONIC_HZ, aeolian, 3);
    const majorThird = frequencyForDegree(TONIC_HZ, ionian, 3);
    expect(minorThird).toBeCloseTo(TONIC_HZ * 2 ** (3 / 12), 1);
    expect(minorThird).toBeLessThan(majorThird);
  });

  it("renders a mode's interval pattern as whole/half steps", () => {
    const ionian = MODES.find((m) => m.id === "ionian")!;
    expect(modePattern(ionian)).toBe("W-W-H-W-W-W-H");
  });
});

describe("scale-run degrees (segment 1: walk every note of this mode's scale)", () => {
  it("ascends through every degree then descends back to the tonic, for any note count", () => {
    expect(buildScaleRunDegrees(5)).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1]);
    expect(buildScaleRunDegrees(6)).toEqual([1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]);
    expect(buildScaleRunDegrees(7)).toEqual([1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1]);
  });
});

describe("melody realization (segment 1 scale-run + segment 2 character tune)", () => {
  it("plays the scale-run segment first, then the character segment, back to back", () => {
    const ionian = MODES.find((m) => m.id === "ionian")!;
    const events = realizeMelody(TONIC_HZ, ionian, 400);

    const scan = events.filter((e) => e.segment === "scan");
    const character = events.filter((e) => e.segment === "character");

    expect(scan.map((e) => e.degree)).toEqual(buildScaleRunDegrees(7));
    expect(character.map((e) => e.degree)).toEqual(CHARACTER_SKELETON);
    expect(character[0].startMs).toBeGreaterThan(scan[scan.length - 1].startMs);
  });

  it("uses the pentatonic character skeleton for 5-note scales, and its own scale-run length", () => {
    const pentatonic = MODES.find((m) => m.id === "major-pentatonic")!;
    const events = realizeMelody(TONIC_HZ, pentatonic, 400);

    const scan = events.filter((e) => e.segment === "scan");
    const character = events.filter((e) => e.segment === "character");

    expect(scan.map((e) => e.degree)).toEqual(buildScaleRunDegrees(5));
    expect(character.map((e) => e.degree)).toEqual(CHARACTER_SKELETON_PENTATONIC);
  });

  it("never produces a non-finite frequency for any mode (guards the degree-beyond-offsets bug)", () => {
    for (const mode of MODES) {
      const events = realizeMelody(TONIC_HZ, mode, 400);
      for (const event of events) {
        expect(Number.isFinite(event.frequency)).toBe(true);
      }
    }
  });

  it("produces different frequencies for the same skeleton in different modes", () => {
    const ionian = MODES.find((m) => m.id === "ionian")!;
    const phrygian = MODES.find((m) => m.id === "phrygian")!;

    const ionianEvents = realizeMelody(TONIC_HZ, ionian, 400).filter((e) => e.segment === "character");
    const phrygianEvents = realizeMelody(TONIC_HZ, phrygian, 400).filter((e) => e.segment === "character");

    expect(ionianEvents[1].frequency).not.toBeCloseTo(phrygianEvents[1].frequency, 1);
  });
});

describe("wheel rendering (the visible state a mode-switch produces)", () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");

  it("draws a fixed skeleton of 7 naturals and 5 accidentals, regardless of mode", () => {
    const container = dom.window.document.createElement("div");
    const ionian = MODES.find((m) => m.id === "ionian")!;
    renderWheel(container, ionian, null);

    expect(container.querySelectorAll(".wheel-note-natural")).toHaveLength(7);
    expect(container.querySelectorAll(".wheel-note-accidental")).toHaveLength(5);
    expect(container.dataset.mode).toBe("ionian");
  });

  it("colors all 7 of a mode's scale notes ahead of time, even with nothing playing", () => {
    const container = dom.window.document.createElement("div");
    const dorian = MODES.find((m) => m.id === "dorian")!;
    renderWheel(container, dorian, null);

    const inScale = container.querySelectorAll(".wheel-note-in-scale");
    expect(inScale).toHaveLength(7);
    const semitones = Array.from(inScale)
      .map((el) => Number(el.getAttribute("data-semitone")))
      .sort((a, b) => a - b);
    expect(semitones).toEqual([...dorian.offsets].sort((a, b) => a - b));
    for (const el of inScale) {
      expect((el as SVGElement).style.fill).not.toBe("");
    }
    expect(container.querySelectorAll(".wheel-note-playing")).toHaveLength(0);
  });

  it("colors only 5 notes ahead of time for a pentatonic mode", () => {
    const container = dom.window.document.createElement("div");
    const pentatonic = MODES.find((m) => m.id === "major-pentatonic")!;
    renderWheel(container, pentatonic, null);

    expect(container.querySelectorAll(".wheel-note-in-scale")).toHaveLength(5);
  });

  it("marks exactly the active degree's note, colored in the mode's color, even on an accidental", () => {
    const container = dom.window.document.createElement("div");
    const dorian = MODES.find((m) => m.id === "dorian")!;
    // Dorian's degree 3 (offset 3 semitones from C) lands on the D♯/E♭ accidental, not a natural.
    renderWheel(container, dorian, 3);

    const playing = container.querySelectorAll(".wheel-note-playing");
    expect(playing).toHaveLength(1);
    expect(playing[0].getAttribute("data-semitone")).toBe("3");
    expect(playing[0].classList.contains("wheel-note-accidental")).toBe(true);
    expect((playing[0] as SVGElement).style.fill).not.toBe("");
  });

  it("clears the previous mode's playing state when switching modes", () => {
    const container = dom.window.document.createElement("div");
    const ionian = MODES.find((m) => m.id === "ionian")!;
    const aeolian = MODES.find((m) => m.id === "aeolian")!;

    renderWheel(container, ionian, 2);
    renderWheel(container, aeolian, null);

    expect(container.dataset.mode).toBe("aeolian");
    expect(container.querySelectorAll(".wheel-note-playing")).toHaveLength(0);
  });
});

describe("baseline wheel (all 12 notes, no mode applied)", () => {
  it("draws all 12 notes with no scale or playing state", () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    const container = dom.window.document.createElement("div");
    renderBaselineWheel(container);

    expect(container.querySelectorAll(".wheel-note")).toHaveLength(12);
    expect(container.querySelectorAll(".wheel-note-in-scale")).toHaveLength(0);
    expect(container.querySelectorAll(".wheel-note-playing")).toHaveLength(0);
  });
});

describe("wheel layout geometry", () => {
  const center = { x: 150, y: 150 };
  const notes = layoutWheel(center, 95, 41, 14);

  it("has 7 naturals and 5 accidentals (no accidental between E-F or B-C)", () => {
    const naturals = notes.filter((n) => n.isNatural);
    const accidentals = notes.filter((n) => !n.isNatural);
    expect(naturals).toHaveLength(7);
    expect(accidentals).toHaveLength(5);
    expect(naturals.map((n) => n.label)).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  it("places the first natural (C) at the top of the circle", () => {
    const c = notes.find((n) => n.label === "C")!;
    expect(c.point.x).toBeCloseTo(center.x, 5);
    expect(c.point.y).toBeCloseTo(center.y - 95, 5);
  });

  it("nests each accidental's centre beyond the ring radius, in the gap outside its neighbours", () => {
    for (const note of notes.filter((n) => !n.isNatural)) {
      const distanceFromCenter = Math.hypot(note.point.x - center.x, note.point.y - center.y);
      expect(distanceFromCenter).toBeGreaterThan(95);
    }
  });
});

describe("mode label rendering", () => {
  it("names the mode, its interval pattern, and its description", () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    const container = dom.window.document.createElement("div");
    const phrygian = MODES.find((m) => m.id === "phrygian")!;

    renderModeLabel(container, phrygian);

    expect(container.textContent).toContain("Phrygian");
    expect(container.textContent).toContain(modePattern(phrygian));
    expect(container.textContent).toContain(phrygian.description);
  });
});
