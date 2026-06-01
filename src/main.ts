import { MarkdownView, Plugin } from "obsidian";
import { resolveAncestorStack, resolveSiblingHeadings } from "./services/ancestor-stack";
import { buildHeadingIndex } from "./services/heading-index";
import {
  reduceMouseLeaveCollapse,
  reduceOutsideTapCollapse,
  reduceOverlayRowEvent,
  type OverlayRowEvent
} from "./services/overlay-interaction";
import {
  resolveViewportLineForReadingView,
  scrollReadingHeadingIntoView
} from "./services/reading-navigator";
import { RefreshScheduler, type RefreshOptions } from "./services/refresh-scheduler";
import { OverlayCoordinator } from "./services/overlay-coordinator";
import { bootstrapHeadwayRuntime } from "./services/plugin-bootstrap";
import { DEFAULT_SETTINGS, normalizeSettings } from "./services/plugin-settings";
import { HeadwaySettingTab } from "./settings";
import type { HeadingEntry, HeadingLevel, HeadwaySettings } from "./types";

export default class HeadwayPlugin extends Plugin {
  settings: HeadwaySettings = DEFAULT_SETTINGS;
  private viewportTopLine = 0;
  private headingIndex: HeadingEntry[] = [];
  private ancestorStack: HeadingEntry[] = [];
  private expandedLevel: HeadingLevel | null = null;
  private overlayCoordinator = new OverlayCoordinator();
  private refreshScheduler: RefreshScheduler | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();
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
      onGlobalPointerDown: (event) => {
        this.handleGlobalPointerDown(event);
      }
    });

    this.addSettingTab(new HeadwaySettingTab(this.app, this));

    this.requestOverlayRefresh();
  }

  onunload(): void {
    this.clearOverlay();
  }

  async loadSettings(): Promise<void> {
    const loaded = await this.loadData();
    this.settings = normalizeSettings(loaded);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
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
    if (viewportTopLine !== undefined) {
      this.viewportTopLine = Math.max(0, viewportTopLine);
    }

    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      this.clearOverlay();
      return;
    }

    const content = view.editor.getValue();
    this.headingIndex = buildHeadingIndex(content);

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

    if (
      this.expandedLevel !== null &&
      !this.ancestorStack.some((entry) => entry.level === this.expandedLevel)
    ) {
      this.expandedLevel = null;
    }

    this.renderOverlay();
  }

  private renderOverlay(): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      this.clearOverlay();
      return;
    }

    const siblings =
      this.expandedLevel === null
        ? []
        : resolveSiblingHeadings(this.headingIndex, this.ancestorStack, this.expandedLevel);

    const rendered = this.overlayCoordinator.renderForView(
      view,
      {
        ancestorStack: this.ancestorStack,
        expandedLevel: this.expandedLevel,
        siblings,
        maxVisibleRows: this.settings.overlayMaxVisibleRows
      },
      (event) => this.handleOverlayRowEvent(event),
      () => this.handleOverlayMouseLeave()
    );

    if (!rendered) {
      this.clearOverlay();
    }
  }

  private clearOverlay(): void {
    this.overlayCoordinator.clear();
  }

  private handleOverlayRowEvent(event: OverlayRowEvent): void {
    const result = reduceOverlayRowEvent(
      { expandedLevel: this.expandedLevel },
      event,
      this.isTouchDevice()
    );

    this.expandedLevel = result.nextExpandedLevel;

    if (result.navigateToLine !== null) {
      this.navigateToLine(result.navigateToLine);
      return;
    }

    if (result.shouldRender) {
      this.renderOverlay();
    }
  }

  private handleOverlayMouseLeave(): void {
    const result = reduceMouseLeaveCollapse(
      { expandedLevel: this.expandedLevel },
      this.isTouchDevice()
    );

    this.expandedLevel = result.nextExpandedLevel;
    if (result.shouldRender) {
      this.renderOverlay();
    }
  }

  private navigateToLine(lineNumber: number): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      return;
    }

    const targetHeading = this.headingIndex.find((entry) => entry.lineNumber === lineNumber);
    if (
      targetHeading &&
      scrollReadingHeadingIntoView(view, this.headingIndex, targetHeading.lineNumber)
    ) {
      this.viewportTopLine = targetHeading.lineNumber;
      this.refreshForActiveView(this.viewportTopLine);
      return;
    }

    view.editor.setCursor(lineNumber, 0);
    view.editor.scrollIntoView({ from: { line: lineNumber, ch: 0 }, to: { line: lineNumber, ch: 0 } }, true);
    this.viewportTopLine = lineNumber;
    this.queueRefreshForActiveView(this.viewportTopLine);
  }

  private handleGlobalPointerDown(event: PointerEvent): void {
    const result = reduceOutsideTapCollapse(
      { expandedLevel: this.expandedLevel },
      this.isTouchDevice(),
      this.overlayCoordinator.contains(event.target)
    );

    this.expandedLevel = result.nextExpandedLevel;
    if (result.shouldRender) {
      this.renderOverlay();
    }
  }

  private isTouchDevice(): boolean {
    return window.matchMedia("(pointer: coarse)").matches;
  }

}
