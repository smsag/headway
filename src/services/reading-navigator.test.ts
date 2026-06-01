import { describe, expect, it, vi } from "vitest";
import type { MarkdownView } from "obsidian";
import type { HeadingIndex } from "../types";
import {
  flashReadingHeading,
  resolveViewportLineForReadingView,
  scrollReadingHeadingIntoView
} from "./reading-navigator";

const headingIndex: HeadingIndex = [
  { level: 1, text: "A", lineNumber: 0 },
  { level: 2, text: "A.1", lineNumber: 10 },
  { level: 1, text: "B", lineNumber: 25 }
];

function createPreviewRoot(offsets: number[]): HTMLElement {
  const headings = offsets.map((offset) => {
    const classes = new Set<string>();
    const el = {
      offsetTop: offset,
      scrollIntoView: vi.fn(),
      offsetWidth: 100,
      classList: {
        add: (name: string) => {
          classes.add(name);
        },
        remove: (name: string) => {
          classes.delete(name);
        },
        contains: (name: string) => classes.has(name)
      }
    };

    return el as unknown as HTMLElement;
  });

  return {
    offsetTop: 40,
    querySelectorAll: (selector: string) => {
      if (selector === "h1, h2, h3, h4, h5, h6") {
        return headings as unknown as NodeListOf<Element>;
      }

      return [] as unknown as NodeListOf<Element>;
    }
  } as unknown as HTMLElement;
}

function createView(
  mode: "source" | "preview",
  previewRoot: HTMLElement | null,
  overlayHeight = 0
): MarkdownView {
  const overlay = overlayHeight > 0 ? ({ offsetHeight: overlayHeight } as HTMLElement) : null;

  return {
    getMode: () => mode,
    contentEl: {
      querySelector: (selector: string) => {
        if (selector === ".headway-overlay") {
          return overlay;
        }

        return null;
      }
    },
    containerEl: {
      querySelector: (selector: string) => {
        if (selector === ".markdown-preview-view") {
          return previewRoot;
        }

        return null;
      }
    }
  } as unknown as MarkdownView;
}

describe("resolveViewportLineForReadingView", () => {
  it("returns fallback when not in preview mode", () => {
    const view = createView("source", createPreviewRoot([10, 200, 400]));
    expect(resolveViewportLineForReadingView(view, headingIndex, 7, 300)).toBe(7);
  });

  it("maps scroll top to closest heading line in preview", () => {
    const view = createView("preview", createPreviewRoot([20, 180, 600]));
    expect(resolveViewportLineForReadingView(view, headingIndex, 0, 0)).toBe(0);
    expect(resolveViewportLineForReadingView(view, headingIndex, 0, 200)).toBe(10);
    expect(resolveViewportLineForReadingView(view, headingIndex, 0, 900)).toBe(25);
  });

  it("switches headings based on the visible top edge below the overlay", () => {
    const view = createView("preview", createPreviewRoot([20, 180, 600]), 48);

    expect(resolveViewportLineForReadingView(view, headingIndex, 0, 130)).toBe(0);
    expect(resolveViewportLineForReadingView(view, headingIndex, 0, 131)).toBe(10);
  });
});

describe("scrollReadingHeadingIntoView", () => {
  it("returns false when not in preview mode", () => {
    const view = createView("source", createPreviewRoot([20, 180, 600]));
    expect(scrollReadingHeadingIntoView(view, headingIndex, 10)).toBe(false);
  });

  it("scrolls the rendered heading matching the source line", () => {
    const previewRoot = createPreviewRoot([20, 180, 600]);
    const view = createView("preview", previewRoot);

    const headings = previewRoot.querySelectorAll("h1, h2, h3, h4, h5, h6") as unknown as Array<{
      scrollIntoView: ReturnType<typeof vi.fn>;
    }>;

    const ok = scrollReadingHeadingIntoView(view, headingIndex, 10);

    expect(ok).toBe(true);
    expect(headings[1].scrollIntoView).toHaveBeenCalledTimes(1);
  });
});

describe("flashReadingHeading", () => {
  it("returns false when not in preview mode", () => {
    const view = createView("source", createPreviewRoot([20, 180, 600]));
    expect(flashReadingHeading(view, headingIndex, 10)).toBe(false);
  });

  it("adds flashing class to rendered heading matching source line", () => {
    vi.useFakeTimers();

    const previewRoot = createPreviewRoot([20, 180, 600]);
    const view = createView("preview", previewRoot);
    const headings = previewRoot.querySelectorAll("h1, h2, h3, h4, h5, h6") as unknown as Array<{
      classList: { contains: (name: string) => boolean };
    }>;

    const ok = flashReadingHeading(view, headingIndex, 10);

    expect(ok).toBe(true);
    expect(headings[1].classList.contains("is-flashing")).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(headings[1].classList.contains("is-flashing")).toBe(false);

    vi.useRealTimers();
  });
});
