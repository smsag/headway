# Changelog

All notable changes to this project will be documented in this file.

## 0.1.3 - 2026-06-01

### Changed

- Cleaned up stack-only architecture by removing orphaned hover/sibling-era contracts and event variants.
- Removed obsolete "Max visible rows" settings plumbing and related normalization logic.
- Removed unused helper modules and dead code paths from overlay interaction and ancestor services.
- Simplified overlay render and coordinator APIs to align with current click/tap navigation behavior.
- Updated and trimmed tests to validate only active stack-only behavior.

## 0.1.2 - 2026-06-01

### Changed

- Simplified navigation UI to stack-only behavior and removed hover cascade interactions.
- Added direct click/tap heading navigation with viewport-aware targeting in both edit and reading modes.
- Added transient heading highlight feedback after navigation in reading and editor contexts.
- Refined overlay host placement and viewport top-line measurement for more stable positioning.
- Updated README and docs (`docs/ARCHITECTURE.md`, `docs/INTERACTION_SPEC.md`, `docs/QA.md`, `docs/RELEASE.md`) to match shipped behavior.

## 0.1.1 - 2026-06-01

### Added

- MIT license file (`LICENSE`).

### Changed

- Release metadata bumped from `0.1.0` to `0.1.1` in manifest and package metadata.
- Added `0.1.1` compatibility mapping in `versions.json`.

## 0.1.0 - 2026-06-01

### Added

- Initial Obsidian plugin scaffold with TypeScript + esbuild build pipeline.
- Sticky heading ancestor overlay for active Markdown notes.
- Edit mode and reading mode integration.
- Click/tap navigation to headings from overlay rows.
- Desktop hover expansion for ancestor levels.
- Touch interaction model:
  - first tap expands
  - second tap navigates
  - outside tap collapses
- Parent-scoped sibling resolution with configurable row cap.
- Theme-aware overlay styling.
- Settings tab with `overlayMaxVisibleRows` (3-20).

### Architecture

- Extracted runtime bootstrap registration, scheduler, overlay coordinator, reading navigator, and pure interaction reducers into dedicated services.
- Added architecture documentation in `docs/ARCHITECTURE.md`.

### Quality

- Added unit tests for heading parsing, ancestor/sibling resolution, interaction reducers, reading mapping/navigation, refresh scheduler, host/coordinator lifecycle, and settings normalization.
- Added QA checklist and fixture note for manual validation.
