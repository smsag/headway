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
   - Expected: 9 test files pass.
2. Run `npm run build`.
   - Expected: TypeScript check and bundle both pass.

## Desktop - Edit Mode

1. Scroll below first heading.
   - Expected: overlay appears and shows ancestor stack.
2. Hover each ancestor row.
   - Expected: sibling list expands for that level only.
   - Expected: previously expanded level collapses (accordion).
3. Move pointer outside overlay.
   - Expected: expanded lists collapse to ancestor-only view.
4. Click ancestor row.
   - Expected: editor jumps to row heading.
5. Expand sibling list and click a sibling row.
   - Expected: editor jumps to clicked sibling heading.

## Desktop - Reading Mode

1. Switch to Reading view and scroll through sections.
   - Expected: ancestor stack follows visible section context.
2. Click rows from overlay.
   - Expected: view scrolls to matching rendered heading.
3. Validate with nested sections.
   - Expected: stack updates without skipping active ancestors.

## Mobile / Touch Behavior

1. Tap an ancestor row once.
   - Expected: expand that level.
2. Tap the same ancestor row again.
   - Expected: navigate to that heading.
3. Tap outside overlay while expanded.
   - Expected: expanded state collapses.
4. Tap sibling row in expanded list.
   - Expected: navigate to sibling heading and collapse.

## Edge Cases

1. Open a note with no headings.
   - Expected: overlay hidden.
2. Open a note with gap levels (for example `##` before `#`).
   - Expected: no error, overlay still resolves available ancestors.
3. Set max visible rows to min and max values in settings.
   - Expected: list caps to configured size and becomes scrollable when needed.

## Performance Smoke Test

1. Hold continuous scroll in large note (1000+ lines).
   - Expected: no severe stutter or lockups.
2. Switch between multiple notes repeatedly.
   - Expected: no duplicate overlays.
3. Disable and re-enable plugin.
   - Expected: overlay detaches/reattaches cleanly without console errors.
