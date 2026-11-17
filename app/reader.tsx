import { ThemePicker } from "../src/ui/theme-picker";
import { ContentsPanel } from "../src/ui/contents-panel";
import { WordSelection, wordBounds } from "../src/ui/word-selection";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  useWindowDimensions,
  Text,
  FlatList,
  Pressable,
  Share,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Clipboard from "expo-clipboard";
import { getBook, glossaryRanges, GlossaryEntry } from "../src/content/load";
import { Block, Span } from "../src/content/types";
import { useStore, usePalette, Mark } from "../src/ui/store";
import { Label, Sheet, Button } from "../src/ui/common";
import { es } from "../src/i18n/es";
type Row = { block: Block; section: string; absoluteIndex: number };
type Selection = { blockId: string; start: number; end: number };
const emptyMarks: Mark[] = [];
const colors = [
  "#F2D856",
  "#ED9990",
  "#91C5EC",
  "#ECB06E",
  "#A6CB90",
  "#E9A9C8",
];
const blockText = (b: Block) =>
  "spans" in b
    ? b.spans.map((s) => s.text).join("")
    : "text" in b
      ? b.text
      : "";
const BlockView = memo(function BlockView({
  row,
  fontSize,
  font,
  color,
  muted,
  selection,
  marks,
  onWord,
  onSelect,
  onGlossary,
  onMove,
  onDrag,
  testMove,
}: {
  row: Row;
  fontSize: number;
  font: string;
  color: string;
  muted: string;
  selection?: Selection;
  marks: Mark[];
  onWord: (id: string, start: number, end: number) => void;
  onSelect: (id: string, start: number, end: number) => void;
  onGlossary: (g: GlossaryEntry) => void;
  onMove: (edge: "start" | "end", start: number, end: number) => void;
  onDrag: (active: boolean) => void;
  testMove?: boolean;
}) {
  const p = usePalette();
  const b = row.block,
    text = blockText(b),
    ranges = useMemo(() => glossaryRanges(text), [text]);
  const pieces = useMemo(() => {
    if (!("spans" in b)) return [];
    let offset = 0;
    const tokens: { text: string; start: number; end: number; span: Span }[] =
      [];
    for (const span of b.spans) {
      for (const part of (span.t === "arabic"
        ? [span.text]
        : span.text.match(/\S+\s*|\s+/gu)) ?? []) {
        tokens.push({
          text: part,
          start: offset,
          end: offset + part.length,
          span,
        });
        offset += part.length;
      }
    }
    // Split decoration boundaries once, independently of selection state. Spaces and
    // punctuation never inherit a glossary term's underline.
    return tokens.flatMap((t) => {
      const cuts = [
        ...new Set([
          t.start,
          t.end,
          ...ranges.flatMap((g) =>
            [g.start, g.end].filter((n) => n > t.start && n < t.end),
          ),
        ]),
      ].sort((a, b) => a - b);
      return cuts.slice(0, -1).map((start, i) => {
        const end = cuts[i + 1];
        const g = ranges.find((r) => start >= r.start && end <= r.end);
        const mark = marks
          .filter(
            (m) => m.kind === "highlight" && m.start < end && m.end > start,
          )
          .at(-1);
        return {
          text: text.slice(start, end),
          start,
          end,
          glossary: g,
          style: {
            fontFamily:
              t.span.t === "arabic"
                ? "Amiri_400Regular"
                : `${font.startsWith("Libre") ? "LibreBaskerville" : "EBGaramond"}_${t.span.t === "bold" || mark?.bold ? "700Bold" : "400Regular"}${t.span.t === "italic" || mark?.italic || b.type === "note" ? "_Italic" : ""}`,
            color: t.span.t === "arabic" ? p.arabic : mark ? "#302920" : color,
            writingDirection:
              t.span.t === "arabic" ? ("rtl" as const) : ("auto" as const),
            backgroundColor: mark?.color,
            textDecorationLine: g ? ("underline" as const) : ("none" as const),
            textDecorationColor: p.accent,
          },
        };
      });
    });
  }, [b, color, font, marks, p.accent, p.arabic, ranges, text]);
  if (b.type === "pageBreak")
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 15,
          marginVertical: 15,
        }}
      >
        <View
          style={{ height: 1, backgroundColor: muted, opacity: 0.3, flex: 1 }}
        />
        <Label
          style={{
            borderWidth: 1,
            borderColor: muted,
            borderRadius: 5,
            fontSize: 12,
            paddingHorizontal: 7,
            paddingVertical: 3,
            color: muted,
          }}
        >
          {b.page}
        </Label>
      </View>
    );
  if (b.type === "heading")
    return (
      <Text
        style={{
          fontFamily: "EBGaramond_600SemiBold",
          fontSize: fontSize + 8,
          color,
          textAlign: "center",
          marginTop: 25,
          marginBottom: 25,
        }}
      >
        {b.text}
      </Text>
    );
  if (b.type === "arabic")
    return (
      <Text
        style={{
          fontFamily: "Amiri_400Regular",
          fontSize: fontSize + 5,
          color: p.arabic,
          writingDirection: "rtl",
          textAlign: "center",
          marginVertical: 20,
        }}
      >
        {b.text || es.arabic}
      </Text>
    );
  return (
    <View style={{ marginBottom: 22 }}>
      <WordSelection
        pieces={pieces}
        fontSize={fontSize}
        font={font}
        color={color}
        start={selection?.start}
        end={selection?.end}
        onMove={onMove}
        onDrag={onDrag}
        onWord={(start, end) => onWord(b.id, start, end)}
        onSelect={(start, end) => onSelect(b.id, start, end)}
        onGlossary={(i) => {
          const g = pieces[i].glossary;
          if (g) onGlossary(g.entry);
        }}
        testMove={testMove}
      />
      {marks.some((m) => m.kind === "note") && (
        <Pressable
          onPress={() => {
            const note = marks.find((m) => m.kind === "note");
            if (note) Alert.alert(es.note, note.note);
          }}
          style={{ alignSelf: "flex-end", padding: 5 }}
        >
          <Label style={{ color: muted, fontSize: 14 }}>✎</Label>
        </Pressable>
      )}
    </View>
  );
});
export default function Reader() {
  const params = useLocalSearchParams();
  // A changed route is a new reading destination, even when Router reuses the screen.
  return (
    <ReaderContent key={`${params.book}:${params.block}:${params.page}`} />
  );
}
function ReaderContent() {
  const params = useLocalSearchParams<{
      book?: string;
      block?: string;
      page?: string;
      dev?: string;
    }>(),
    { settings, update, marks, putMark, deleteMark, progress, saveProgress } =
      useStore(),
    p = usePalette(),
    insets = useSafeAreaInsets();
  const { height: viewportHeight } = useWindowDimensions();
  const book = getBook(params.book ?? "muestra"),
    rows = useMemo<Row[]>(
      () =>
        book.sections
          .flatMap((s) =>
            s.blocks.map((block) => ({ block, section: s.title })),
          )
          .map((row, absoluteIndex) => ({ ...row, absoluteIndex })),
      [book],
    );
  // Resolve before the first FlatList mounts: no measurement or startup timer.
  const [window, setWindow] = useState(() => {
    const index = params.block
      ? rows.findIndex((r) => r.block.id === params.block)
      : params.page
        ? rows.findIndex((r) => r.block.page >= Number(params.page))
        : rows.findIndex((r) => r.block.id === progress[book.id]?.blockId);
    return { start: Math.max(0, index), generation: 0 };
  });
  const windowRows = useMemo(
    () => rows.slice(window.start),
    [rows, window.start],
  );
  const prependArmed = useRef(false);
  const list = useRef<FlatList<Row>>(null);
  const [dragging, setDragging] = useState(false),
    [themes, setThemes] = useState(false),
    [pinching, setPinching] = useState(false),
    [previewScale, setPreviewScale] = useState(1),
    [pinchReport, setPinchReport] = useState(""),
    [visible, setVisible] = useState(window.start),
    [selection, setSelection] = useState<Selection>(),
    [gloss, setGloss] = useState<GlossaryEntry>(),
    [toc, setToc] = useState(false),
    [colorMode, setColorMode] = useState(false),
    [noteOpen, setNoteOpen] = useState(false),
    [note, setNote] = useState(""),
    [notice, setNotice] = useState("");
  const touchKept = useRef(false);
  const anchor = useRef(window.start),
    size = useRef(settings.fontSize),
    currentSize = useRef(settings.fontSize),
    pinchAnchor = useRef(0),
    activePinch = useRef(false),
    pendingAnchor = useRef<number | null>(null),
    lastScroll = useRef(0),
    finalSize = useRef(settings.fontSize);
  useEffect(() => {
    currentSize.current = settings.fontSize;
  }, [settings.fontSize]);
  const scrollTo = useCallback(
    (index: number) => {
      if (activePinch.current) return;
      const i = Math.max(0, Math.min(rows.length - 1, index));
      anchor.current = i;
      pendingAnchor.current = null;
      prependArmed.current = false;
      lastScroll.current = 0;
      setVisible(i);
      setSelection(undefined);
      // Remount only for explicit jumps, never for prepending. This resets native
      // offsets and VirtualizedList measurement caches together, before painting.
      setWindow((w) => ({ start: i, generation: w.generation + 1 }));
    },
    [rows.length],
  );
  const prepend = useCallback(() => {
    if (
      !prependArmed.current ||
      activePinch.current ||
      pendingAnchor.current !== null
    )
      return;
    // Ignore mount/layout callbacks: only a user drag may expand the window.
    // Keep the list key and block keys stable so native position maintenance works.
    prependArmed.current = false;
    setWindow((w) =>
      w.start === 0 ? w : { ...w, start: Math.max(0, w.start - 40) },
    );
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!__DEV__ || !params.dev) return;
      const target = Math.max(
        0,
        rows.findIndex((r) => r.block.id === params.block),
      );
      const row = rows.slice(target).find((r) => r.block.type === "paragraph");
      if (params.dev === "dark") update({ theme: 3 });
      if (params.dev === "paper") update({ theme: 2, fontSize: 23 });
      if (params.dev === "galaxy") update({ theme: 4, fontSize: 23 });
      if (params.dev === "themes") {
        update({ theme: 2 });
        setThemes(true);
      }
      if (params.dev === "light") update({ theme: 0, fontSize: 23 });
      if (params.dev === "arabic") update({ fontSize: 23 });
      if (params.dev === "large") update({ fontSize: 34 });
      if (["toc", "index", "index-marks"].includes(params.dev)) setToc(true);
      if (params.dev === "note" && row) {
        setSelection({
          blockId: row.block.id,
          ...wordBounds(blockText(row.block), 0, 30),
        });
        setNoteOpen(true);
      }
      if (params.dev === "persist" && row) {
        for (const kind of ["bookmark", "highlight", "note"] as const)
          putMark({
            id: `dev-${kind}`,
            kind,
            bookId: book.id,
            blockId: row.block.id,
            ...wordBounds(blockText(row.block), 0, 23),
            color: colors[0],
            bold: true,
            italic: false,
            text: blockText(row.block).slice(
              0,
              wordBounds(blockText(row.block), 0, 23).end,
            ),
            note: kind === "note" ? es.notePlaceholder : undefined,
            page: row.block.page,
          });
      }
      if (["arabic", "selection", "colors", "glossary"].includes(params.dev))
        update({ theme: 2 });
      if (params.dev === "glossary")
        setGloss(
          glossaryRanges(row ? blockText(row.block) : "gratitud")[0]?.entry ?? {
            term: "gratitud",
            variants: [],
            definition: "Reconocimiento de los dones recibidos.",
            verified: false,
          },
        );
      if (
        row &&
        [
          "selection",
          "colors",
          "handles",
          "layout-on",
          "layout-cycle",
        ].includes(params.dev)
      ) {
        setSelection({
          blockId: row.block.id,
          ...wordBounds(blockText(row.block), 0, 25),
        });
        setColorMode(params.dev === "colors");
      }
    }, 100);
    const scroll =
      __DEV__ && params.dev === "bars-scroll"
        ? setTimeout(
            () =>
              list.current?.scrollToOffset({ offset: 320, animated: false }),
            1500,
          )
        : undefined;
    const clear =
      __DEV__ && params.dev === "layout-cycle"
        ? setTimeout(() => setSelection(undefined), 18000)
        : undefined;
    return () => {
      clearTimeout(timer);
      clearTimeout(clear);
      clearTimeout(scroll);
    };
  }, [params.dev, params.block, rows, update, putMark, book.id]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 2000);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const onViewable = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: { isViewable: boolean; index?: number; item: Row }[];
    }) => {
      const item = viewableItems.find((v) => v.isViewable);
      if (
        item?.index != null &&
        !activePinch.current &&
        pendingAnchor.current === null
      ) {
        anchor.current = item.item.absoluteIndex;
        setVisible(item.item.absoluteIndex);
        saveProgress(book.id, {
          blockId: item.item.block.id,
          page: item.item.block.page,
        });
      }
    },
    [book.id, saveProgress],
  );
  const restoreResize = useCallback(() => {
    if (pendingAnchor.current === null) return;
    pendingAnchor.current = null;
    setPinchReport(rows[anchor.current]?.block.id ?? "");
  }, [rows]);
  const reflowAt = useCallback(
    (index: number, fontSize: number) => {
      pendingAnchor.current = index;
      anchor.current = index;
      prependArmed.current = false;
      lastScroll.current = 0;
      setVisible(index);
      setWindow((w) => ({ start: index, generation: w.generation + 1 }));
      update({ fontSize });
    },
    [update],
  );
  const changeSize = useCallback(
    (value: number) => {
      const next = Math.round(Math.max(14, Math.min(34, value)));
      if (next === currentSize.current) return;
      reflowAt(anchor.current, next);
    },
    [reflowAt],
  );
  const pinchBegin = useCallback(() => {
    activePinch.current = true;
    size.current = currentSize.current;
    finalSize.current = currentSize.current;
    pinchAnchor.current = anchor.current;
    setPinching(true);
  }, []);
  const pinchUpdate = useCallback((e: { scale: number }) => {
    finalSize.current = Math.round(
      Math.max(14, Math.min(34, size.current * e.scale)),
    );
    setPreviewScale(finalSize.current / size.current);
  }, []);
  const pinchEnd = useCallback(() => {
    if (!activePinch.current) return;
    activePinch.current = false;
    setPinching(false);
    setPreviewScale(1);
    if (finalSize.current !== currentSize.current) {
      reflowAt(pinchAnchor.current, finalSize.current);
    }
  }, [reflowAt]);
  useEffect(() => {
    if (!__DEV__ || params.dev !== "pinch") return;
    const timers = [23, 29, 18, 32, 23].map((value, i) =>
      setTimeout(
        () => {
          pinchBegin();
          pinchUpdate({ scale: value / currentSize.current });
          pinchEnd();
        },
        5000 + i * 5000,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [params.dev, pinchBegin, pinchUpdate, pinchEnd]);
  // Gesture builder registers callbacks; it does not invoke them during render.
  /* eslint-disable react-hooks/refs -- Gesture builder only registers event callbacks. */
  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .onStart(pinchBegin)
        .onUpdate(pinchUpdate)
        .onFinalize(pinchEnd),
    [pinchBegin, pinchUpdate, pinchEnd],
  );
  /* eslint-enable react-hooks/refs */
  const onSelect = useCallback(
    (blockId: string, start: number, end: number) => {
      touchKept.current = true;
      const text = blockText(rows.find((r) => r.block.id === blockId)!.block);
      setSelection({ blockId, ...wordBounds(text, start, end) });
      setColorMode(false);
    },
    [rows],
  );
  const onWord = useCallback((blockId: string, start: number, end: number) => {
    setSelection((s) => {
      if (s?.blockId === blockId && start < s.end && end > s.start) {
        touchKept.current = true;
        return s;
      }
      return undefined;
    });
  }, []);
  const onMove = useCallback(
    (edge: "start" | "end", start: number, end: number) => {
      touchKept.current = true;
      setSelection((s) => {
        if (!s) return s;
        const text = blockText(
          rows.find((r) => r.block.id === s.blockId)!.block,
        );
        const bounds = wordBounds(text, start, end);
        const nextStart =
          edge === "start" && bounds.start < s.end ? bounds.start : s.start;
        const nextEnd =
          edge === "end" && bounds.end > s.start ? bounds.end : s.end;
        return nextStart === s.start && nextEnd === s.end
          ? s
          : { ...s, start: nextStart, end: nextEnd };
      });
    },
    [rows],
  );
  const onDrag = useCallback((active: boolean) => {
    touchKept.current = true;
    setDragging(active);
  }, []);
  const selectionRef = useRef(selection);
  useLayoutEffect(() => {
    selectionRef.current = selection;
  }, [selection]);
  const onGlossary = useCallback((g: GlossaryEntry) => {
    if (selectionRef.current) {
      setSelection(undefined);
      return;
    }
    setGloss(g);
  }, []);
  const selectedBlock = rows.find(
    (r) => r.block.id === selection?.blockId,
  )?.block;
  const selectedText =
    selectedBlock && selection
      ? blockText(selectedBlock).slice(selection.start, selection.end)
      : "";
  const existing = marks.find(
    (m) =>
      m.kind === "highlight" &&
      m.bookId === book.id &&
      m.blockId === selection?.blockId &&
      m.start < selection.end &&
      m.end > selection.start,
  );
  const save = useCallback(
    (
      kind: Mark["kind"],
      color = existing?.color ?? colors[0],
      bold = existing?.bold ?? false,
      italic = existing?.italic ?? false,
    ) => {
      if (!selection || !selectedBlock) return;
      putMark({
        id:
          kind === "highlight" && existing
            ? existing.id
            : `${Date.now()}-${Math.random()}`,
        kind,
        bookId: book.id,
        blockId: selection.blockId,
        start: selection.start,
        end: selection.end,
        color,
        bold,
        italic,
        text: selectedText,
        note: kind === "note" ? note : undefined,
        page: selectedBlock.page,
      });
      setNotice(es.saved);
      if (kind !== "highlight") {
        setSelection(undefined);
        setNoteOpen(false);
      }
    },
    [selection, selectedBlock, putMark, existing, book.id, selectedText, note],
  );
  const marksByBlock = useMemo(() => {
    const result: Record<string, Mark[]> = {};
    for (const m of marks)
      if (m.bookId === book.id) (result[m.blockId] ??= []).push(m);
    return result;
  }, [marks, book.id]);
  const font = settings.font
    ? "LibreBaskerville_400Regular"
    : "EBGaramond_400Regular";
  const current = rows[visible] ?? rows[0];
  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: insets.top }}>
      <View
        onTouchStart={() => setSelection(undefined)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 18,
          paddingVertical: 10,
          backgroundColor: p.paper + "ED",
          borderBottomWidth: 1,
          borderColor: p.line,
        }}
      >
        <Pressable
          accessibilityLabel={es.back}
          onPress={() => router.replace("/")}
          style={{ padding: 10 }}
        >
          <Label style={{ fontSize: 26 }}>‹</Label>
        </Pressable>
        <Label
          numberOfLines={1}
          style={{ fontSize: 14, flex: 1, textAlign: "center", color: p.muted }}
        >
          {book.title}
        </Label>
        <Pressable
          accessibilityLabel={es.toc}
          onPress={() => setToc(true)}
          style={{ padding: 10 }}
        >
          <Label style={{ fontSize: 24 }}>☷</Label>
        </Pressable>
      </View>
      <GestureDetector gesture={pinch}>
        <FlatList
          ref={list}
          key={window.generation}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          onStartReached={prepend}
          onStartReachedThreshold={2}
          onScrollBeginDrag={() => {
            prependArmed.current = true;
          }}
          scrollEnabled={!pinching && !dragging}
          onContentSizeChange={() => {
            requestAnimationFrame(restoreResize);
          }}
          onTouchStart={() => {
            touchKept.current = false;
          }}
          onTouchEnd={() => {
            if (selection)
              requestAnimationFrame(() => {
                if (!touchKept.current) {
                  setSelection(undefined);
                  setColorMode(false);
                }
              });
          }}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            if (y < lastScroll.current && y < viewportHeight * 2) prepend();
            lastScroll.current = y;
          }}
          scrollEventThrottle={32}
          style={{ transform: [{ scale: previewScale }] }}
          data={windowRows}
          keyExtractor={(r) => r.block.id}
          contentContainerStyle={{
            paddingHorizontal: 25,
            paddingBottom: viewportHeight,
          }}
          initialNumToRender={10}
          windowSize={7}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 12 }}
          extraData={{ selection, marks, settings }}
          renderItem={({ item }) => (
            <BlockView
              row={item}
              fontSize={settings.fontSize}
              font={font}
              color={p.text}
              muted={p.muted}
              selection={
                selection?.blockId === item.block.id ? selection : undefined
              }
              marks={marksByBlock[item.block.id] ?? emptyMarks}
              onWord={onWord}
              onSelect={onSelect}
              onGlossary={onGlossary}
              onMove={onMove}
              onDrag={onDrag}
              testMove={__DEV__ && params.dev === "handles"}
            />
          )}
        />
      </GestureDetector>
      <View
        style={{
          borderTopWidth: 1,
          borderColor: p.line,
          paddingHorizontal: 17,
          paddingTop: 11,
          paddingBottom: Math.max(12, insets.bottom),
          flexDirection: "row",
          gap: 10,
          backgroundColor: p.paper + "ED",
        }}
      >
        <Label
          numberOfLines={1}
          style={{ fontSize: 11, color: p.muted, flex: 1 }}
        >
          {book.title} · {current?.section}
        </Label>
        <Label style={{ fontSize: 11, color: p.muted }}>
          {es.page} {current?.block.page}
        </Label>
        <Pressable
          onPress={() => {
            setSelection(undefined);
            setThemes(true);
          }}
          accessibilityLabel={es.theme}
          onLongPress={() => changeSize(settings.fontSize + 1)}
        >
          <Label style={{ fontSize: 13, color: p.muted }}>Aa</Label>
        </Pressable>
      </View>
      {selection && !noteOpen && (
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 65,
            left: 12,
            right: 12,
            backgroundColor: "#303442",
            borderRadius: 22,
            padding: 14,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 8,
          }}
        >
          {colorMode ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                {colors.map((c, i) => (
                  <Pressable
                    key={c}
                    accessibilityLabel={es.colors[i]}
                    onPress={() => save("highlight", c)}
                    style={{
                      width: 29,
                      height: 29,
                      borderRadius: 16,
                      backgroundColor: c,
                      borderWidth: existing?.color === c ? 3 : 0,
                      borderColor: "#fff",
                    }}
                  />
                ))}
              </View>
              <View
                style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
              >
                <Pressable
                  accessibilityLabel={es.bold}
                  onPress={() => save("highlight", undefined, !existing?.bold)}
                  style={{
                    padding: 8,
                    backgroundColor: "#484D5D",
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>B</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={es.italic}
                  onPress={() =>
                    save("highlight", undefined, undefined, !existing?.italic)
                  }
                  style={{
                    padding: 8,
                    backgroundColor: "#484D5D",
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "#fff", fontStyle: "italic" }}>I</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    marks
                      .filter(
                        (m) =>
                          m.kind === "highlight" &&
                          m.bookId === book.id &&
                          m.blockId === selection.blockId &&
                          m.start < selection.end &&
                          m.end > selection.start,
                      )
                      .forEach((m) => deleteMark(m.id));
                    setSelection(undefined);
                  }}
                  style={{ padding: 8, marginLeft: "auto" }}
                >
                  <Text style={{ color: "#F2B1A7", fontSize: 12 }}>
                    {es.remove}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {[
                {
                  title: es.highlight,
                  icon: "●",
                  action: () => setColorMode(true),
                },
                {
                  title: es.note,
                  icon: "✎",
                  action: () => {
                    setNote("");
                    setNoteOpen(true);
                  },
                },
                {
                  title: es.copy,
                  icon: "▣",
                  action: () => {
                    void Clipboard.setStringAsync(selectedText);
                    setNotice(es.copied);
                    setSelection(undefined);
                  },
                },
                {
                  title: es.share,
                  icon: "↑",
                  action: () => void Share.share({ message: selectedText }),
                },
                {
                  title: es.bookmark,
                  icon: "◇",
                  action: () => save("bookmark"),
                },
                {
                  title: es.all,
                  icon: "▦",
                  action: () =>
                    selectedBlock &&
                    setSelection({
                      ...selection,
                      start: 0,
                      end: blockText(selectedBlock).length,
                    }),
                },
              ].map((a) => (
                <Pressable
                  key={a.title}
                  accessibilityLabel={a.title}
                  onPress={a.action}
                  style={{ paddingVertical: 5, alignItems: "center", flex: 1 }}
                >
                  <Text
                    style={{
                      color: a.title === es.highlight ? "#F2D856" : "#fff",
                      fontSize: 20,
                      marginBottom: 6,
                    }}
                  >
                    {a.icon}
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.1}
                    style={{ color: "#fff", fontSize: 9 }}
                  >
                    {a.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <Pressable
            onPress={() => setSelection(undefined)}
            style={{ alignSelf: "center", paddingTop: 8 }}
          >
            <Text style={{ fontSize: 10, color: "#D5D8E0" }}>{es.close}</Text>
          </Pressable>
        </View>
      )}
      {__DEV__ && params.dev === "pinch" && (
        <Label
          style={{
            position: "absolute",
            bottom: 85,
            left: 20,
            fontSize: 11,
            color: p.accent,
          }}
        >
          Ancla: {pinchReport} · {settings.fontSize}px
        </Label>
      )}
      {notice && (
        <View
          style={{
            position: "absolute",
            bottom: 95,
            alignSelf: "center",
            backgroundColor: p.accent,
            padding: 12,
            borderRadius: 14,
          }}
        >
          <Label style={{ color: p.accentText, fontSize: 13 }}>{notice}</Label>
        </View>
      )}
      <Sheet
        title={gloss?.term ?? es.definition}
        visible={!!gloss}
        onClose={() => setGloss(undefined)}
      >
        <Label style={{ fontSize: 19 }}>{gloss?.definition}</Label>
        {!gloss?.verified && (
          <Label style={{ fontSize: 12, color: p.muted, marginTop: 20 }}>
            {es.unverified}
          </Label>
        )}
      </Sheet>
      <ThemePicker visible={themes} onClose={() => setThemes(false)} />
      <ContentsPanel
        visible={toc}
        onClose={() => setToc(false)}
        book={book}
        currentIndex={visible}
        page={current?.block.page ?? 1}
        devTab={params.dev === "index-marks" ? 1 : 0}
        onJump={(id) => {
          setSelection(undefined);
          scrollTo(rows.findIndex((r) => r.block.id === id));
        }}
      />
      <Sheet
        title={es.note}
        visible={noteOpen}
        onClose={() => setNoteOpen(false)}
      >
        <Label
          style={{
            fontFamily: font,
            fontSize: 18,
            color: p.muted,
            marginBottom: 15,
          }}
        >
          {selectedText}
        </Label>
        <TextInput
          autoFocus
          multiline
          placeholder={es.notePlaceholder}
          placeholderTextColor={p.muted}
          value={note}
          onChangeText={setNote}
          style={{
            backgroundColor: p.bg,
            color: p.text,
            borderRadius: 12,
            padding: 16,
            minHeight: 120,
            fontSize: 17,
            marginBottom: 15,
          }}
        />
        <Button title={es.save} onPress={() => save("note")} />
      </Sheet>
    </View>
  );
}
