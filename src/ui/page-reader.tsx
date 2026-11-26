import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState, type ComponentProps } from "react";
import {
  FlatList,
  Image,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bookImage } from "../content/load";
import { PageBook, PageImage } from "../content/types";
import { es } from "../i18n/es";
import { Label } from "./common";
import { usePalette, useStore } from "./store";
import { ThemePicker } from "./theme-picker";

const gap = 8;
type OnViewable = NonNullable<ComponentProps<typeof FlatList<PageImage>>["onViewableItemsChanged"]>;
const viewabilityConfig = { itemVisiblePercentThreshold: 12 };

export function PageReader({
  book,
  block,
  page,
}: {
  book: PageBook;
  block?: string;
  page?: string;
}) {
  const { readProgress, saveProgress } = useStore();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [position, setPosition] = useState(() => {
    const id = block ?? (page ? `page-${page}` : readProgress(book.id)?.blockId);
    const first = Math.max(0, book.pages.findIndex((item) => item.id === id));
    return { zoom: 1, first };
  });
  const [visible, setVisible] = useState(position.first);
  const [showTheme, setShowTheme] = useState(false);
  const [pinching, setPinching] = useState(false);
  const preview = useSharedValue(1);
  const horizontal = useSharedValue(0);
  const panStart = useSharedValue(0);
  const nextZoom = useRef(position.zoom);
  const current = useRef(position.first);
  const imageWidth = width * position.zoom;
  const lengths = useMemo(() => {
    let offset = 0;
    const layouts: { index: number; length: number; offset: number }[] = [];
    for (const [index, { imageSize: [w, h] }] of book.pages.entries()) {
      const length = (imageWidth * h) / w + gap;
      layouts.push({ index, length, offset });
      offset += length;
    }
    return layouts;
  }, [book.pages, imageWidth]);
  const previewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: preview.get() }],
  }));
  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: Math.max(width - imageWidth, Math.min(0, horizontal.get())) }],
  }));

  const onViewable = useCallback<OnViewable>(
    ({ viewableItems }) => {
      const first = viewableItems[0];
      if (first?.index == null) return;
      current.current = first.index;
      setVisible(first.index);
      saveProgress(book.id, { blockId: first.item.id, page: first.index + 1 });
    },
    [book.id, saveProgress],
  );

  /* eslint-disable react-hooks/refs -- Gesture builder registers event callbacks. */
  const gestures = useMemo(() => {
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onStart(() => {
        nextZoom.current = position.zoom;
        setPinching(true);
      })
      .onUpdate(({ scale }) => {
        nextZoom.current = Math.min(3, Math.max(1, position.zoom * scale));
        preview.set(nextZoom.current / position.zoom);
      })
      .onFinalize(({ focalX }, success) => {
        preview.set(1);
        setPinching(false);
        const zoom = nextZoom.current;
        if (!success || Math.abs(zoom - position.zoom) < 0.02) return;
        const focus = Number.isFinite(focalX) ? focalX : width / 2;
        const x = focus - (focus - horizontal.get()) * (zoom / position.zoom);
        horizontal.set(Math.max(width * (1 - zoom), Math.min(0, x)));
        setPosition({ zoom, first: current.current });
      });
    const pan = Gesture.Pan()
      .enabled(position.zoom > 1)
      .maxPointers(1)
      .activeOffsetX([-12, 12])
      .failOffsetY([-12, 12])
      .onStart(() => {
        panStart.set(horizontal.get());
      })
      .onUpdate(({ translationX }) => {
        horizontal.set(Math.max(width - imageWidth, Math.min(0, panStart.get() + translationX)));
      });
    return Gesture.Simultaneous(Gesture.Native(), pinch, pan);
  }, [horizontal, imageWidth, panStart, position.zoom, preview, width]);
  /* eslint-enable react-hooks/refs */

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, paddingTop: insets.top }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: palette.paper,
        borderBottomWidth: 1,
        borderColor: palette.line,
      }}>
        <Pressable accessibilityLabel={es.back} accessibilityRole="button"
          onPress={() => router.replace("/")} style={{ padding: 10 }}>
          <Ionicons name="chevron-back" size={24} color={palette.text} />
        </Pressable>
        <Label numberOfLines={1} style={{ flex: 1, textAlign: "center", color: palette.muted, fontSize: 14 }}>
          {book.title}
        </Label>
        <Pressable accessibilityLabel={es.theme} accessibilityRole="button"
          onPress={() => setShowTheme(true)} style={{ padding: 10 }}>
          <Label style={{ fontSize: 19, color: palette.text }}>Aa</Label>
        </Pressable>
      </View>
      <View style={{ flex: 1, overflow: "hidden" }}>
        <Animated.View style={[{ flex: 1 }, previewStyle]}>
          <GestureDetector gesture={gestures}>
            <FlatList
              key={position.zoom}
              data={book.pages}
              keyExtractor={(item) => item.id}
              initialScrollIndex={position.first}
              getItemLayout={(_, index) => lengths[index]}
              onViewableItemsChanged={onViewable}
              viewabilityConfig={viewabilityConfig}
              scrollEnabled={!pinching}
              initialNumToRender={3}
              maxToRenderPerBatch={4}
              windowSize={5}
              renderItem={({ item, index }) => (
                <Animated.View style={[{ width: imageWidth }, pageStyle]}>
                  <Image
                    source={bookImage(book.id, item.image)}
                    accessible
                    accessibilityLabel={`${es.page} ${index + 1}`}
                    resizeMode="contain"
                    style={{ width: imageWidth, height: lengths[index].length - gap, marginBottom: gap }}
                  />
                </Animated.View>
              )}
            />
          </GestureDetector>
        </Animated.View>
      </View>
      <View style={{
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: Math.max(12, insets.bottom),
        backgroundColor: palette.paper,
        borderTopWidth: 1,
        borderColor: palette.line,
      }}>
        <Label style={{ fontSize: 14, color: palette.muted }}>
          {es.page} {visible + 1} / {book.pages.length}
        </Label>
      </View>
      <ThemePicker visible={showTheme} onClose={() => setShowTheme(false)} />
    </View>
  );
}
