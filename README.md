# Headway

Headway is an Obsidian community plugin that keeps a context-aware heading stack at the top of your note so you always know where you are in long documents.

## What It Does

- Shows only the current heading path while you scroll.
- Works in both Live Edit and Reading modes.
- Works on both desktop and mobile.
- Lets you navigate by clicking or tapping headings in the stack.
- Highlights the navigated heading target after click navigation.
- Keeps the overlay floating over content without layout reflow.
- Adds a Live Edit focus mode with line and paragraph block variants.
- Uses theme-aware styling and sensible defaults.

## Interaction Model

- Overlay shows only the active stack path.
- Clicking or tapping a stack row navigates to that heading.
- After navigation, the heading target is highlighted.
- No sibling expansion or hover cascade behavior.

## Focus Mode (Live Edit)

Focus mode dims non-focused text while preserving normal theme color for the focused region.

- `Focus Mode: Set Line`: keeps the cursor line in normal style and dims all other lines.
- `Focus Mode: Set Paragraph`: keeps the current contiguous Markdown block in normal style and dims the rest.
- `Focus Mode: Disable`: turns off focus dimming.

Paragraph focus uses contiguous Markdown blocks as units (paragraphs, headings, list blocks, and fenced code blocks), separated by blank lines or block boundaries.

Use Settings -> Headway -> `Focus dim strength` to control dim intensity.

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
- Interaction spec: docs/INTERACTION_SPEC.md
- Fixture note: docs/fixtures/Long Structured Note.md
- Changelog: CHANGELOG.md

## License

MIT. See LICENSE.