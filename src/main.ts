import { MarkdownView, Plugin } from "obsidian";
import {
  resolveAncestorStack
} from "./services/ancestor-stack";
import { buildHeadingIndex } from "./services/heading-index";
import {
  reduceOverlayRowEvent,
  type OverlayRowEvent
} from "./services/overlay-interaction";
import {
  flashReadingHeading,
  resolveViewportLineForReadingView,
  scrollReadingHeadingIntoView
} from "./services/reading-navigator";
import { RefreshScheduler, type RefreshOptions } from "./services/refresh-scheduler";
import { OverlayCoordinator } from "./services/overlay-coordinator";
import { bootstrapHeadwayRuntime } from "./services/plugin-bootstrap";
import type { HeadingEntry } from "./types";

export default class HeadwayPlugin extends Plugin {
  private currentView: MarkdownView | null = null;
  private viewportTopLine = 0;
  private headingIndex: HeadingEntry[] = [];
  private lastIndexedContent = "";
  private ancestorStack: HeadingEntry[] = [];
  private lastRenderSignature = "";
  private overlayCoordinator = new OverlayCoordinator();
  private refreshScheduler: RefreshScheduler | null = null;

  async onload(): Promise<void> {
    this.refreshScheduler = new RefreshScheduler(
      (callback) => window.requestAnimationFrame(callback),
      ({ viewportTopLine, options }) => this.refreshForActiveView(viewportTopLine, options)
    );

    bootstrapHeadwayRuntime(this, {
      onViewportFromEditor: (viewportTopLine) => {
        this.queueRefreshForActiveView(viewportTopLine);
      },
      onViewportFromReading: ({ viewportTopLine, scrollTop }) => {
        this.queueRefreshForActiveView(viewportTopLine, { readingScrollTop: scrollTop });
      },
      onActiveLeafChange: () => {
        this.requestOverlayRefresh();
      },
      onGlobalPointerDown: () => {}
    });

    this.requestOverlayRefresh();
  }

  onunload(): void {
    this.clearOverlay();
  }

  requestOverlayRefresh(): void {
    this.queueRefreshForActiveView();
  }

  private queueRefreshForActiveView(
    viewportTopLine?: number,
    options?: RefreshOptions
  ): void {
    if (!this.refreshScheduler) {
      this.refreshForActiveView(viewportTopLine, options);
      return;
    }

    this.refreshScheduler.enqueue(viewportTopLine, options);
  }

  private refreshForActiveView(
    viewportTopLine?: number,
    options?: RefreshOptions
  ): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      this.clearOverlay();
      return;
    }

    const didViewChange = this.currentView !== view;
    if (didViewChange) {
      this.currentView = view;
      this.viewportTopLine = 0;
      this.lastRenderSignature = "";
    }

    if (viewportTopLine !== undefined) {
      this.viewportTopLine = Math.max(0, viewportTopLine);
    }

    const content = view.editor.getValue();
    if (content !== this.lastIndexedContent) {
      this.headingIndex = buildHeadingIndex(content);
      this.lastIndexedContent = content;
    }

    let resolvedViewportTopLine = this.viewportTopLine;
    if (typeof options?.readingScrollTop === "number") {
      resolvedViewportTopLine = resolveViewportLineForReadingView(
        view,
        this.headingIndex,
        resolvedViewportTopLine,
        options.readingScrollTop
      );
      this.viewportTopLine = resolvedViewportTopLine;
    }

    this.ancestorStack = resolveAncestorStack(this.headingIndex, resolvedViewportTopLine);

    this.renderOverlay(view);
  }

  private renderOverlay(view: MarkdownView | null = this.currentView): void {
    if (!view) {
      this.clearOverlay();
      return;
    }

    const renderSignature = [
      ...this.ancestorStack.map((entry) => `${entry.level}:${entry.lineNumber}:${entry.text}`)
    ].join("|");

    if (renderSignature === this.lastRenderSignature) {
      return;
    }

    const rendered = this.overlayCoordinator.renderForView(
      view,
      {
        ancestorStack: this.ancestorStack
      },
      (event) => this.handleOverlayRowEvent(event)
    );

    if (!rendered) {
      this.clearOverlay();
      return;
    }

    this.lastRenderSignature = renderSignature;
  }

  private clearOverlay(): void {
    this.overlayCoordinator.clear();
    this.lastRenderSignature = "";
    this.currentView = null;
  }

  private handleOverlayRowEvent(event: OverlayRowEvent): void {
    const result = reduceOverlayRowEvent({}, event);

    if (result.navigateToLine !== null) {
      this.navigateToLine(result.navigateToLine);
      return;
    }
  }

  private navigateToLine(lineNumber: number): void {
    const view = this.currentView ?? this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      return;
    }

    const targetHeading = this.headingIndex.find((entry) => entry.lineNumber === lineNumber);
    if (
      targetHeading &&
      scrollReadingHeadingIntoView(view, this.headingIndex, targetHeading.lineNumber)
    ) {
      flashReadingHeading(view, this.headingIndex, targetHeading.lineNumber);
      this.viewportTopLine = targetHeading.lineNumber;
      this.refreshForActiveView(this.viewportTopLine);
      return;
    }

    this.flashEditorHeading(view, lineNumber);
    view.editor.setCursor(lineNumber, 0);
    view.editor.scrollIntoView({ from: { line: lineNumber, ch: 0 }, to: { line: lineNumber, ch: 0 } }, true);
    this.viewportTopLine = lineNumber;
    this.queueRefreshForActiveView(this.viewportTopLine);
  }

  private flashEditorHeading(view: MarkdownView, lineNumber: number): void {
    const lineText = view.editor.getLine(lineNumber);
    const end = Math.max(0, lineText.length);

    view.editor.setSelection(
      { line: lineNumber, ch: 0 },
      { line: lineNumber, ch: end }
    );

    globalThis.setTimeout(() => {
      const activeView = this.currentView ?? this.app.workspace.getActiveViewOfType(MarkdownView);
      if (activeView !== view) {
        return;
      }

      view.editor.setCursor(lineNumber, 0);
    }, 1000);
  }

}
