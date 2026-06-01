# Headway Architecture

This document explains how the plugin is organized and how updates flow from Obsidian events to stack rendering.

## High-level flow

1. Obsidian emits viewport and workspace events.
2. Runtime hooks pass event payloads into plugin orchestration.
3. Refresh scheduler coalesces burst updates into one frame.
4. Heading index and ancestor stack are recomputed for active view state.
5. Overlay coordinator renders stack rows into the selected host.
6. Stack row click interactions dispatch reducer-driven navigation.
7. Navigation highlights the destination heading in the active mode.

## Core modules

- [src/main.ts](../src/main.ts)
  - State orchestration for active view, heading index, ancestor stack, and navigation.
- [src/services/plugin-bootstrap.ts](../src/services/plugin-bootstrap.ts)
  - Registers editor extension, reading post processor, leaf-change listener, and global pointer handler.
- [src/services/refresh-scheduler.ts](../src/services/refresh-scheduler.ts)
  - Coalesces rapid update requests.
- [src/services/heading-index.ts](../src/services/heading-index.ts)
  - Builds ordered heading index from markdown content.
- [src/services/ancestor-stack.ts](../src/services/ancestor-stack.ts)
  - Resolves the visible ancestor stack path from viewport position.
- [src/services/reading-headings.ts](../src/services/reading-headings.ts)
  - Maps rendered heading offsets to source heading lines.
- [src/services/reading-navigator.ts](../src/services/reading-navigator.ts)
  - Reading mode viewport resolution, rendered-heading jump behavior, and heading flash highlight.
- [src/services/overlay-interaction.ts](../src/services/overlay-interaction.ts)
  - Pure reducers for click/tap navigation transitions.
- [src/services/overlay-host.ts](../src/services/overlay-host.ts)
  - Picks host container for overlay injection.
- [src/services/overlay-coordinator.ts](../src/services/overlay-coordinator.ts)
  - Owns overlay controller lifecycle and host switching.
- [src/services/plugin-settings.ts](../src/services/plugin-settings.ts)
  - Pure settings defaults and normalization.
- [src/settings.ts](../src/settings.ts)
  - Obsidian settings UI tab.
- [src/ui/overlay.ts](../src/ui/overlay.ts)
  - Stack DOM rendering and click event forwarding.

## Runtime event flow

1. Editor viewport change
- Source: [src/processors/editor-extension.ts](../src/processors/editor-extension.ts)
- Path: bootstrap -> scheduler enqueue -> refresh -> stack render

2. Reading viewport scroll
- Source: [src/processors/markdown-processor.ts](../src/processors/markdown-processor.ts)
- Path: bootstrap -> scheduler enqueue with scrollTop -> reading viewport line resolution -> refresh -> stack render

3. Stack click navigation
- Source: [src/ui/overlay.ts](../src/ui/overlay.ts)
- Path: row click -> reducer -> navigate to heading -> heading highlight

## Interaction model implementation

- Overlay stays stack-only and always reflects current heading path.
- Clicking a stack row navigates to the heading source line.
- Reading mode highlights the rendered heading target with flash class.
- Live Edit highlights the heading line briefly via temporary selection.
- Overlay is rendered as floating chrome and does not reflow note content.

Reducer reference: [src/services/overlay-interaction.ts](../src/services/overlay-interaction.ts)

## Testing strategy

Pure logic is unit tested under [src](../src):

- heading parsing and stack derivation
- reading heading mapping
- reading navigation and flash highlight behavior
- overlay interaction reducers
- refresh coalescing
- overlay host selection and coordinator lifecycle
- settings normalization

Run tests with npm test and build with npm run build.
