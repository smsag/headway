import { describe, expect, it } from "vitest";
import {
  reduceMouseLeaveCollapse,
  reduceOutsideTapCollapse,
  reduceOverlayRowEvent
} from "./overlay-interaction";
import type { HeadingLevel } from "../types";

const level2 = 2 as HeadingLevel;

describe("reduceOverlayRowEvent", () => {
  it("ignores desktop hover in stack-only mode", () => {
    const result = reduceOverlayRowEvent(
      {},
      { lineNumber: 10, level: level2, kind: "ancestor", source: "hover" },
      false
    );

    expect(result).toEqual({
      navigateToLine: null,
      shouldRender: false
    });
  });

  it("navigates directly on touch click", () => {
    const result = reduceOverlayRowEvent(
      {},
      { lineNumber: 10, level: level2, kind: "ancestor", source: "click" },
      true
    );

    expect(result).toEqual({
      navigateToLine: 10,
      shouldRender: false
    });
  });

  it("navigates directly for desktop click", () => {
    const result = reduceOverlayRowEvent(
      {},
      { lineNumber: 25, level: level2, kind: "sibling", source: "click" },
      false
    );

    expect(result).toEqual({
      navigateToLine: 25,
      shouldRender: false
    });
  });
});

describe("collapse reducers", () => {
  it("ignores touch outside tap in stack-only mode", () => {
    const result = reduceOutsideTapCollapse(
      {},
      true,
      false
    );

    expect(result).toEqual({
      navigateToLine: null,
      shouldRender: false
    });
  });

  it("ignores desktop mouse leave in stack-only mode", () => {
    const result = reduceMouseLeaveCollapse(
      {},
      false
    );

    expect(result).toEqual({
      navigateToLine: null,
      shouldRender: false
    });
  });
});
