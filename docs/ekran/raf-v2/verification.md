# Shelf and dictionary removal verification

Device: dedicated RisaleShelf iPhone 17 Pro, iOS 26.3, 402 pt wide / 1206 pixels. Expo Go 58.0.7, Metro port 8083. The reference is 414 pt wide. No native build folders changed; no new dependencies.

- `01-home-top.png`: resume card and shelves.
- `02-home-shelves.png`: bottom of shelves and prayer card.
- `03-home-dark.png`: Oscuro theme, muted amber wood.
- `04-drawer.png`: navigation without dictionary.
- `05-reader.png`: real book opened directly at page 55.
- `06-reader-word-tap.png`: actual word tap, no popup. Accessibility inspection reports text rather than links.
- `07-reader-selection.png`: actual native long press with handles and all six toolbar actions.
- `08-reader-handle-drag.png`: physical drag attempt; selection did not visibly move. This capture is not evidence of a successful physical drag.
- `09-pixel-selected.png` / `10-pixel-cleared.png`: same page-55 paragraph selected and cleared using the existing layout-cycle development hook.
- `11-handle-test.png`: existing development handle-movement hook exercises the same hit-testing and range-update callbacks used by dragging; selection extends successfully.
- `12-all-shelves.png`: all three complete shelves, via development-only `dev=shelves` framing.
- `compare.png`: supplied reference on left, final all-shelves screenshot on right, each resized to 828 pixels wide.

## Checks

TypeScript (`npx tsc --noEmit`), lint (`npm run lint`) and `git diff --check` pass. Existing selection, reader and locations tests pass with TypeScript transpilation in a temporary CommonJS runner. Case-insensitive search for the removed feature names in app, src and scripts-ui has no matches.

Run `node scripts-ui/verify-shelf-selection.cjs` from the repository root to regenerate `pixel-report.json` using the already installed pngjs package. ROI excludes status/navigation bars and the selection toolbar. Masks derive exclusively from known blue selection and handle colours; they are not seeded from differences.

Handle movement has zero changed pixels outside the selection and zero changed solid ink pixels. The selected/cleared and native-long-press pairs have only a one-level RGB raster variation outside selection (maximum channel delta 1/255), with no differences above that tolerance. Strict byte-for-byte pixel equality therefore is **not** claimed. The visible Text tree and font metrics do not change when selection changes.

Physical long press and plain tap were verified through Simulator UI. Physical handle dragging could not be confirmed with the available UI automation (two attempts produced no range change); programmatic movement passes. Actual highlight/note/copy/share/bookmark operations were not individually repeated in this pass; their implementation is unchanged. Android was not tested.

## Layout

Collection and Qur'an: 132×198 → 88×132 pt. Short treatises: 116×174 → 80×120 pt. Gaps: 22 → 36 pt; horizontal padding 24 pt. Three collection covers plus a fourth peek at 402 pt. Long titles use smaller fitted text; the longest short-treatise title uses readable Garamond instead of blackletter to fit whole words.

Light back panel: #C68A43 / #DEA452 / #BD7C36; board #F5D28A / #DDA04D / #AC6C2C; lip #FFE5AD; plaque #FFF1CE. Dark back panel: #69421F / #80552B / #614020; board #A37A43 / #85602E / #533619; lip #BE9456; plaque #C6B28C. Original procedural SVG grain; existing leather cover artwork retained.
