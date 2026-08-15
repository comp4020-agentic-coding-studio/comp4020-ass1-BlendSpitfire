import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { realizeMelody } from "../src/scripts/melody";
import { MODES, frequencyForDegree, modePattern } from "../src/scripts/modes";
import { renderModeLabel, renderWheel } from "../src/scripts/render-mode-view";
import { layoutWheel } from "../src/scripts/wheel-layout";

const TONIC_HZ = 261.63; // C4

describe("mode interval tables", () => {
  it("every mode has 7 ascending offsets within an octave", () => {
    for (const mode of MODES) {
      expect(mode.offsets).toHaveLength(7);
      expect(mode.offsets[0]).toBe(0);
      for (let i = 1; i < mode.offsets.length; i++) {
        expect(mode.offsets[i]).toBeGreaterThan(mode.offsets[i - 1]);
        expect(mode.offsets[i]).toBeLessThan(12);
      }
    }
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

describe("melody realization", () => {
  it("realizes the 9-note skeleton in order with non-overlapping timing", () => {
    const ionian = MODES.find((m) => m.id === "ionian")!;
    const events = realizeMelody(TONIC_HZ, ionian, 400);

    expect(events).toHaveLength(9);
    expect(events.map((e) => e.degree)).toEqual([1, 2, 3, 4, 5, 6, 5, 3, 1]);
    events.forEach((event, index) => {
      expect(event.startMs).toBe(index * 400);
    });
  });

  it("produces different frequencies for the same skeleton in different modes", () => {
    const ionian = MODES.find((m) => m.id === "ionian")!;
    const phrygian = MODES.find((m) => m.id === "phrygian")!;

    const ionianEvents = realizeMelody(TONIC_HZ, ionian, 400);
    const phrygianEvents = realizeMelody(TONIC_HZ, phrygian, 400);

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
  it("names the mode and its interval pattern", () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    const container = dom.window.document.createElement("div");
    const phrygian = MODES.find((m) => m.id === "phrygian")!;

    renderModeLabel(container, phrygian);

    expect(container.textContent).toContain("Phrygian");
    expect(container.textContent).toContain(modePattern(phrygian));
  });
});
