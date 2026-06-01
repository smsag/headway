import type { HeadingEntry, HeadingLevel } from "../types";

export interface OverlayRenderInput {
  ancestorStack: HeadingEntry[];
}

interface RowEvent {
  lineNumber: number;
  level: HeadingLevel;
}

export class OverlayController {
  private container: HTMLElement;
  private listEl: HTMLUListElement;
  private parent: HTMLElement;
  private onRowEvent: (event: RowEvent) => void;

  constructor(
    parent: HTMLElement,
    onRowEvent: (event: RowEvent) => void
  ) {
    this.parent = parent;
    this.parent.classList.add("headway-overlay-host");

    this.container = document.createElement("div");
    this.container.classList.add("headway-overlay");

    if (parent.firstChild) {
      parent.insertBefore(this.container, parent.firstChild);
    } else {
      parent.appendChild(this.container);
    }

    this.listEl = this.container.createEl("ul", { cls: "headway-overlay-list" });
    this.onRowEvent = onRowEvent;

    this.container.addEventListener("pointerdown", this.handlePointerDown);
    this.listEl.addEventListener("click", this.handleClick);
  }

  render(input: OverlayRenderInput): void {
    this.listEl.empty();

    if (input.ancestorStack.length === 0) {
      this.container.classList.add("is-hidden");
      return;
    }

    this.container.classList.remove("is-hidden");

    for (const entry of input.ancestorStack) {
      const row = this.listEl.createEl("li", {
        cls: "headway-overlay-row headway-overlay-row-ancestor is-current"
      });
      row.addClass(`headway-overlay-row-level-${entry.level}`);

      row.dataset.lineNumber = String(entry.lineNumber);
      row.dataset.level = String(entry.level);
      row.dataset.text = entry.text;

      const prefix = "#".repeat(entry.level);
      row.setText(`${prefix} ${entry.text}`);
    }
  }

  destroy(): void {
    this.container.removeEventListener("pointerdown", this.handlePointerDown);
    this.listEl.removeEventListener("click", this.handleClick);
    this.container.remove();
    this.parent.classList.remove("headway-overlay-host");
  }

  contains(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) {
      return false;
    }

    return this.container.contains(target);
  }

  private handlePointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  private handleClick = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement | null;
    const row = target?.closest(".headway-overlay-row") as HTMLElement | null;

    if (!row) {
      return;
    }

    const lineNumber = Number(row.dataset.lineNumber);
    const level = Number(row.dataset.level) as HeadingLevel;

    if (Number.isNaN(lineNumber) || Number.isNaN(level)) {
      return;
    }

    this.onRowEvent({
      lineNumber,
      level
    });
  };

}
