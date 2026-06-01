import type { HeadingLevel } from "../types";

export interface OverlayRowEvent {
  lineNumber: number;
  level: HeadingLevel;
}

export interface OverlayInteractionState {
  // Stack-only mode keeps no persistent expansion state.
}

export interface OverlayInteractionResult {
  navigateToLine: number | null;
  shouldRender: boolean;
}

export function reduceOverlayRowEvent(
  _state: OverlayInteractionState,
  event: OverlayRowEvent
): OverlayInteractionResult {
  return {
    navigateToLine: event.lineNumber,
    shouldRender: false
  };
}
