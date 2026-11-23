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
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
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
// Index 0 is the last page so that, as in a printed mushaf, the next page is to the left.
const indexOf = (page: number) => PAGE_COUNT - page;
const pageAt = (index: number) => PAGE_COUNT - index;
const VIEWABILITY = { itemVisiblePercentThreshold: 60 };
const DATA = Array.from({ length: PAGE_COUNT }, (_, i) => pageAt(i));

type Palette = ReturnType<typeof usePalette>;

const QuranPage = memo(function QuranPage({
  page,
  width,
  size,
  p,
}: {
  page: number;
  width: number;
  size: number;
  p: Palette;
}) {
  const q = loadQuran();
  const groups = useMemo(() => pageContent(q, page), [q, page]);
  const first = q.suras[groups[0].sura - 1];
  const ink = p.text,
    frame = p.dark ? "#8A6A3F" : "#B58345";
  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 14 }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Label style={{ fontSize: 13, color: p.muted }}>
          {es.quran.juz} {juzOfPage(q, page)}
        </Label>
        <Label style={{ fontSize: 13, color: p.muted }}>{first[1]}</Label>
      </View>
      <View
        style={{
          borderWidth: 1.5,
          borderColor: frame,
          borderRadius: 6,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: p.paper,
        }}
      >
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
                    marginVertical: 8,
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
                      fontSize: size * 0.85,
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
                    {v.text}
                    <Text style={{ color: p.accent }}>
                      {` ۝${arabicDigits(v.n)} `}
                    </Text>
                  </Text>
                ))}
              </Text>
            </View>
          );
        })}
      </View>
      <Label
        style={{
          textAlign: "center",
          fontSize: 13,
          color: p.muted,
          marginTop: 10,
        }}
      >
        {page}
      </Label>
    </ScrollView>
  );
});

export default function Coran() {
  const params = useLocalSearchParams<{ page?: string }>();
  const { settings, progress, saveProgress } = useStore(),
    p = usePalette(),
    insets = useSafeAreaInsets(),
    { width } = useWindowDimensions();
  const q = loadQuran();
  const start = Math.min(
    PAGE_COUNT,
    Math.max(1, Number(params.page) || progress[QURAN_ID]?.page || 1),
  );
  const [index, setIndex] = useState(false),
    [tab, setTab] = useState<"suras" | "juz">("suras");
  const list = useRef<FlatList<number>>(null);
  const size = settings.fontSize + 4;
  const scrollTo = (to: number) =>
    list.current?.scrollToIndex({ index: indexOf(to), animated: false });
  const go = (to: number) => {
    setIndex(false);
    scrollTo(to);
  };
  useEffect(() => {
    // Drawer screens stay mounted; follow a new ?page= link.
    const to = Number(params.page);
    if (to >= 1 && to <= PAGE_COUNT)
      list.current?.scrollToIndex({ index: indexOf(to), animated: false });
  }, [params.page]);
  // The visible page drives the header and saved progress, however it was reached.
  const [visible, setVisible] = useState(start);
  const onViewable = useCallback(
    ({ viewableItems }: { viewableItems: { item?: number | null }[] }) => {
      const to = viewableItems[0]?.item;
      if (to) setVisible(to);
    },
    [],
  );
  useEffect(() => {
    saveProgress(QURAN_ID, { blockId: `page-${visible}`, page: visible });
  }, [visible, saveProgress]);
  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <QuranPage page={item} width={width} size={size} p={p} />
    ),
    [width, size, p],
  );
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
          {`${es.quran.title} · ${es.quran.page} ${visible}`}
        </Label>
        <Pressable
          accessibilityLabel={es.toc}
          onPress={() => setIndex(true)}
          style={{ padding: 10 }}
        >
          <Ionicons name="list-outline" size={24} color={p.text} />
        </Pressable>
      </View>
      <FlatList
        ref={list}
        data={DATA}
        keyExtractor={String}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={indexOf(start)}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        renderItem={renderItem}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={VIEWABILITY}
      />
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
