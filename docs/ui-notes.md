# UI implementation notes

## Opening the app

Use Node and npm in the repository root, then `npm install` and `npm start`.
`prestart` regenerates Metro's literal JSON requires. On an iPhone, install Expo Go
with SDK 58 support, join the same Wi-Fi as the Mac, and scan Metro's QR code with
Camera. The first launch needs Metro; bundled books/fonts and all reading data
work locally thereafter while the development bundle remains cached. A standalone
production installation requires an Expo build; no native project was generated.

For the iOS simulator:

```sh
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcrun simctl boot 'iPhone 16 Pro'
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcrun simctl openurl booted exp://127.0.0.1:8081
node scripts-ui/capture-simulator.mjs
```

## Choices and behaviour

- Kept the existing `app/` Router root. All application copy is in `src/i18n/es.ts`;
  book titles, credits, glossary definitions and quotes come from content JSON.
- Router SDK 58 bundles Drawer; use its own Drawer content exports, without a
  separate React Navigation Drawer dependency. No accounts or profile.
- Warm SVG/gradient shelves and original double-border leather-colour covers.
  No reference artwork, logos or icons were copied. Missing catalog entries show
  a short “Próximamente” toast.
- Catalog, books, glossary and quotes prefer actual assets. The registry generator
  checks individual files, retains the Arabic sample, and uses fixtures for missing
  collections. Re-run it after changing asset files while Metro is running.
- Reader uses a virtualized FlatList of memoized blocks and nested Text spans;
  glossary ranges are memoized, accent/case insensitive, longest phrase first,
  with word boundaries. Arabic spans remain together and use Amiri, red and RTL.
  Unresolved Arabic uses the contract's `[árabe]` marker.
- Long press selects a word. The active paragraph uses measured word pieces and
  two draggable endpoints; tapping outside the selection dismisses it. See V3
  below for the mechanics, regression coverage and limits.
- Selections use UTF-16 character offsets over concatenated spans (matching JS
  string slicing), anchored by stable block IDs. Highlight colours include their
  own dark foreground so they stay readable in dark mode.
- Font size is clamped to 14–34 and persisted. Pinch previews a scale transform, then reflows once and restores
  the block visible at gesture start; restoration is at block granularity, not an
  exact glyph/pixel. Settings also offer font controls and two bundled serif
  families with genuine bold/italic fonts. UI chrome has no fixed lineHeight.
- SQLite stores settings, progress by book and typed annotation arrays in a small
  key/value table. Writes are serialized and use `withTransactionAsync`. This
  intentionally keeps schema/migrations small for this local-only app; a large
  personal annotation library may warrant normalized tables later.
- Prayer calculation uses adhan, default Muslim World League, three methods,
  a country/city directory with legacy fallback cities, optional foreground GPS, local civil dates in the chosen
  city's time zone, tomorrow's Fayr after Isha, and a one-second countdown.
  Sunrise appears in the full schedule, not as a prayer in the five-time card.
  The location permission is Spanish in app.json; Expo Go's own permission prompt
  belongs to its host binary. GPS denial/failure leaves the city picker usable.
- All actual content credits are shown verbatim. Unavailable books are placeholders;
  sample fixtures are demonstration text. Editorial glossary definitions retain
  their `verified` status and show the review notice when unverified.

## Simulator and regression verification

Screenshots in `docs/ekran/` cover home top/bottom, drawer, inline and standalone
Arabic, glossary card, selection tools, colour tools, bookmarks, prayer schedule,
dark reader, glossary list, quotes, settings, credits, table of contents, note
input, persisted annotations, enlarged text and the converted real book. Each was
opened and visually reviewed; bad intermediate captures were replaced.

Development-only `dev` query parameters allow reproducible states without native
selection-menu automation. Reader supports `arabic`, `glossary`, `selection`,
`colors`, `dark`, `toc`, `note`, `large`, `persist`. `persist` writes three clearly
identified `dev-*` records to the simulator's local DB. Home supports `top`,
`bottom`, `drawer`. These switches are guarded by `__DEV__` and inactive in release.
The screenshot script accepts a numeric filename prefix to repeat one capture.

The native computer-control tool timed out; states were driven with simctl deep
links and the development parameters. Actual two-finger touch injection, physical
iPhone GPS and Android runtime behaviour were not exercised in this environment.
The pinch handler is wired with Gesture Handler; its reflow/end state is visually
checked using the same persisted size setting. Manual touch testing on a physical
iPhone remains useful for gesture feel.

