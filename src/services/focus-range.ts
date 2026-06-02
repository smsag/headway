import type { FocusMode } from "../types";

export interface LineDoc {
  lines: number;
  line: (lineNumber: number) => { text: string };
}

export interface FocusRange {
  startLine: number;
  endLine: number;
}

type BlockKind = "heading" | "list" | "quote" | "paragraph";

const FENCE_REGEX = /^\s*([`~]{3,})/;
const HEADING_REGEX = /^\s{0,3}#{1,6}\s+/;
const LIST_REGEX = /^\s*(?:[-*+]|\d+[.)])\s+/;
const QUOTE_REGEX = /^\s*>/;

export function resolveFocusRange(
  doc: LineDoc,
  zeroBasedCursorLine: number,
  mode: FocusMode
): FocusRange | null {
  if (mode === "off") {
    return null;
  }

  const cursorLine = clampLineNumber(zeroBasedCursorLine + 1, doc.lines);

  if (mode === "line") {
    return { startLine: cursorLine, endLine: cursorLine };
  }

  return resolveParagraphRange(doc, cursorLine);
}

function resolveParagraphRange(doc: LineDoc, cursorLine: number): FocusRange {
  const fenceRange = resolveFenceRange(doc, cursorLine);
  if (fenceRange) {
    return fenceRange;
  }

  const cursorText = doc.line(cursorLine).text;
  if (isBlank(cursorText)) {
    return { startLine: cursorLine, endLine: cursorLine };
  }

  const targetKind = classifyLine(cursorText);

  let startLine = cursorLine;
  while (startLine > 1) {
    const prev = doc.line(startLine - 1).text;
    if (isBlank(prev) || classifyLine(prev) !== targetKind || isFenceDelimiter(prev)) {
      break;
    }

    startLine -= 1;
  }

  let endLine = cursorLine;
  while (endLine < doc.lines) {
    const next = doc.line(endLine + 1).text;
    if (isBlank(next) || classifyLine(next) !== targetKind || isFenceDelimiter(next)) {
      break;
    }

    endLine += 1;
  }

  return { startLine, endLine };
}

function resolveFenceRange(doc: LineDoc, cursorLine: number): FocusRange | null {
  let open: { marker: string; length: number; startLine: number } | null = null;

  for (let lineNumber = 1; lineNumber <= doc.lines; lineNumber += 1) {
    const text = doc.line(lineNumber).text;
    const marker = getFenceMarker(text);

    if (!open) {
      if (marker) {
        open = {
          marker: marker.charAt(0),
          length: marker.length,
          startLine: lineNumber
        };
      }

      continue;
    }

    if (
      marker &&
      marker.charAt(0) === open.marker &&
      marker.length >= open.length
    ) {
      if (cursorLine >= open.startLine && cursorLine <= lineNumber) {
        return { startLine: open.startLine, endLine: lineNumber };
      }

      open = null;
    }
  }

  if (open && cursorLine >= open.startLine) {
    return { startLine: open.startLine, endLine: doc.lines };
  }

  return null;
}

function clampLineNumber(lineNumber: number, maxLines: number): number {
  return Math.max(1, Math.min(maxLines, lineNumber));
}

function classifyLine(line: string): BlockKind {
  if (HEADING_REGEX.test(line)) {
    return "heading";
  }

  if (LIST_REGEX.test(line)) {
    return "list";
  }

  if (QUOTE_REGEX.test(line)) {
    return "quote";
  }

  return "paragraph";
}

function isBlank(line: string): boolean {
  return line.trim().length === 0;
}

function isFenceDelimiter(line: string): boolean {
  return getFenceMarker(line) !== null;
}

function getFenceMarker(line: string): string | null {
  const match = line.match(FENCE_REGEX);
  return match ? match[1] : null;
}
