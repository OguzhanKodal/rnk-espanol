import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
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
type Row = { block: Block; section: string };
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
}) {
  const b = row.block,
    text = blockText(b),
    ranges = useMemo(() => glossaryRanges(text), [text]);
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
          color: "#BC4340",
          writingDirection: "rtl",
          textAlign: "center",
          marginVertical: 20,
        }}
      >
        {b.text || es.arabic}
      </Text>
    );
  let offset = 0;
  const tokens: { text: string; start: number; end: number; span: Span }[] = [];
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
  return (
    <View style={{ marginBottom: 22 }}>
      <Text
        style={{
          fontSize,
          fontFamily: font,
          color,
          lineHeight: fontSize * 1.85,
          textAlign: b.type === "note" || fontSize > 28 ? "left" : "justify",
          fontStyle: b.type === "note" ? "italic" : "normal",
        }}
      >
        {tokens.map((t, i) => {
          const g = ranges.find((r) => t.start >= r.start && t.start < r.end);
          const mark = marks
            .filter(
              (m) =>
                m.kind === "highlight" && m.start < t.end && m.end > t.start,
            )
            .at(-1);
          const selected =
            selection && selection.start < t.end && selection.end > t.start;
          return (
            <Text
              key={i}
              suppressHighlighting
              onLongPress={() => onSelect(b.id, t.start, t.end)}
              onPress={() =>
                selection
                  ? onWord(b.id, t.start, t.end)
                  : g
                    ? onGlossary(g.entry)
                    : undefined
              }
              style={{
                fontFamily:
                  t.span.t === "arabic"
                    ? "Amiri_400Regular"
                    : `${font.startsWith("Libre") ? "LibreBaskerville" : "EBGaramond"}_${t.span.t === "bold" || mark?.bold ? "700Bold" : "400Regular"}${t.span.t === "italic" || mark?.italic || b.type === "note" ? "_Italic" : ""}`,
                color:
                  t.span.t === "arabic"
                    ? "#BC4340"
                    : mark || selected
                      ? "#302920"
                      : color,
                writingDirection: t.span.t === "arabic" ? "rtl" : "auto",
                backgroundColor: selected ? "#A9C8E9" : mark?.color,
                fontWeight: t.span.t === "bold" || mark?.bold ? "700" : "400",
                fontStyle:
                  t.span.t === "italic" || mark?.italic ? "italic" : undefined,
                textDecorationLine: g ? "underline" : "none",
                textDecorationColor: "#B79F7A",
              }}
            >
              {t.text || es.arabic}
            </Text>
          );
        })}
      </Text>
      {selection && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <Label style={{ color: "#4F7CAD", fontSize: 16 }}>●</Label>
          <Label
            style={{
              color: "#4F7CAD",
              fontSize: 10,
              flex: 1,
              textAlign: "center",
            }}
          >
            {es.extend}
          </Label>
          <Label style={{ color: "#4F7CAD", fontSize: 16 }}>●</Label>
        </View>
      )}
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
  const book = getBook(params.book ?? "muestra"),
    rows = useMemo<Row[]>(
      () =>
        book.sections.flatMap((s) =>
          s.blocks.map((block) => ({ block, section: s.title })),
        ),
      [book],
    );
  const [visible, setVisible] = useState(0),
    [selection, setSelection] = useState<Selection>(),
    [gloss, setGloss] = useState<GlossaryEntry>(),
    [toc, setToc] = useState(false),
    [colorMode, setColorMode] = useState(false),
    [noteOpen, setNoteOpen] = useState(false),
    [note, setNote] = useState(""),
    [notice, setNotice] = useState("");
  const list = useRef<FlatList<Row>>(null),
    anchor = useRef(0),
    size = useRef(settings.fontSize),
    currentSize = useRef(settings.fontSize),
    pinchAnchor = useRef(0);
  useEffect(() => {
    currentSize.current = settings.fontSize;
  }, [settings.fontSize]);
  const restored = useRef("");
  const initialProgress = useRef(progress);
  const scrollTo = useCallback(
    (index: number) => {
      const i = Math.max(0, Math.min(rows.length - 1, index));
      anchor.current = i;
      list.current?.scrollToIndex({
        index: i,
        animated: false,
        viewPosition: 0,
      });
    },
    [rows.length],
  );
  useEffect(() => {
    const key = book.id + ":" + (params.block ?? params.page ?? "");
    if (restored.current === key) return;
    restored.current = key;
    let index = params.block
      ? rows.findIndex((r) => r.block.id === params.block)
      : params.page
        ? rows.findIndex((r) => r.block.page >= Number(params.page))
        : rows.findIndex(
            (r) => r.block.id === initialProgress.current[book.id]?.blockId,
          );
    if (index < 0) index = 0;
    const t = setTimeout(() => scrollTo(index), 400);
    return () => clearTimeout(t);
  }, [book.id, params.block, params.page, rows, scrollTo]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!__DEV__ || !params.dev) return;
      const row = rows.find((r) => r.block.type === "paragraph");
      if (params.dev === "dark") update({ theme: 2 });
      if (params.dev === "arabic") update({ fontSize: 23 });
      if (params.dev === "large") update({ fontSize: 34 });
      if (params.dev === "toc") setToc(true);
      if (params.dev === "note" && row) {
        setSelection({ blockId: row.block.id, start: 0, end: 30 });
        setNoteOpen(true);
      }
      if (params.dev === "persist" && row) {
        for (const kind of ["bookmark", "highlight", "note"] as const)
          putMark({
            id: `dev-${kind}`,
            kind,
            bookId: book.id,
            blockId: row.block.id,
            start: 0,
            end: 23,
            color: colors[0],
            bold: true,
            italic: false,
            text: blockText(row.block).slice(0, 23),
            note: kind === "note" ? es.notePlaceholder : undefined,
            page: row.block.page,
          });
      }
      if (["arabic", "selection", "colors", "glossary"].includes(params.dev))
        update({ theme: 1 });
      if (params.dev === "glossary")
        setGloss(
          glossaryRanges(row ? blockText(row.block) : "gratitud")[0]?.entry ?? {
            term: "gratitud",
            variants: [],
            definition: "Reconocimiento de los dones recibidos.",
            verified: false,
          },
        );
      if (row && ["selection", "colors"].includes(params.dev)) {
        setSelection({
          blockId: row.block.id,
          start: 0,
          end: Math.min(40, blockText(row.block).length),
        });
        setColorMode(params.dev === "colors");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [params.dev, rows, update, putMark, book.id]);
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
      if (item?.index != null) {
        anchor.current = item.index;
        setVisible(item.index);
        saveProgress(book.id, {
          blockId: item.item.block.id,
          page: item.item.block.page,
        });
      }
    },
    [book.id, saveProgress],
  );
  const changeSize = useCallback(
    (value: number) => {
      const index = anchor.current;
      update({ fontSize: Math.round(Math.max(14, Math.min(34, value))) });
      setTimeout(() => scrollTo(index), 90);
    },
    [update, scrollTo],
  );
  const pinchBegin = useCallback(() => {
    size.current = currentSize.current;
    pinchAnchor.current = anchor.current;
  }, []);
  const pinchUpdate = useCallback(
    (e: { scale: number }) => {
      const next = Math.round(
        Math.max(14, Math.min(34, size.current * e.scale)),
      );
      update({ fontSize: next });
    },
    [update],
  );
  const pinchEnd = useCallback(() => {
    const index = pinchAnchor.current;
    setTimeout(() => scrollTo(index), 100);
  }, [scrollTo]);
  // Gesture builder registers callbacks; it does not invoke them during render.
  /* eslint-disable react-hooks/refs -- Gesture builder only registers event callbacks. */
  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .onBegin(pinchBegin)
        .onUpdate(pinchUpdate)
        .onEnd(pinchEnd),
    [pinchBegin, pinchUpdate, pinchEnd],
  );
  /* eslint-enable react-hooks/refs */
  const onSelect = useCallback(
    (blockId: string, start: number, end: number) => {
      setSelection({ blockId, start, end });
      setColorMode(false);
    },
    [],
  );
  const onWord = useCallback(
    (blockId: string, start: number, end: number) =>
      setSelection((s) =>
        s?.blockId === blockId
          ? {
              blockId,
              start: Math.min(s.start, start),
              end: Math.max(s.end, end),
            }
          : { blockId, start, end },
      ),
    [],
  );
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
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 18,
          paddingVertical: 10,
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
          data={rows}
          keyExtractor={(r) => r.block.id}
          contentContainerStyle={{ paddingHorizontal: 25, paddingBottom: 90 }}
          initialNumToRender={10}
          windowSize={7}
          onScrollToIndexFailed={(info) => {
            list.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: false,
            });
            setTimeout(
              () =>
                list.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                }),
              250,
            );
          }}
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
              onGlossary={setGloss}
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
          backgroundColor: p.bg,
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
          onPress={() => changeSize(settings.fontSize + 1)}
          accessibilityLabel={es.size}
        >
          <Label style={{ fontSize: 13, color: p.muted }}>A+</Label>
        </Pressable>
      </View>
      {selection && !noteOpen && (
        <View
          style={{
            position: "absolute",
            top: insets.top + 65,
            left: 12,
            right: 12,
            backgroundColor: "#303442",
            borderRadius: 13,
            padding: 10,
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
          <Label style={{ color: "#fff", fontSize: 13 }}>{notice}</Label>
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
      <Sheet title={es.toc} visible={toc} onClose={() => setToc(false)}>
        {book.sections.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => {
              setToc(false);
              scrollTo(rows.findIndex((r) => r.block.id === s.blocks[0]?.id));
            }}
            style={{
              paddingVertical: 17,
              borderBottomWidth: 1,
              borderColor: p.line,
            }}
          >
            <Label>{s.title}</Label>
            <Label style={{ fontSize: 12, color: p.muted, marginTop: 5 }}>
              {es.page} {s.blocks[0]?.page}
            </Label>
          </Pressable>
        ))}
      </Sheet>
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