Two issues found and fixed on the simulator:

1. SDK 58 Expo Go returned null from `getLinkingURL()` while React Native's
   `Linking.getInitialURL()` held the correct `/--/` route. A limited iOS fallback
   reads that launch URL after the Drawer mounts; normal Router linking remains.
2. Hermes would not parse a locale-formatted date string, yielding invalid prayer
   dates. Civil dates now use `Intl.DateTimeFormat.formatToParts`; regression checks
   include date boundaries in multiple time zones.

The Gesture builder's callback registration triggers a React compiler ref-rule
false positive: it treats registered event handlers as render-time calls. Only
that registration expression suppresses `react-hooks/refs`; other rules remain.

Validation commands:

```sh
npx tsc --noEmit
npx expo lint
npx expo-doctor
npx tsx tests-ui/reader.test.mjs
python3 scripts-ui/verify-simulator-state.py
```

Final checks pass; Expo Doctor reports 20/20. Regression checks cover longest-term
matching, accent/case folding and word boundaries, city date rollover, ordered and
finite prayer times, unique real-book block IDs and both required Arabic fixtures.
The concurrent content report's earlier UI errors predate these fixes.

Read-only SQLite verification after process termination/relaunch confirms the three
annotation kinds, exact offsets/styles, notes, real-book progress and settings.

## V2 · iPhone feedback (17 November 2026)

- Location now opens a searchable country → city sheet, with GPS first. The
  bundled WGS84 city-centre directory covers all 27 requested countries/territories
  and 117 cities (4–6 per country). Puerto Rico is grouped as requested. Manual
  selections persist their name, country, coordinates and IANA zone in the
  existing SQLite settings row; legacy numeric city choices remain readable.
  GPS uses the device's civil zone. Both prayer screens use the same settings.
  Intl.DateTimeFormat formats times in the selected city's zone, including DST.
  Accent-insensitive country/city search retains original indexes after filtering.
- Pinch freezes list scrolling and the viewability anchor. A scale transform
  previews size without text reflow or database writes. Finalize (including
  cancellation) applies the final clamped size once, then the content-size event
  waits one animation frame for cell layout measurements and performs one
  scrollToOffset correction to the captured first visible block. No gesture
  callback repeatedly scrolls. Initial-navigation retries are blocked during
  pinch/restoration. Bottom reading space lets even short books keep their final
  blocks aligned after shrinking; the page does not hit its scroll limit first.
- Reproduce sequential resizing in Expo Go with
  exp://127.0.0.1:8081/--/reader?book=muestra&block=s1-b2&dev=pinch
  (development builds only). It invokes the same begin/update/finalize callbacks
  at 23 → 29 → 18 → 32 → 23 px, five seconds apart. Inspect the paragraph starting
  “Una palabra de esperanza” and the s1-b2 anchor in the five pinch PNGs.
  This exercises reflow/anchor restoration; it does not inject physical
  two-finger touches or establish the tactile feel on the owner's iPhone.
- Corán uses green leather, gold borders and only the title plus ornament;
  all Risale covers use varied burgundy reds, gold double borders and serif
  brand/title/author. Explicit catalog cover colours are deliberately superseded
  by shelf semantics. Wood is lighter, grain/shadows softer, spine shading adds
  depth. The introductory library hero is removed.
- UI chrome uses system sans-serif, normal sentence-case labels and crimson
  accents. The drawer has Ionicons and Lectura/Herramientas/App groups. Lists use
  inset cards; marks/theme choices use a shared segmented control. Prayer cards
  navigate to the schedule. Reader bars use translucent colour, hide on downward
  scrolling and toggle on taps; their layout space stays fixed to avoid shifting
  the reading paragraph. Selection/colour panels have rounded floating surfaces.
- SDK 58 reference, Router, Location and icon documentation were consulted.
  Ionicons is explicitly installed with expo install and works in Expo Go.
  Existing Metro on 8081 was reused throughout; no server was started/stopped.
  Content assets, scripts/ and the pre-existing registry edit were left alone.

