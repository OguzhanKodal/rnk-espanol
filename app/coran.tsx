import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  FlatList,
  Linking,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Label } from "../src/ui/common";
import { usePalette, useStore } from "../src/ui/store";
import { es } from "../src/i18n/es";
import {
  PAGE_COUNT,
  QURAN_ID,
  arabicDigits,
  juzOfPage,
  loadQuran,
  pageContent,
  pageOf,
} from "../src/content/quran";

const QURAN_FONT = "AmiriQuran_400Regular";
const MIN_SIZE = 18,
  MAX_SIZE = 46,
  DEFAULT_SIZE = 27;
const clampSize = (n: number) =>
  Math.round(Math.max(MIN_SIZE, Math.min(MAX_SIZE, n)));
// Tanzil writes pause marks as separate tokens (" ۖ "). Shown attached to the
// preceding word so the font places them above it, as in a printed mushaf, and
// they never wrap onto the next line. Display only: the data stays verbatim.
const keepMarks = (t: string) => t.replace(/ ([\u06D6-\u06DC])/g, "$1");
const PAGES = Array.from({ length: PAGE_COUNT }, (_, i) => i + 1);
const VIEWABILITY = { itemVisiblePercentThreshold: 10 };
// Pages above the window are added in small steps when scrolling up.
const PREPEND = 6;

type Palette = ReturnType<typeof usePalette>;

const QuranPage = memo(function QuranPage({
  page,
  size,
  p,
}: {
  page: number;
  size: number;
  p: Palette;
}) {
  const q = loadQuran();
  const groups = useMemo(() => pageContent(q, page), [q, page]);
  const ink = p.text,
    frame = p.dark ? "#8A6A3F" : "#B58345";
  return (
    <View>
      {groups.map((g) => {
        const sura = q.suras[g.sura - 1];
        const bism =
          g.startsSura && g.sura !== 1 && g.sura !== 9
            ? (q.bismillahVariants[g.sura] ?? q.bismillah)
            : undefined;
        return (
          <View key={g.sura}>
            {g.startsSura && (
              <View
                accessibilityRole="header"
                style={{
                  marginTop: 14,
                  marginBottom: 6,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: frame,
                  borderRadius: 4,
                  backgroundColor: p.dark ? "#2E2416" : "#F6E7C4",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: QURAN_FONT,
                    fontSize: Math.min(size * 0.85, 30),
                    color: ink,
                    writingDirection: "rtl",
                  }}
                >
                  {`سُورَةُ ${sura[0]}`}
                </Text>
                <Label style={{ fontSize: 12, color: p.muted }}>
                  {`${g.sura}. ${sura[1]} · ${sura[3] === "M" ? es.quran.meccan : es.quran.medinan} · ${sura[2]} ${es.quran.verses}`}
                </Label>
              </View>
            )}
            {bism && (
              <Text
                style={{
                  fontFamily: QURAN_FONT,
                  fontSize: size,
                  lineHeight: size * 2,
                  color: ink,
                  textAlign: "center",
                  writingDirection: "rtl",
                }}
              >
                {bism}
              </Text>
            )}
            <Text
              style={{
                fontFamily: QURAN_FONT,
                fontSize: size,
                lineHeight: size * 2.1,
                color: ink,
                textAlign: "justify",
                writingDirection: "rtl",
              }}
            >
              {g.verses.map((v) => (
                <Text key={v.n}>
                  {keepMarks(v.text)}
                  <Text style={{ color: p.accent }}>
                    {` \u06DD${arabicDigits(v.n)} `}
                  </Text>
                </Text>
              ))}
            </Text>
          </View>
        );
      })}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginVertical: 12,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: p.line }} />
        <Label style={{ fontSize: 12, color: p.muted }}>{page}</Label>
        <View style={{ flex: 1, height: 1, backgroundColor: p.line }} />
      </View>
    </View>
  );
});

