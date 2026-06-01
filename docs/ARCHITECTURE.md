# Headway Architecture

This document explains how the plugin is organized and how updates flow from Obsidian events to overlay rendering.

## High-level flow

1. Obsidian emits viewport and workspace events.
2. Runtime hooks pass event payloads into plugin orchestration.
3. Refresh scheduler coalesces burst updates into one frame.
4. Heading index and ancestor stack are recomputed for active view state.
5. Overlay coordinator renders into the correct host (editor or reading container).
6. Overlay interactions dispatch reducer-driven state transitions.

## Core modules

- [src/main.ts](../src/main.ts)
  - State orchestration for active view, heading index, ancestor stack, expanded level, and navigation.
- [src/services/plugin-bootstrap.ts](../src/services/plugin-bootstrap.ts)
  - Registers editor extension, reading post processor, leaf-change listener, and global pointer handler.
- [src/services/refresh-scheduler.ts](../src/services/refresh-scheduler.ts)
  - Coalesces rapid update requests.
- [src/services/heading-index.ts](../src/services/heading-index.ts)
  - Builds ordered heading index from markdown content.
- [src/services/ancestor-stack.ts](../src/services/ancestor-stack.ts)
  - Resolves visible ancestor stack and parent-scoped siblings.
- [src/services/reading-headings.ts](../src/services/reading-headings.ts)
  - Maps rendered heading offsets to source heading lines.
- [src/services/reading-navigator.ts](../src/services/reading-navigator.ts)
  - Reading mode viewport resolution and rendered-heading jump behavior.
- [src/services/overlay-interaction.ts](../src/services/overlay-interaction.ts)
  - Pure reducers for hover, click/tap, outside-tap collapse, and mouse-leave collapse.
- [src/services/overlay-host.ts](../src/services/overlay-host.ts)
  - Picks best host container for overlay injection.
- [src/services/overlay-coordinator.ts](../src/services/overlay-coordinator.ts)
  - Owns overlay controller lifecycle and host switching.
- [src/services/plugin-settings.ts](../src/services/plugin-settings.ts)
  - Pure settings defaults and normalization.
- [src/settings.ts](../src/settings.ts)
  - Obsidian settings UI tab.
- [src/ui/overlay.ts](../src/ui/overlay.ts)
  - Overlay DOM rendering and row event forwarding.

## Runtime event flow

1. Editor viewport change
- Source: [src/processors/editor-extension.ts](../src/processors/editor-extension.ts)
- Path: plugin bootstrap -> scheduler enqueue -> refresh -> render

2. Reading viewport scroll
- Source: [src/processors/markdown-processor.ts](../src/processors/markdown-processor.ts)
- Path: plugin bootstrap -> scheduler enqueue with scrollTop -> reading viewport line resolution -> refresh -> render

3. Overlay interaction
- Source: [src/ui/overlay.ts](../src/ui/overlay.ts)
- Path: row event -> interaction reducer -> state update -> navigate or render

## Interaction model implementation

- Desktop hover on ancestor row expands level.
- Desktop mouse leave collapses expanded state.
- Touch first tap on ancestor expands.
- Touch second tap on same ancestor navigates.
- Touch outside tap collapses expanded state.

Reducer reference: [src/services/overlay-interaction.ts](../src/services/overlay-interaction.ts)

## Testing strategy

Pure logic is unit tested under [src](../src):

- heading parsing and stack derivation
- sibling scoping
- reading heading mapping
- reading navigation behavior
- overlay interaction reducers
- refresh coalescing
- overlay host selection and coordinator lifecycle
- settings normalization

Run tests with `npm test` and build with `npm run build`.