V2 validation: TypeScript and Expo lint pass, as do reader.test.mjs,
locations.test.mjs (all 117 cities in summer/winter), and the existing read-only
SQLite simulator regression. Tijuana was selected through the actual filtered
country/city UI; its America/Tijuana times replaced Madrid's and the selection
survived relaunch. Screenshots in ekran/v2/ include all requested screens,
additional light/dark lists, the shared saved location on Home, and individual
pinch steps. Images were opened for visual inspection; intermediate captures
with a truncated prayer title and a transient JSX text warning were replaced.

Final pinch capture: all five 23/29/18/32/23 px states keep the beginning of\nthe same s1-b2 paragraph at the top of the list viewport, including shrinking\nthe short fixture to 18 px. No source edits or hot reload occurred during this\nfinal sequence. All individual step PNGs were opened and inspected.\n

## V3 · Reading themes, contents and selection (17 November 2026)

- Seven reading palettes, in order: Claro suave, Claro, Papel antiguo (default),
  Oscuro, Galaxia, Atardecer and Noche ámbar. Each supplies page, raised surface,
  text, muted, borders, Arabic, glossary accent and contrasting accent foreground.
  Existing screens consume the shared palette; shelf wood and cover artwork retain
  their material colours. Versioned SQLite migration maps old 0/1/2 to 1/2/3 once.
- Ajustes has a current-theme row. The reader's Aa display control opens the same
  bottom sheet (long press still increments font size; full font controls remain in
  Ajustes). Palette icon, round close, hint and seven theme-painted serif samples
  follow reference 10. Selection applies immediately without closing the sheet.
- Reader contents button opens an animated left panel at 87% width with a dimmed
  dismissible backdrop. Sections own a hierarchy of heading levels 1–3; headings
  and sections jump to stable block IDs. Separate chevrons expand/collapse without
  jumping. All branches start expanded. Search folds accents and case, showing
  matching ancestors/descendants regardless of collapsed state. The deepest entry
  containing the current block is active. Bookmarks, notes and highlights filter
  the existing store by book and jump to their blocks; empty tabs have Spanish copy.
- Selection uses Expo Go-compatible React Native PanResponder with 44×44 pt handle
  targets. Only the active paragraph switches from nested Text to wrapping measured
  word Text pieces, retaining serif, bold/italic, Arabic, glossary and annotation
  colours. onLayout provides word rectangles; a handle grant measures the paragraph
  in window coordinates. Movement finds the nearest word (with stronger vertical
  weighting for line choice), then updates the corresponding UTF-16 boundary.
  Handles grow/shrink without crossing. The FlatList cannot scroll during dragging,
  including responder cancellation. The toolbar sits above the footer so a selection
  near the top remains visible. All existing actions retain the same offsets.
- Text outside the selection, empty page space, headings and header taps dismiss
  selection. The original tap is consumed for glossary purposes. Selected words
  keep it. End offsets are exclusive, include the complete final word, and trim
  trailing whitespace. Existing annotations that still exactly match their source
  slice are repaired to full words on load and persisted; stale anchors stay intact.
  The saved “Una palabra de esperanz” record now reads “Una palabra de esperanza:”.
- Limits: dragging stays within one paragraph, with no auto-scroll or magnifier.
  The active paragraph can reflow slightly because measured words use flex wrapping
  rather than native justification. Arabic spans remain indivisible tokens for drag
  hit-testing. Physical finger feel and Android were not exercised; simulator dev
  movement exercises the same nearest-word hit test and endpoint callback, without
  injecting touch events.

Verification: TypeScript, Expo lint, reader regression checks and selection boundary
checks pass. selection.test.mjs covers the clipped esperanza endpoint, word shrinking,
UTF-16 surrogate pairs and empty text. The read-only SQLite check covers corrected
exclusive offsets and persistence after relaunch. Existing Metro on 8081 was reused.
All PNGs in docs/ekran/v3/ were opened for visual inspection. Replaced captures whose
floating toolbar obscured selection and whose bookmark still showed the old truncation.
Expo Go's blue floating gear is host UI, not part of the application.

Development-only routes for reproducibility (`exp://127.0.0.1:8081/--/` prefix):

- Home `?dev=paper`, `?dev=dark`, `?dev=galaxy`.
- Reader `reader?book=muestra&block=s1-b2&dev=paper` (also dark/galaxy).
- Theme sheet `reader?book=muestra&dev=themes`.
- Expanded real contents `reader?book=ramadan-frugalidad-agradecimiento&dev=index`.
- Fixture contents `reader?book=muestra&dev=index`; bookmarks `dev=index-marks`.
- Moved selection `reader?book=muestra&block=s1-b2&dev=handles` selects the opening
  passage then moves the end handle to measured token 8 through the drag hit-test.

