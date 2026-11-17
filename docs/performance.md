# Performance pass — 2026-11-17

## Environment and method

Baseline: 0e7cf13. iPhone 17 Pro simulator `RisalePerf`, iOS 26.3, Expo Go 58.0.7, Hermes development bundle, Metro 8082. Separate simulator from the concurrent audit. Measurements use temporary performance.now timestamps, render counters, React DevTools profiling, and a Hermes CPU sample. All temporary code was removed. These are development measurements, not production TTI or device FPS claims.

The controlled row sequence was selection, moving the end handle, drag-active state, dictionary-open state, theme, font-size reflow, and scroll. Counters were reset before each action and read after 0.8–1.2 seconds. Each list had 10 mounted rows. Font reflow remounts the window by design and is excluded from improvement claims. Baseline selection/move/drag/dictionary/scroll each rendered 10 rows; optimized runs consistently produced 1/1/0/0/0. Theme still rendered all 10.

## Measurements

| Issue / measure | Before | After | Interpretation |
|---|---:|---:|---|
| Rows rendered on selection | 10 | 1 | Stable glossary callback preserves row memoization |
| Rows rendered on handle move | 10 | 1 | Only selected row updates; same-word moves also bail out |
| Rows rendered on drag-active state | 10 | 0 | No row props change |
| Rows rendered on dictionary-open state | 10 | 0 | No row props change |
| Rows rendered on scroll/progress | 10 | 0 | Palette consumers no longer subscribe to full store |
| Rows rendered on theme change | 10 | 10 | Required repaint preserved |
| Daily prayer calculation batches while idle | Every second (53 calls observed in 53 ticks) | 1 across subsequent ticks | Today and tomorrow cached by date, coordinates and method; countdown still ticks |
| Book JSON modules evaluated by registry import | 2 | 0 | Requested book still evaluated synchronously and cached by Metro |
| Registry evaluation, Node, 5 fresh processes, median | 1.230 ms | 0.602 ms | Isolated loader check, not mobile startup |
| Reader page 1 first layout, median of 3 | 121 ms | 120 ms | Essentially unchanged |
| Reader page 55 first layout, median of 3 | 244 ms | 196 ms | High variance; no confident opening-time improvement claim |
| Saved-position route first layout, single sample | 426 ms | 653 ms | Slower sample; insufficient evidence to attribute to change |

Matched reader checks used paper theme, font size 23, the real book, warm Hermes modules, and router.replace between page 1, page 55, and the saved-position route. Timestamp starts at ReaderContent render and ends at its first onLayout; it excludes native launch, route dispatch and first book-module evaluation. Raw page-1 samples: before 191/121/118 ms, after 120/114/238 ms. Page-55 samples: before 244/188/626 ms, after 196/194/705 ms. The prior windowed opening implementation remains intact.

Initial Home run: fonts ready 183.6 ms and Home mounted 364.2 ms after layout-module evaluation. A later warm reload measured 42.1/129.8 ms. Cache conditions differ, so this is **not** a valid startup before/after improvement. Home mount is only a readiness proxy, not verified cold-launch TTI. Five font packages register 12 font faces; font loading still gates store mounting.

Baseline React diagnostic profile: 51.8 s, 72 commits, 4582 ms render work, 14 commits over 16 ms, worst 1017 ms. Optimized diagnostic profile: 23.9 s, 34 commits, 4368 ms render work, 11 over 16 ms, worst 1804 ms. These unequal recording windows and expensive active-selection geometry do not support comparing aggregate timings. Counters above are the controlled comparison.

Post-fix Hermes sample: 16.45 s, 1352 samples, 92.2% root/idle; host createTask 1.6%, completeWork 1.0%, young-generation GC 0.8%. Source maps failed to resolve, so no source-level hotspot claim. No baseline CPU-sampling comparison or reliable frame-drop/memory-delta measurement was obtained.

## Changes

- a532c7d: separate palette context; stable glossary handler reads committed selection through a ref; repeated same-word handle movement retains the existing selection object.
- db31dfe: memoize today's/tomorrow's prayer calculations and the displayed-time formatter; date/location/method changes invalidate calculations.
- 201c62f: generated registry stores literal-path loader functions; hasBook checks availability without evaluating a book; unknown IDs still fall back to muestra.

## Investigated, left unchanged

- Selection prefix measurement is quadratic in paragraph word count: each word owns an invisible full-prefix Text tree. Baseline React profile reported ~184 ms per WordMeasurements render; another run reached 758 ms. It remains the main selection risk. Replace it with native text hit-testing/selection geometry in a separate pass with strict glyph-position comparisons. Visible text and word-selection.tsx were not changed.
- Per-word Text nodes remain expensive on initial mount and font reflow. Profiler recorded 629 PressableVirtualText instances mounted in one commit (8830 total components including geometry). Existing FlatList windowSize=7 and deep-position windowing remain. Tune batches with release-device frame traces; do not flatten text and silently break tap/selection semantics.
- SQLite writes are asynchronous and serialized. Scroll events only track offsets; progress writes occur on viewable-block changes, deduplicated by blockId. No per-scroll-tick writes were found. A fast fling can still queue one transaction per visited block and broad useStore consumers still update. Consider coalescing progress with background/unmount flush and explicit durability tests; this pass preserves save reliability.
- Hydration repairs each mark by flattening/scanning its book. Marked books will still load during repair even with lazy registry loaders. Build one block index per referenced book if real saved-mark datasets show startup cost.
- Covers: 600x900 JPEGs, 608 KB total, shared among shelf items; displayed at 116x174 or 132x198 points (up to 396x594 pixels at 3x). Three decoded RGBA images are about 6.18 MiB, an estimate rather than a measured resident-memory delta. No unnecessary large asset was identified and no visual assets were changed.
- Location table: 117 cities / 27 countries. Store uses a type-only import (erased); the prayer route imports the actual table. No measured startup hotspot established. No speculative split.
- Prayer route has its own usePrayer plus PrayerCard's usePrayer; each now caches daily astronomy, but two timers remain while that route is mounted. Consider sharing a clock if profiling justifies it.
- Drawer navigation and reader-to-Home replace behavior are unchanged. Opening and theme transitions work; no trustworthy native transition/FPS baseline was collected. Test release builds on Android and physical iOS hardware before claiming smoothness.

## Validation and risks

`npx tsc --noEmit`, `npm run lint`, `git diff --check` pass. Existing tests-ui/selection.test.mjs, reader.test.mjs and locations.test.mjs passed using TypeScript's transpileModule in a temporary CommonJS runner (no dependency added). Checks cover glossary matching, word boundaries/UTF-16, book IDs/content, IANA zones and prayer ordering.

Actual simulator actions verified book opening at saved page 55, underlined-term tap opening its dictionary, native long-press selection, end-handle drag, pinch with page 55 retained, and changing dark to paper theme. Screenshots are in [ekran/perf](ekran/perf/). Theme screenshot shows the newly checked paper option. Top and bottom bars remain visible. Selection glyph structure/styles were untouched; screenshots were visually inspected, but no automated pixel-diff assertion was performed. Screenshots at different zoom/selection states are behavior evidence, not matching-layout comparisons.

Main behavior risks: first access to a new book now pays its evaluation cost; theme updates must continue propagating through PaletteContext; prayer cache invalidation must preserve midnight/DST/location/method behavior. Real-device Android verification, production cold-start TTI, deterministic saved-position latency and release frame profiling remain outstanding. No push was made.
