import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View, Pressable, Image } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { catalog, hasBook } from "../src/content/load";
import { CatalogBook } from "../src/content/types";
import { Label } from "../src/ui/common";
import { usePalette, useStore } from "../src/ui/store";
import { PrayerCard } from "../src/ui/prayer";
import { es } from "../src/i18n/es";
const coverArt = {
  coran: require("../assets/covers/coran.jpg"),
  coleccion: require("../assets/covers/coleccion.jpg"),
  breves: require("../assets/covers/breves.jpg"),
};
const gold = "#EBCB86";
const engraved = {
  textShadowColor: "#2a0608",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 1.5,
};
function Cover({ book }: { book: CatalogBook; index: number }) {
  const small = book.shelf === "breves";
  const w = small ? 116 : 132,
    h = small ? 174 : 198;
  const long = book.title.length;
  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: small ? 2 : 4,
        backgroundColor: book.shelf === "coran" ? "#0D3B29" : "#6E1220",
        shadowColor: "#160d06",
        shadowOffset: { width: 4, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 6,
        elevation: 6,
      }}
    >
      <Image
        source={coverArt[book.shelf]}
        resizeMode="stretch"
        style={{ position: "absolute", width: w, height: h, borderRadius: small ? 2 : 4 }}
      />
      <LinearGradient
        colors={["#0007", "#FFFFFF14", "#0000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: small ? 10 : 16 }}
      />
      {small ? (
        <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 12, paddingBottom: 12 }}>
          <Label
            style={{
              fontFamily: "EBGaramond_400Regular",
              fontSize: 6.5,
              color: "#FBE9D8",
              textAlign: "right",
            }}
          >
            {es.fromCollection}
          </Label>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Label
              style={{
                fontFamily: "UnifrakturMaguntia_400Regular",
                fontSize: long > 30 ? 15 : long > 18 ? 19 : 24,
                lineHeight: long > 30 ? 18 : long > 18 ? 23 : 28,
                color: "#FFFFFF",
                textShadowColor: "#3a0d08",
                textShadowOffset: { width: 1, height: 1.5 },
                textShadowRadius: 1,
              }}
            >
              {book.title}
            </Label>
            <Label
              style={{
                marginTop: 8,
                fontFamily: "EBGaramond_600SemiBold",
                fontSize: 7,
                letterSpacing: 0.8,
                color: "#FBE3CF",
              }}
            >
              {es.author.toUpperCase()}
            </Label>
            <View style={{ height: 26 }} />
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          {book.shelf === "coleccion" && (
            <Label
              style={{
                fontFamily: "EBGaramond_600SemiBold",
                fontSize: 6.5,
                color: gold,
                textAlign: "center",
                ...engraved,
              }}
            >
              {es.fromCollection}
            </Label>
          )}
          <Label
            style={{
              fontFamily: "PlayfairDisplay_700Bold",
              fontSize: long > 25 ? 13 : long > 14 ? 16 : 19,
              lineHeight: long > 25 ? 16 : long > 14 ? 19 : 23,
              color: gold,
              textAlign: "center",
              marginVertical: 9,
              ...engraved,
            }}
          >
            {book.title}
          </Label>
          {book.shelf === "coleccion" && (
            <Label
              style={{
                fontFamily: "EBGaramond_700Bold",
                fontSize: 7.5,
                lineHeight: 9,
                color: gold,
                textAlign: "center",
                ...engraved,
              }}
            >
              {"Bediüzzaman\nSaid Nursî"}
            </Label>
          )}
        </View>
      )}
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
      update({ theme: 2, fontSize: 23 });
    if (__DEV__ && ["paper", "dark", "galaxy"].includes(String(params.dev)))
      update({
        theme: ({ paper: 2, dark: 3, galaxy: 4 } as Record<string, number>)[
          String(params.dev)
        ],
        fontSize: 23,
      });
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
        {(["coran", "coleccion", "breves"] as const).map((shelf, si) => (
          <View key={shelf}>
            <LinearGradient
              colors={["#F1E4D2", "#E5D0B3", "#EFDFC7"]}
              style={{ paddingTop: 14 }}
            >
              <View
                style={{
                  alignSelf: "center",
                  borderRadius: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 6,
                  backgroundColor: "#FFF8ED",
                  borderWidth: 1,
                  borderColor: "#DBC7A9",
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
                      opacity: 0.025,
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
              colors={["#EAD7BA", "#D7BC94", "#BE9C74"]}
              style={{
                height: 19,
                borderTopWidth: 1,
                borderTopColor: "#F5DDB4",
                shadowOpacity: 0.1,
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
