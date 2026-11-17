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
node scripts-ui/gen-registry.mjs
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer npx expo start --ios --port 8081
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
- Long press selects a word; tapping another word extends the selection in that
  paragraph. The blue endpoints are visual guides. This is the explicitly allowed
  tap-to-extend option, not native draggable selection handles. Whole-paragraph
  selection, copy, system share, bookmarks, notes, six highlight colours, bold,
  italic and deletion are implemented. Tools float below the reader header.
- Selections use UTF-16 character offsets over concatenated spans (matching JS
  string slicing), anchored by stable block IDs. Highlight colours include their
  own dark foreground so they stay readable in dark mode.
- Font size is clamped to 14–34 and persisted. Pinch causes live reflow and restores
  the block visible at gesture start; restoration is at block granularity, not an
  exact glyph/pixel. Settings also offer font controls and two bundled serif
  families with genuine bold/italic fonts. UI chrome has no fixed lineHeight.
- SQLite stores settings, progress by book and typed annotation arrays in a small
  key/value table. Writes are serialized and use `withTransactionAsync`. This
  intentionally keeps schema/migrations small for this local-only app; a large
  personal annotation library may warrant normalized tables later.
- Prayer calculation uses adhan, default Muslim World League, three methods,
  ten fallback cities, optional foreground GPS, local civil dates in the chosen
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
