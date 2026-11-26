import Ionicons from "@expo/vector-icons/Ionicons";
import React, { memo, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Modal,
  View,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Book } from "../content/types";
import { usePalette, useStore } from "./store";
import { Label } from "./common";
import { Segments } from "./segments";
import { es } from "../i18n/es";
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
type Entry = {
  id: string;
  title: string;
  index: number;
  end: number;
  depth: number;
  children: Entry[];
};
// Memoized and empty while closed: the reader re-renders on every scrolled block,
// and building the index walks the whole book.
export const ContentsPanel = memo(function ContentsPanel({
  visible,
  onClose,
  book,
  currentIndex,
  page,
  onJump,
  devTab = 0,
}: {
  visible: boolean;
  onClose: () => void;
  book: Book;
  currentIndex: number;
  page: number;
  onJump: (id: string) => void;
  devTab?: number;
}) {
  const p = usePalette(),
    { marks } = useStore(),
    inset = useSafeAreaInsets(),
    { width } = useWindowDimensions();
  const [tab, setTab] = useState(devTab),
    [query, setQuery] = useState(""),
    [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(visible);
  const [slide] = useState(() => new Animated.Value(-width));
  if (visible && !mounted) setMounted(true);
  useEffect(() => {
    if (visible) {
      slide.setValue(-width);
      Animated.timing(slide, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slide, {
        toValue: -width,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    return () => slide.stopAnimation();
  }, [visible, width, slide]);
  const entries = useMemo(() => {
    let index = 0;
    const roots: Entry[] = [];
    for (const section of book.sections) {
      const root: Entry = {
        id: section.blocks[0]?.id ?? section.id,
        title: section.title,
        index,
        end: index + section.blocks.length,
        depth: 0,
        children: [],
      };
      roots.push(root);
      const stack = [root];
      for (const block of section.blocks) {
        if (
          block.type === "heading" &&
          !(block.id === root.id && fold(block.text) === fold(root.title))
        ) {
          const depth = block.level;
          while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
            stack.pop()!.end = index;
          }
          const item: Entry = {
            id: block.id,
            title: block.text,
            index,
            end: root.end,
            depth,
            children: [],
          };
          stack[stack.length - 1].children.push(item);
          stack.push(item);
        }
        index++;
      }
    }
    return roots;
  }, [book]);
  const blockPages = useMemo(
    () => book.sections.flatMap((s) => s.blocks.map((b) => b.page)),
    [book],
  );
  if (!mounted) return null;
  const flat: Entry[] = [];
  const visit = (e: Entry) => {
    const matches = (node: Entry): boolean =>
      fold(node.title).includes(fold(query)) || node.children.some(matches);
    if (!query || matches(e)) {
      flat.push(e);
      if (query || !collapsed.has(e.id + e.depth)) e.children.forEach(visit);
    }
  };
  entries.forEach(visit);
  const active = flat
    .filter((e) => currentIndex >= e.index && currentIndex < e.end)
    .at(-1);
  const kinds = ["", "bookmark", "highlight", "note"];
  const saved = marks.filter(
    (m) => m.bookId === book.id && m.kind === kinds[tab],
  );
  const jump = (id: string) => {
    onJump(id);
    onClose();
  };
  return (
    <Modal
      visible={mounted}
      transparent
      // Android: draw under the system bars like iOS; content pads with insets.
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#0007" }}>
        <Pressable
          accessibilityLabel={es.close}
          onPress={onClose}
          style={{ position: "absolute", inset: 0 }}
        />
        <Animated.View
          style={{
            width: width * 0.87,
            flex: 1,
            backgroundColor: p.bg,
            paddingTop: inset.top + 18,
            paddingHorizontal: 16,
            paddingBottom: inset.bottom,
            transform: [{ translateX: slide }],
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Label style={{ fontSize: 29, fontWeight: "700", flex: 1 }}>
              {es.toc}
            </Label>
            <Pressable
              accessibilityLabel={es.close}
              onPress={onClose}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: p.paper,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                name="close"
                size={24}
                color={p.text}
              />
            </Pressable>
          </View>
          <Label
            style={{
              fontSize: 13,
              color: p.muted,
              marginTop: 6,
              marginBottom: 18,
            }}
          >
            {book.title} · {es.currentPage} {page}
          </Label>
          <Segments
            values={[es.toc, es.marks, es.highlights, es.notes]}
            selected={tab}
            onChange={setTab}
          />
          {tab === 0 && (
            <TextInput
              accessibilityLabel={es.searchTitle}
              placeholder={es.searchTitle}
              placeholderTextColor={p.muted}
              value={query}
              onChangeText={setQuery}
              style={{
                padding: 15,
                fontSize: 16,
                color: p.text,
                backgroundColor: p.paper,
                borderRadius: 15,
                marginTop: 14,
              }}
            />
          )}
          <ScrollView
            style={{ marginTop: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {tab === 0
              ? flat.map((e) => (
                  <View
                    key={e.id + e.depth}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: active === e ? p.paper : "transparent",
                      borderRadius: 8,
                      borderBottomWidth: 1,
                      borderColor: p.line,
                    }}
                  >
                    <Pressable
                      onPress={() => jump(e.id)}
                      style={{
                        flex: 1,
                        paddingVertical: 17,
                        paddingLeft: Math.min(e.depth, 3) * 12 + 8,
                      }}
                    >
                      <Label
                        style={{
                          fontSize: e.depth ? 15 : 17,
                          fontWeight: e.depth ? "400" : "600",
                          color: active === e ? p.accent : p.text,
                        }}
                      >
                        {e.title}
                      </Label>
                      <Label
                        style={{ fontSize: 14, color: p.muted, marginTop: 4 }}
                      >
                        {es.page}{" "}
                        {blockPages[e.index]}
                      </Label>
                    </Pressable>
                    {!!e.children.length && (
                      <Pressable
                        accessibilityLabel={e.title}
                        accessibilityState={{
                          expanded: !collapsed.has(e.id + e.depth),
                        }}
                        onPress={() =>
                          setCollapsed((prev) => {
                            const next = new Set(prev);
                            if (next.has(e.id + e.depth))
                              next.delete(e.id + e.depth);
                            else next.add(e.id + e.depth);
                            return next;
                          })
                        }
                        style={{ padding: 14 }}
                      >
                        <Ionicons
                          accessible={false}
                          accessibilityElementsHidden
                          importantForAccessibility="no-hide-descendants"
                          name={
                            collapsed.has(e.id + e.depth)
                              ? "chevron-forward"
                              : "chevron-down"
                          }
                          size={20}
                          color={p.muted}
                        />
                      </Pressable>
                    )}
                  </View>
                ))
              : saved.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => jump(m.blockId)}
                    style={{
                      paddingVertical: 18,
                      borderBottomWidth: 1,
                      borderColor: p.line,
                    }}
                  >
                    <Label
                      numberOfLines={3}
                      style={{
                        fontFamily: "EBGaramond_400Regular",
                        fontSize: 20,
                      }}
                    >
                      {m.text}
                    </Label>
                    {m.note && (
                      <Label style={{ marginTop: 6, color: p.muted }}>
                        {m.note}
                      </Label>
                    )}
                    <Label
                      style={{ marginTop: 8, fontSize: 12, color: p.accent }}
                    >
                      {es.page} {m.page}
                    </Label>
                  </Pressable>
                ))}
            {tab > 0 && !saved.length && (
              <Label style={{ color: p.muted, paddingVertical: 24 }}>
                {
                  [
                    "",
                    es.emptyBookMarks,
                    es.emptyBookHighlights,
                    es.emptyBookNotes,
                  ][tab]
                }
              </Label>
            )}
            {tab === 0 && !flat.length && (
              <Label style={{ color: p.muted }}>{es.noResults}</Label>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
});
