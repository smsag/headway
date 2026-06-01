import { describe, expect, it } from "vitest";
import { reduceOverlayRowEvent } from "./overlay-interaction";
import type { HeadingLevel } from "../types";

const level2 = 2 as HeadingLevel;

describe("reduceOverlayRowEvent", () => {
  it("navigates directly for ancestor rows", () => {
    const result = reduceOverlayRowEvent(
      {},
      { lineNumber: 10, level: level2 }
    );

    expect(result).toEqual({
      navigateToLine: 10,
      shouldRender: false
    });
  });

  it("navigates directly for any provided heading line", () => {
    const result = reduceOverlayRowEvent(
      {},
      { lineNumber: 25, level: level2 }
    );

    expect(result).toEqual({
      navigateToLine: 25,
      shouldRender: false
    });
  });
});