export default function Coran() {
  const params = useLocalSearchParams<{ page?: string; dev?: string }>();
  const { settings, update, progress, saveProgress } = useStore(),
    p = usePalette(),
    insets = useSafeAreaInsets(),
    { height: viewportHeight } = useWindowDimensions();
  const q = loadQuran();
  const size = settings.quranSize ?? DEFAULT_SIZE;
  const initial = Math.min(
    PAGE_COUNT,
    Math.max(1, Number(params.page) || progress[QURAN_ID]?.page || 1),
  );
  // The list starts at `start`; earlier pages are prepended on demand.
  const [window, setWindow] = useState({ start: initial, generation: 0 }),
    [visible, setVisible] = useState(initial),
    [index, setIndex] = useState(false),
    [tab, setTab] = useState<"suras" | "juz">("suras"),
    [pinching, setPinching] = useState(false),
    [previewScale, setPreviewScale] = useState(1);
  const prependArmed = useRef(false);
  const anchor = useRef(initial),
    activePinch = useRef(false),
    pinchFrom = useRef(size),
    pinchTo = useRef(size),
    currentSize = useRef(size);
  useEffect(() => {
    currentSize.current = size;
  }, [size]);
  const data = useMemo(() => PAGES.slice(window.start - 1), [window.start]);
  const jump = useCallback((to: number) => {
    anchor.current = to;
    prependArmed.current = false;
    setVisible(to);
    setWindow((w) => ({ start: to, generation: w.generation + 1 }));
  }, []);
  const go = (to: number) => {
    setIndex(false);
    jump(to);
  };
  // Drawer screens stay mounted; follow a new ?page= link.
  const [linked, setLinked] = useState(params.page);
  if (params.page !== linked) {
    setLinked(params.page);
    const to = Number(params.page);
    if (to >= 1 && to <= PAGE_COUNT) {
      setVisible(to);
      setWindow((w) => ({ start: to, generation: w.generation + 1 }));
    }
  }
  useEffect(() => {
    saveProgress(QURAN_ID, { blockId: `page-${visible}`, page: visible });
  }, [visible, saveProgress]);
  // Like the book reader: only add earlier pages once the reader drags,
  // so opening a page does not render a cascade of pages above it.
  const prepend = useCallback(() => {
    if (!prependArmed.current) return;
    setWindow((w) =>
      w.start > 1 ? { ...w, start: Math.max(1, w.start - PREPEND) } : w,
    );
  }, []);
  const onViewable = useCallback(
    ({ viewableItems }: { viewableItems: { item?: number | null }[] }) => {
      const to = viewableItems[0]?.item;
      if (to && !activePinch.current) {
        anchor.current = to;
        setVisible(to);
      }
    },
    [],
  );
  const pinchBegin = useCallback(() => {
    activePinch.current = true;
    pinchFrom.current = currentSize.current;
    pinchTo.current = currentSize.current;
    setPinching(true);
  }, []);
  const pinchUpdate = useCallback((e: { scale: number }) => {
    pinchTo.current = clampSize(pinchFrom.current * e.scale);
    setPreviewScale(pinchTo.current / pinchFrom.current);
  }, []);
  const pinchEnd = useCallback(() => {
    if (!activePinch.current) return;
    activePinch.current = false;
    setPinching(false);
    setPreviewScale(1);
    if (pinchTo.current !== pinchFrom.current) {
      // Reflow at the page being read so the reader keeps their place.
      update({ quranSize: pinchTo.current });
      jump(anchor.current);
    }
  }, [update, jump]);
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
  useEffect(() => {
    if (!__DEV__ || params.dev !== "pinch") return;
    const timers = [36, 20, 27].map((value, i) =>
      setTimeout(
        () => {
          pinchBegin();
          pinchUpdate({ scale: value / pinchFrom.current });
          pinchEnd();
        },
        3000 + i * 4000,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [params.dev, pinchBegin, pinchUpdate, pinchEnd]);
  const renderItem = useCallback(
    ({ item }: { item: number }) => <QuranPage page={item} size={size} p={p} />,
    [size, p],
  );
  const sura = q.suras[q.pages[visible - 1][0] - 1];
  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: insets.top }}>
      <View
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
          <Ionicons name="chevron-back" size={24} color={p.text} />
        </Pressable>
        <Label
          numberOfLines={1}
          style={{ fontSize: 14, flex: 1, textAlign: "center", color: p.muted }}
        >
          {es.quran.title}
        </Label>
        <Pressable
          accessibilityLabel={es.toc}
          onPress={() => setIndex(true)}
          style={{ padding: 10 }}
        >
          <Ionicons name="list-outline" size={24} color={p.text} />
        </Pressable>
      </View>
      <GestureDetector gesture={pinch}>
        <FlatList
          key={window.generation}
          data={data}
          keyExtractor={String}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          onStartReached={prepend}
          onStartReachedThreshold={1.5}
          onScrollBeginDrag={() => {
            prependArmed.current = true;
          }}
          scrollEnabled={!pinching}
          style={{ transform: [{ scale: previewScale }] }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: viewportHeight / 2,
          }}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={5}
          renderItem={renderItem}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={VIEWABILITY}
        />
      </GestureDetector>
      <View
        style={{
          borderTopWidth: 1,
          borderColor: p.line,
          paddingHorizontal: 20,
          paddingTop: 11,
          paddingBottom: Math.max(12, insets.bottom),
          flexDirection: "row",
          gap: 10,
          backgroundColor: p.paper + "ED",
        }}
      >
        <Label numberOfLines={1} style={{ fontSize: 14, color: p.muted, flex: 1 }}>
          {`${sura[1]} · ${es.quran.juz} ${juzOfPage(q, visible)}`}
        </Label>
        <Label style={{ fontSize: 14, color: p.muted }}>
          {`${es.quran.page} ${visible}`}
        </Label>
      </View>
      <Modal
        visible={index}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIndex(false)}
      >
        <View style={{ flex: 1, backgroundColor: p.bg }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              gap: 8,
            }}
          >
            {(["suras", "juz"] as const).map((t) => (
              <Pressable
                key={t}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === t }}
                onPress={() => setTab(t)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 18,
                  backgroundColor: tab === t ? p.accent : p.line,
                }}
              >
                <Label
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: tab === t ? p.bg : p.text,
                  }}
                >
                  {es.quran[t]}
                </Label>
              </Pressable>
            ))}
            <View style={{ flex: 1 }} />
            <Pressable
              accessibilityLabel={es.close}
              onPress={() => setIndex(false)}
              style={{ padding: 8 }}
            >
              <Ionicons name="close" size={26} color={p.text} />
            </Pressable>
          </View>
          <FlatList
            data={
              tab === "suras"
                ? q.suras.map((_, i) => i + 1)
                : q.juz.map((_, i) => i + 1)
            }
            keyExtractor={(n) => `${tab}-${n}`}
            initialNumToRender={20}
            renderItem={({ item: n }) => {
              const [s, a] = tab === "suras" ? [n, 1] : q.juz[n - 1];
              const sura = q.suras[s - 1];
              const to = tab === "suras" ? sura[4] : pageOf(q, s, a);
              return (
                <Pressable
                  onPress={() => go(to)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderColor: p.line,
                    backgroundColor: pressed ? p.line : "transparent",
                  })}
                >
                  <Label
                    style={{ width: 40, fontSize: 15, color: p.muted }}
                  >
                    {n}
                  </Label>
                  <View style={{ flex: 1 }}>
                    <Label style={{ fontSize: 17, fontWeight: "600" }}>
                      {tab === "suras"
                        ? sura[1]
                        : `${es.quran.juz} ${n}`}
                    </Label>
                    <Label style={{ fontSize: 13, color: p.muted }}>
                      {tab === "suras"
                        ? `${sura[3] === "M" ? es.quran.meccan : es.quran.medinan} · ${sura[2]} ${es.quran.verses}`
                        : `${sura[1]} ${a}`}
                      {` · ${es.quran.page} ${to}`}
                    </Label>
                  </View>
                  <Text
                    style={{
                      fontFamily: QURAN_FONT,
                      fontSize: 22,
                      color: p.text,
                    }}
                  >
                    {sura[0]}
                  </Text>
                </Pressable>
              );
            }}
            ListFooterComponent={
              <Pressable
                accessibilityRole="link"
                onPress={() => Linking.openURL("https://tanzil.net")}
                style={{ padding: 20, paddingBottom: 40 }}
              >
                <Label style={{ fontSize: 12, color: p.muted }}>
                  {es.quran.credit}
                </Label>
              </Pressable>
            }
          />
        </View>
      </Modal>
    </View>
  );
}
