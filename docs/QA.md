# Headway QA Checklist

This checklist validates MVP behavior in Obsidian desktop and mobile.

## Setup

1. Build plugin in this repository:
   - `npm install`
   - `npm test`
   - `npm run build`
2. Copy artifacts into your vault plugin folder:
   - `main.js`
   - `manifest.json`
   - `styles.css`
3. Place into:
   - `<Vault>/.obsidian/plugins/headway/`
4. Enable plugin in Obsidian Community Plugins.
5. Open the fixture note from `docs/fixtures/Long Structured Note.md`.

## Automated Checks

1. Run `npm test`.
   - Expected: all test files pass.
2. Run `npm run build`.
   - Expected: TypeScript check and bundle both pass.

## Desktop - Edit Mode

1. Scroll below first heading.
   - Expected: overlay appears and shows only current heading stack.
2. Move pointer over overlay rows.
   - Expected: no sibling expansion appears.
3. Click stack row.
   - Expected: editor jumps to clicked heading.
4. Validate highlight after click.
   - Expected: clicked heading line is briefly highlighted.

## Desktop - Reading Mode

1. Switch to Reading view and scroll through sections.
   - Expected: stack follows visible section context.
2. Click rows from overlay.
   - Expected: view scrolls to matching rendered heading and flashes heading highlight.
3. Validate with nested sections.
   - Expected: stack updates without skipping active ancestors.

## Mobile

1. Open the same structured note on mobile.
   - Expected: overlay appears and shows only current heading stack.
2. Tap a stack row.
   - Expected: note navigates immediately to the tapped heading.
3. Validate highlight after tap.
   - Expected: target heading is visibly highlighted after navigation.
4. Tap the same stack row repeatedly.
   - Expected: navigation and highlight continue working without needing a first expansion tap.

## Focus Mode (Live Edit)

1. Run command `Focus Mode: Set Line`.
   - Expected: current cursor line stays normal; all other lines are dimmed.
2. Move cursor across lines.
   - Expected: focused line follows cursor without lagging behind.
3. Run command `Focus Mode: Set Paragraph`.
   - Expected: current contiguous Markdown block stays normal; rest is dimmed.
4. Edit around block boundaries (blank lines, list rows, code fences).
   - Expected: focused block updates as boundaries change.
5. Run command `Focus Mode: Disable`.
   - Expected: dimming is removed immediately.

## Edge Cases

1. Open a note with no headings.
   - Expected: overlay hidden.
2. Open a note with gap levels (for example `##` before `#`).
   - Expected: no error, overlay still resolves available ancestors.
3. Click the same stack heading repeatedly.
   - Expected: navigation and highlight keep working without console errors.

## Performance Smoke Test

1. Hold continuous scroll in large note (1000+ lines).
   - Expected: no severe stutter or lockups.
2. Switch between multiple notes repeatedly.
   - Expected: no duplicate overlays.
3. Disable and re-enable plugin.
   - Expected: overlay detaches/reattaches cleanly without console errors.
