# Contextual Outline Interaction Spec

## Goal

Provide a contextual heading overlay for Obsidian that always shows the current heading path, supports click navigation, highlights the target heading after navigation, and never reflows note content.

## Modes

This behavior must work in both:

- Live Edit / Source mode via CodeMirror
- Reading / Preview mode via rendered Markdown DOM

Focus mode is Live Edit-only.

## Idle State

When the user is not interacting with the overlay, the panel shows only the current heading path for the visible top edge of the note.

Example:

- `# Montag`
- `## Aufgaben`

The active path is resolved from the visible top edge below the overlay chrome, not the raw top of the editor container.

## Desktop Hover Behavior

Desktop hover does not change overlay structure.

- Entering or moving inside overlay must not expand sibling lists.
- Overlay remains stack-only.

## Stack Rules

- Overlay renders only real Markdown headings (`#` through `######`).
- Overlay shows one row per active heading level in path order.
- If current context is level 5, stack shows levels 1 through 5.
- No sibling or cascade rows are shown.

## Desktop Click Behavior

Desktop click is navigation plus highlight.

- Clicking a heading row navigates to that heading.
- Clicking highlights the navigated heading target.
- Clicking the overlay must not place the text cursor in the editor.
- Clicking the overlay must not create text selection in the note.

## Mobile / Touch Behavior

Mobile follows the same stack-only interaction model as desktop.

- Tapping a stack row navigates immediately to the heading target.
- Tapping applies highlight behavior equivalent to desktop.
- No first-tap expansion state exists.

## Focus Mode Behavior (Live Edit)

Focus mode is controlled via commands:

- `Focus Mode: Set Line`
- `Focus Mode: Set Paragraph`
- `Focus Mode: Disable`

Line mode:

- The cursor line remains in normal theme text style.
- All other lines are dimmed by configured intensity.

Paragraph mode:

- The current contiguous Markdown block remains in normal theme text style.
- All other lines are dimmed by configured intensity.
- A block is one of: paragraph, heading, list block, or fenced code block.
- Block boundaries are blank lines or block type boundaries.

Focus update rules:

- Focus region updates on cursor movement.
- Focus region updates on typing in Live Edit.

## Layout Requirements

- The overlay must float above note content.
- Overlay growth must not push editor or preview content downward.
- Overlay pointer handling must not leak through to the editor surface.

## Host Requirements

- In Live Edit, the overlay must mount to editor chrome so pointer events and visible top-edge calculations are local to the active CodeMirror surface.
- In Reading view, the overlay may mount to the Markdown view content container.

## Visibility Threshold Requirements

- Active heading changes are based on the actual visible top edge below the overlay.
- A heading that is hidden under overlay chrome is considered out of view.
- The previous heading must stop being shown once it has crossed above that visible threshold.

## Regression Guards

The implementation must avoid these regressions:

- overlay showing sibling expansions
- overlay click moving the editor cursor or selecting note content
- overlay expansion pushing content downward
- active heading switching based on the wrong top edge