import type { HeadingEntry, HeadingLevel } from "../types";

export interface OverlayRenderGroup {
  level: HeadingLevel;
  rows: HeadingEntry[];
  selectedLineNumber: number | null;
}

export interface OverlayRenderInput {
  ancestorStack: HeadingEntry[];
  groups: OverlayRenderGroup[];
  maxVisibleRows: number;
}

interface RowEvent {
  lineNumber: number;
  level: HeadingLevel;
  kind: "ancestor" | "sibling";
  source: "click" | "hover";
}

export class OverlayController {
  private container: HTMLElement;
  private listEl: HTMLUListElement;
  private parent: HTMLElement;
  private onRowEvent: (event: RowEvent) => void;

  constructor(
    parent: HTMLElement,
    onRowEvent: (event: RowEvent) => void,
    _onPanelHover: () => void,
    _onMouseLeave: () => void
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

    if (input.ancestorStack.length === 0 && input.groups.length === 0) {
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
      row.dataset.kind = "ancestor";
      row.dataset.text = entry.text;

      const prefix = "#".repeat(entry.level);
      row.setText(`${prefix} ${entry.text}`);
    }

    const maxRows = Math.max(3, input.maxVisibleRows);

    for (const group of input.groups) {
      const siblingsContainer = this.listEl.createEl("li", {
        cls: "headway-overlay-siblings-wrap"
      });

      const siblingsList = siblingsContainer.createEl("ul", {
        cls: "headway-overlay-siblings"
      });

      siblingsList.style.maxHeight = `${maxRows * 1.85}em`;

      for (const rowEntry of group.rows) {
        const row = siblingsList.createEl("li", {
          cls: "headway-overlay-row headway-overlay-row-sibling"
        });
        row.addClass(`headway-overlay-row-level-${rowEntry.level}`);

        row.dataset.lineNumber = String(rowEntry.lineNumber);
        row.dataset.level = String(rowEntry.level);
        row.dataset.kind = "sibling";
        row.dataset.text = rowEntry.text;

        const prefix = "#".repeat(rowEntry.level);
        row.setText(`${prefix} ${rowEntry.text}`);

        if (rowEntry.lineNumber === group.selectedLineNumber) {
          row.addClass("is-current");
        }
      }
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
    const kind = (row.dataset.kind ?? "ancestor") as "ancestor" | "sibling";

    if (Number.isNaN(lineNumber) || Number.isNaN(level)) {
      return;
    }

    this.onRowEvent({
      lineNumber,
      level,
      kind,
      source: "click"
    });
  };

}
