import { describe, expect, it } from "vitest";
import { resolveFocusRange, type LineDoc } from "./focus-range";

function createDoc(lines: string[]): LineDoc {
  return {
    lines: lines.length,
    line: (lineNumber: number) => ({ text: lines[lineNumber - 1] ?? "" })
  };
}

describe("resolveFocusRange", () => {
  it("returns null when focus mode is off", () => {
    const doc = createDoc(["A", "B"]);
    expect(resolveFocusRange(doc, 0, "off")).toBe(null);
  });

  it("returns cursor line for line mode", () => {
    const doc = createDoc(["A", "B", "C"]);
    expect(resolveFocusRange(doc, 1, "line")).toEqual({ startLine: 2, endLine: 2 });
  });

  it("returns contiguous paragraph block", () => {
    const doc = createDoc([
      "# Heading",
      "",
      "First line",
      "Second line",
      "",
      "Tail"
    ]);

    expect(resolveFocusRange(doc, 2, "paragraph")).toEqual({
      startLine: 3,
      endLine: 4
    });
  });

  it("treats headings as standalone blocks", () => {
    const doc = createDoc([
      "# Heading",
      "Paragraph"
    ]);

    expect(resolveFocusRange(doc, 0, "paragraph")).toEqual({
      startLine: 1,
      endLine: 1
    });
  });

  it("returns full fenced code block when cursor is inside", () => {
    const doc = createDoc([
      "```ts",
      "const a = 1;",
      "const b = 2;",
      "```",
      "",
      "tail"
    ]);

    expect(resolveFocusRange(doc, 1, "paragraph")).toEqual({
      startLine: 1,
      endLine: 4
    });
  });
});
