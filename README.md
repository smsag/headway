# Headway

Headway is an Obsidian community plugin that keeps a sticky, context-aware heading stack at the top of your note so you always know where you are in long documents.

## What It Does

- Shows the current ancestor heading path while you scroll.
- Works in both edit mode and reading mode.
- Lets you navigate by clicking or tapping headings in the overlay.
- Expands siblings for quick lateral navigation.
- Supports desktop and touch interaction patterns.
- Uses theme-aware styling and sensible defaults.

## Interaction Model

- Desktop:
  - Hover an ancestor row to expand siblings for that level.
  - Move pointer out of overlay to collapse.
  - Click heading rows to navigate.
- Touch:
  - First tap expands.
  - Second tap on same ancestor navigates.
  - Tap outside overlay collapses expanded state.

## Requirements

- Obsidian 1.5.0+

## Installation

### From Release Artifacts

1. Download these files from the latest release:
	- main.js
	- manifest.json
	- styles.css
2. Create plugin directory in your vault:
	- <Vault>/.obsidian/plugins/headway/
3. Place the files into that directory.
4. Enable Headway in Obsidian Community Plugins settings.

### Local Development Install

1. Build the plugin.
2. Copy main.js, manifest.json, styles.css into:
	- <Vault>/.obsidian/plugins/headway/
3. Reload Obsidian and enable the plugin.

## Development

Install dependencies:

- npm install

Run tests:

- npm test

Build once:

- npm run build

Watch mode:

- npm run dev

## Documentation

- Architecture: docs/ARCHITECTURE.md
- QA checklist: docs/QA.md
- Release checklist: docs/RELEASE.md
- Fixture note: docs/fixtures/Long Structured Note.md
- Changelog: CHANGELOG.md

## License

MIT. See LICENSE.