import type { HeadwaySettings } from "../types";

export const MIN_OVERLAY_VISIBLE_ROWS = 3;
export const MAX_OVERLAY_VISIBLE_ROWS = 20;

export const DEFAULT_SETTINGS: HeadwaySettings = {
  overlayMaxVisibleRows: 6
};

export function normalizeSettings(
  loaded: Partial<HeadwaySettings> | null | undefined
): HeadwaySettings {
  const merged = Object.assign({}, DEFAULT_SETTINGS, loaded);
  const candidate = Number(merged.overlayMaxVisibleRows);
  const safeValue = Number.isFinite(candidate)
    ? candidate
    : DEFAULT_SETTINGS.overlayMaxVisibleRows;

  return {
    overlayMaxVisibleRows: Math.max(
      MIN_OVERLAY_VISIBLE_ROWS,
      Math.min(MAX_OVERLAY_VISIBLE_ROWS, safeValue)
    )
  };
}
