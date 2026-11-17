import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Rect, Path } from "react-native-svg";
import { catalog, hasBook } from "../src/content/load";
import { CatalogBook } from "../src/content/types";
import { Label, styles } from "../src/ui/common";
import { usePalette, useStore } from "../src/ui/store";
import { PrayerCard } from "../src/ui/prayer";
import { es } from "../src/i18n/es";
function Cover({ book, index }: { book: CatalogBook; index: number }) {
  return (
    <View
      style={{
        width: 132,
        height: 185,
        backgroundColor:
          book.coverColor ?? ["#70363B", "#304B50", "#554334"][index % 3],
        borderRadius: 3,
        shadowColor: "#160d06",
        shadowOffset: { width: 4, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
      }}
    >
      <Svg width="132" height="185" style={{ position: "absolute" }}>
        <Rect
          x="6"
          y="5"
          width="120"
          height="175"
          rx="2"
          stroke="#C7A56A"
          strokeWidth="1.4"
          fill="none"
        />
        <Rect
          x="10"
          y="9"
          width="112"
          height="167"
          stroke="#C7A56A"
          strokeWidth=".5"
          fill="none"
        />
        <Path
          d="M46 32 L66 21 L86 32 M46 151 L66 162 L86 151"
          fill="none"
          stroke="#C7A56A"
        />
        <Path d="M3 0 V185 M15 0 V185" stroke="#fff" opacity=".06" />
      </Svg>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 17,
          alignItems: "center",
        }}
      >
        <Label
          style={{
            fontSize: 8,
            color: "#E2C991",
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          {es.brand.toUpperCase()}
        </Label>
        <Label
          style={{
            fontFamily: "EBGaramond_600SemiBold",
            fontSize:
              book.title.length > 30 ? 15.5 : book.title.length > 25 ? 18 : 22,
            color: "#F4DDA8",
            textAlign: "center",
            marginVertical: 12,
          }}
        >
          {book.title}
        </Label>
        <Label style={{ fontSize: 8, color: "#E2C991", textAlign: "center" }}>
          {book.shelf === "coran" ? es.shelves[0] : es.author}
        </Label>
      </View>
    </View>
  );
}
export default function Home() {
  const p = usePalette(),
    { progress, update } = useStore(),
    [toast, setToast] = useState(false),
    ref = useRef<React.ComponentRef<typeof ScrollView>>(null),
    params = useLocalSearchParams(),
    nav = useNavigation();
  useEffect(() => {
    if (__DEV__ && ["top", "bottom", "drawer"].includes(String(params.dev)))
      update({ theme: 1, fontSize: 23 });
  }, [params.dev, update]);
  useEffect(() => {
    if (__DEV__ && params.dev === "drawer") {
      const t = setTimeout(() => nav.dispatch({ type: "OPEN_DRAWER" }), 600);
      return () => clearTimeout(t);
    }
  }, [params.dev, nav]);
  useEffect(() => {
    if (__DEV__ && params.dev === "bottom") {
      const timer = setTimeout(
        () => ref.current?.scrollToEnd({ animated: false }),
        700,
      );
      return () => clearTimeout(timer);
    }
  }, [params.dev]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(false), 2200);
      return () => clearTimeout(t);
    }
  }, [toast]);
  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScrollView
        ref={ref}
        onContentSizeChange={() => {
          if (__DEV__ && params.dev === "bottom")
            ref.current?.scrollToEnd({ animated: false });
        }}
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        <View
          style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}
        >
          <Label style={[styles.eyebrow, { color: p.accent }]}>
            {es.app.toUpperCase()}
          </Label>
          <Label
            style={{
              fontSize: 33,
              fontFamily: "EBGaramond_400Regular",
              marginTop: 8,
            }}
          >
            {es.free}
          </Label>
          <Label style={{ fontSize: 13, color: p.muted, marginTop: 5 }}>
            {es.resume}
          </Label>
        </View>
        {(["coran", "coleccion", "breves"] as const).map((shelf, si) => (
          <View key={shelf}>
            <LinearGradient
              colors={["#D6AC7D", "#BC8756", "#D4A877"]}
              style={{ paddingTop: 14 }}
            >
              <View
                style={{
                  alignSelf: "center",
                  borderRadius: 5,
                  paddingHorizontal: 24,
                  paddingVertical: 6,
                  backgroundColor: "#F7E5C2",
                  borderWidth: 1,
                  borderColor: "#A57440",
                }}
              >
                <Label
                  style={{ color: "#5B3B25", fontSize: 14, fontWeight: "600" }}
                >
                  {es.shelves[si]}
                </Label>
              </View>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  overflow: "hidden",
                }}
                pointerEvents="none"
              >
                {Array.from({ length: 50 }, (_, i) => (
                  <View
                    key={i}
                    style={{
                      position: "absolute",
                      left: i * 11,
                      top: 0,
                      bottom: 0,
                      width: i % 3 === 0 ? 2 : 1,
                      backgroundColor: i % 2 ? "#5e3714" : "#fff",
                      opacity: 0.06,
                    }}
                  />
                ))}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 22,
                  paddingTop: 22,
                  paddingBottom: 13,
                  gap: 22,
                }}
              >
                {catalog.books
                  .filter((b) => b.shelf === shelf)
                  .map((book, i) => (
                    <Pressable
                      key={book.id}
                      accessibilityRole="button"
                      accessibilityLabel={book.title}
                      onPress={() =>
                        book.available && hasBook(book.id)
                          ? router.push({
                              pathname: "/reader",
                              params: { book: book.id },
                            })
                          : setToast(true)
                      }
                    >
                      <Cover book={book} index={i} />
                      {progress[book.id] && (
                        <View
                          style={{
                            position: "absolute",
                            bottom: 4,
                            left: -5,
                            backgroundColor: "#8A3F36",
                            padding: 6,
                            borderRadius: 10,
                          }}
                        >
                          <Label style={{ fontSize: 10, color: "#fff" }}>
                            {es.continue} · {es.page} {progress[book.id].page}
                          </Label>
                        </View>
                      )}
                    </Pressable>
                  ))}
              </ScrollView>
            </LinearGradient>
            <LinearGradient
              colors={["#EACB98", "#C1905D", "#8B5E36"]}
              style={{
                height: 19,
                borderTopWidth: 1,
                borderTopColor: "#F5DDB4",
                shadowOpacity: 0.25,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 5 },
              }}
            />
          </View>
        ))}
        <View style={{ padding: 22, paddingTop: 28 }}>
          <PrayerCard />
        </View>
      </ScrollView>
      {toast && (
        <View
          style={{
            position: "absolute",
            bottom: 30,
            alignSelf: "center",
            backgroundColor: "#29251F",
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 30,
          }}
        >
          <Label style={{ color: "#fff" }}>{es.soon}</Label>
        </View>
      )}
    </View>
  );
}
