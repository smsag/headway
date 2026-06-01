# Release Checklist

This checklist targets Obsidian community plugin release flow.

## Versioning

1. Decide release version (SemVer).
2. Update `manifest.json`:
   - `version`
   - `minAppVersion` (if changed)
3. Update `versions.json` with exact mapping:
   - `<version>`: `<minAppVersion>`
4. Update `CHANGELOG.md` with release notes.

## Validation

1. Run automated checks:
   - `npm test`
   - `npm run build`
2. Run manual checks from `docs/QA.md` in:
   - desktop edit mode
   - desktop reading mode
   - mobile/touch behavior
3. Verify no console errors when:
   - enabling plugin
   - switching notes repeatedly
   - disabling and re-enabling plugin

## Packaging

Required release artifacts:

- `main.js`
- `manifest.json`
- `styles.css`

Local install path for testing:

`<Vault>/.obsidian/plugins/headway/`

## GitHub Release

1. Commit release changes.
2. Create tag matching manifest version (for example `0.1.0`).
3. Create GitHub Release for the tag.
4. Attach artifacts:
   - `main.js`
   - `manifest.json`
   - `styles.css`
5. Paste release notes from `CHANGELOG.md` section.

## Community Plugin Submission

1. Ensure repository is public and README is complete.
2. Ensure license file exists and is appropriate.
3. Ensure release artifacts are attached to the tagged release.
4. Submit/update plugin in Obsidian community plugin index per contribution instructions.
