import type { Extension } from "@codemirror/state";
import { EditorView, ViewPlugin } from "@codemirror/view";

export interface EditorViewportUpdate {
  viewportTopLine: number;
}

export function createEditorExtension(
  onViewportUpdate: (update: EditorViewportUpdate) => void
): Extension {
  return ViewPlugin.fromClass(
    class {
      private view: EditorView;
      private measurePending = false;
      private lastViewportTopLine = -1;
      private onViewportUpdate: (update: EditorViewportUpdate) => void;

      constructor(view: EditorView) {
        this.view = view;
        this.onViewportUpdate = onViewportUpdate;
        this.view.scrollDOM.addEventListener("scroll", this.handleScroll, { passive: true });
        this.queueViewportUpdate(true);
      }

      update(update: { view: EditorView; viewportChanged: boolean; docChanged: boolean }): void {
        if (!update.viewportChanged && !update.docChanged) {
          return;
        }

        this.view = update.view;
        this.queueViewportUpdate(update.docChanged);
      }

      destroy(): void {
        this.view.scrollDOM.removeEventListener("scroll", this.handleScroll);
      }

      private handleScroll = (): void => {
        this.queueViewportUpdate(false);
      };

      private queueViewportUpdate(force: boolean): void {
        if (this.measurePending) {
          return;
        }

        this.measurePending = true;
        this.view.requestMeasure({
          read: () => resolveTopEdgeLine(this.view),
          write: (viewportTopLine) => {
            this.measurePending = false;

            if (!force && viewportTopLine === this.lastViewportTopLine) {
              return;
            }

            this.lastViewportTopLine = viewportTopLine;
            this.onViewportUpdate({ viewportTopLine });
          }
        });
      }
    }
  );
}

function resolveTopEdgeLine(view: EditorView): number {
  const scrollerRect = view.scrollDOM.getBoundingClientRect();
  const overlay =
    (view.scrollDOM.querySelector(".headway-overlay") as HTMLElement | null) ??
    (view.dom.ownerDocument.querySelector(".headway-overlay") as HTMLElement | null);
  const overlayHeight = overlay?.offsetHeight ?? 0;
  const topEdgePos = view.posAtCoords({
    x: scrollerRect.left + 1,
    y: scrollerRect.top + overlayHeight + 1
  });

  if (topEdgePos !== null) {
    return Math.max(0, view.state.doc.lineAt(topEdgePos).number - 1);
  }

  return Math.max(0, view.state.doc.lineAt(view.viewport.from).number - 1);
}
