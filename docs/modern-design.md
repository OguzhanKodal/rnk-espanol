# Modern design pass — 17 November 2026

The wooden library, generated leather covers, Spanish reading concept, seven themes and always-visible reader bars remain. No dependency was added, no native project was generated and no push was made.

## Screens

- Biblioteca: quiet shelf headings, sentence-case cover author, disabled/dimmed unavailable covers with readable Próximamente badges and accessibility state; Continuar leyendo includes book, section, page X of N and a progress track. It routes through the existing saved-position reader path. The store has no last-read timestamp; the card chooses the first available catalog book with progress (currently one available book).
- Drawer: existing destinations and icons retained; theme follows its surface, Spanish application group label.
- Reader: Ionicons throughout, one book title, readable section/page footer, 44 pt Aa, two-row selection tools with scalable labels, 44 pt color choices and close actions. Inline Arabic uses 1.15× body size in the same piece style used by prefix/word measurement. Selection only changes foreground/background colors and absolute overlays.
- Dictionary and shared sheets: labeled icon close controls, larger shared UI typography, consistent control/card/sheet radii.
- Índice: sentence-case hierarchy without the tracked uppercase book kicker; consistent Marcadores → Resaltados → Notas order; close animates for 220 ms while the Modal remains mounted.
- Marcadores: distinct tab icons/copy, explicit trailing delete action with confirmation, readable metadata, no permanent long-press deletion hint.
- Glosario: existing search retained, filtered entries sorted with localeCompare('es'), accessible definition actions.
- Frases: shared card/control typography and readable source captions.
- Oración: prayer card title replaces the kicker, readable city/time labels; cached prayer calculations unchanged.
- Ajustes: proper Lectura heading and larger hints, shared theme picker and controls.
- Acerca: sentence-case Español at readable size; larger metadata and shared spacing.

## Audit findings

1–9 addressed in code, including 1.15× inline Arabic. Search was already implemented for finding 9; this pass adds Spanish sorting. Palette objects remain module constants, row props/callbacks remain stable, and the deep-position windowing, backward prepend and pinch restoration paths are unchanged. No performance instrumentation or model calls were added.

## Checks and evidence

- npx tsc --noEmit; npm run lint; git diff --check; all three existing tests-ui suites pass.
- Contrast calculation: light/dark selection Latin minimum 8.97:1; Arabic minimum 6.48:1. All six saved-highlight swatches use dark Latin/red Arabic ink: minimum 7.76:1 / 5.75:1. User swatch colors stay intact in every theme.
- Before captures were made from baseline 27f1d58 files, restored temporarily without git reset, then all design edits restored. Initial launch-prompt captures were replaced after restarting only RisaleDesign. Metro used 8083 and an isolated iPhone 17 Pro / iOS 26.3 simulator.
- docs/ekran/modern/before and after cover every route plus dictionary, selection, themes, contents, dark reader/Home/selection, explicit page 55, saved-only reopening, handles and pinch callbacks.

- Same-launch real paragraph and enlarged-Arabic fixture selection/clear, callback-driven handle movement, and an actual native end-handle drag all report **zero changed pixels outside the selection mask and zero changed solid glyph pixels**. Reproduce with `scripts-ui/verify-modern-selection.py` using Pillow. Its ROI excludes reserved chrome and the toolbar/shadow; masks use known highlight/handle colors, never difference pixels.
- Actual native touches verified underlined agradecimiento → dictionary → labeled close, long-press todo → toolbar, end-handle drag expanding across two lines, two-finger pinch 1.2× retaining page 55 and both bars, and selecting Oscuro in the theme picker (checked state changed). Native evidence is after/29-native-dictionary.png, 30-native-selection.png, 31-native-drag.png and 33-native-pinch.png.
- `compare.png` pairs all 21 baseline/main captures. Every route and overlay was reviewed in contact sheets; a transient Fast Refresh error during formatting was replaced with a valid cold-launch Frases capture. No formatting/editing was active during the pixel pairs or native drag.
- Reproduction: `DESIGN_SIMULATOR=<udid> node scripts-ui/capture-modern.mjs after` (optional third argument is an exact shot name). `capture-modern-reader.mjs` captures the additional same-launch reader pairs. Keep Metro on 8083. Both scripts target only the named design simulator.

## Risks

Physical iOS/Android gesture feel, large accessibility text sizes and screen-reader navigation need device testing. Simulator captures do not establish production latency or release FPS. Selection geometry retains the existing prefix-measurement cost and block-level restoration granularity. No new row objects, timers, list traversal or SQLite-write behavior was introduced in production reader paths.

Implementation commits: a2b2eb2 (tokens/chrome), f50ebd1 (library/lists), 74c53bb (reader/contents); final polish and evidence are separate follow-up commits.