Screenshots: 01-themes.png; 02-home-paper.png; 03-reader-paper.png;
04-home-dark.png; 05-reader-dark.png; 06-home-galaxy.png; 07-reader-galaxy.png;
08-index-real.png; 09-index-bookmarks.png; 10-handles.png; 11-index-fixture.png.


## V4 · Immediate reader restoration (17 November 2026)

- Confirmed the old delay: a 400 ms startup timer plus repeated unmeasured
  `scrollToIndex` / estimated-offset / 250 ms retries traversed virtualized batches.
  Reader now resolves block → page → saved progress before the first list mount,
  renders `rows.slice(window.start)`, and opens at native offset zero. Explicit
  Índice/bookmark jumps replace the window and remount only the FlatList to clear
  both native offsets and stale virtualization measurements. Route destination
  changes also reset reader state. There are no index-scroll retries or startup waits.
- Each row carries its absolute index once, before slicing. Viewability maps through
  that row rather than adding a possibly stale window offset; progress, current page,
  contents highlighting and pinch anchors continue using the full book. Selection,
  glossary and annotations retain stable block IDs and UTF-16 offsets.
- Backward user drags near the window start prepend up to 40 preceding rows.
  `maintainVisibleContentPosition={{ minIndexForVisible: 0 }}` preserves the native
  visible block; the list and block keys remain unchanged during prepends. Initial
  onStartReached/layout notifications cannot prepend automatically. An onScroll
  threshold also handles an initial start notification consumed before user touch.
  Previously loaded content stays available, so successive drags can reach row zero.
- Pinch still freezes viewability and disables scrolling from onStart; preview is
  transform-only. Finalize batches one size update with a fresh window beginning
  at the captured absolute block. The next content layout releases the restoration
  guard. This supersedes V2's measured-cell offset correction and avoids stale cell
  coordinates or measurement traversal after text reflow. Font controls use the
  same restoration path. No scrolling occurs during gesture updates.
- Limits: restoration aligns a block, not an exact pixel/word within a paragraph.
  A deliberate jump/reflow remounts the list; backward prepends do not. Up to 40 rows
  are added per user drag; another drag can add another chunk. FlatList still
  virtualizes the suffix (windowSize 7); slice length is not a rendered-cell count.
  Cold Expo Go/bundle/font/SQLite startup precedes reader mount and is outside the
  measured interval. Android and physical two-finger touch feel remain untested.

Verification on booted iPhone 16 Pro / iOS 18.5, using the existing Metro on 8081:

- Temporary development-only mount → first visible target timing at page 55
  (`s3-b13`): **6,161 ms before**, **168 ms after** via `page=55`; reopening with
  only `book` restored persisted page 55 in **182 ms**. Same simulator, book and
  settings; these are single development runs, not a physical-device benchmark.
  Timing overlay was removed after captures; no timing logs remain in source.
- Terminated Expo Go before each deep-link launch. First opened `reader?book=ramadan-frugalidad-agradecimiento&page=55`,
  allowed progress to persist, then reopened with only `book` to test saved progress.
  Add `__expo_disable_fab=1` to keep Expo Go's floating gear away from Índice.
- Actual simulator backward drag exposed the immediately preceding paragraph with
  page 55 still in view. Actual Índice search for “LA QUINTA FRASE” and row press
  jumped from page 5 to `s3-b185` on page 82. The same callback serves contents marks;
  external Marcadores uses the block route, resolved before mounting.
- Existing `dev=pinch&block=s3-b185` invoked begin/update/finalize at
  23 → 29 → 18 → 32 → 23 px; the page-82 heading stayed at the top. This exercises
  the production callbacks without injecting physical two-finger touches.
- TypeScript, Expo lint, all three tests-ui suites (reader, selection, locations),
  and the read-only persisted SQLite simulator check passed.

Visually inspected evidence in `docs/ekran/v4/`: `00-timing-before.png`,
`00-timing-after-page.png`, `00-timing-after-saved.png`, `01-saved-page-55.png`,
`02-index-page-82.png`, `03-scroll-back.png`, `04-pinch-before-page-82.png`,
`05-pinch-29-page-82.png`, `06-pinch-final-page-82.png`.
