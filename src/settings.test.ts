import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  MAX_OVERLAY_VISIBLE_ROWS,
  MIN_OVERLAY_VISIBLE_ROWS,
  normalizeSettings
} from "./services/plugin-settings";

describe("normalizeSettings", () => {
  it("uses defaults when settings are missing", () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
  });

  it("clamps below minimum", () => {
    expect(normalizeSettings({ overlayMaxVisibleRows: 1 })).toEqual({
      overlayMaxVisibleRows: MIN_OVERLAY_VISIBLE_ROWS
    });
  });

  it("clamps above maximum", () => {
    expect(normalizeSettings({ overlayMaxVisibleRows: 999 })).toEqual({
      overlayMaxVisibleRows: MAX_OVERLAY_VISIBLE_ROWS
    });
  });

  it("keeps values inside range", () => {
    expect(normalizeSettings({ overlayMaxVisibleRows: 12 })).toEqual({
      overlayMaxVisibleRows: 12
    });
  });

  it("falls back when value is not finite", () => {
    expect(normalizeSettings({ overlayMaxVisibleRows: Number.NaN })).toEqual(
      DEFAULT_SETTINGS
    );
  });
});
