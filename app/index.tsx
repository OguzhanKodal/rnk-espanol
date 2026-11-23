import React, { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, View, Pressable, Image } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { catalog, hasBook, getBook } from "../src/content/load";
import { CatalogBook } from "../src/content/types";
import { Label } from "../src/ui/common";
import { usePalette, useStore } from "../src/ui/store";
import { PrayerCard } from "../src/ui/prayer";
import { WoodBackground, WoodGrain, woodPanel } from "../src/ui/wood-grain";
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
function Cover({ book }: { book: CatalogBook }) {
  const small = book.shelf === "breves";
  const w = small ? 80 : 88,
    h = small ? 120 : 132;
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
        style={{
          position: "absolute",
          width: w,
          height: h,
          borderRadius: small ? 2 : 4,
        }}
      />
      <LinearGradient
        colors={["#0007", "#FFFFFF14", "#0000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: small ? 10 : 16,
        }}
      />
      {small ? (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 7,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          <Label
            style={{
              fontFamily: "EBGaramond_400Regular",
              fontSize: 5.5,
              color: "#FBE9D8",
              textAlign: "right",
            }}
          >
            {es.fromCollection}
          </Label>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Label
              numberOfLines={4}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                fontFamily: long > 30 ? "EBGaramond_600SemiBold" : "UnifrakturMaguntia_400Regular",
                fontSize: long > 30 ? 9.5 : long > 18 ? 14 : 17,
                lineHeight: long > 30 ? 11 : long > 18 ? 16 : 19,
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
                marginTop: 4,
                fontFamily: "EBGaramond_600SemiBold",
                fontSize: 7,
                color: "#FBE3CF",
              }}
            >
              {es.author}
            </Label>
            <View style={{ height: 16 }} />
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 12,
          }}
        >
          {book.shelf === "coleccion" && (
            <Label
              style={{
                fontFamily: "EBGaramond_600SemiBold",
                fontSize: 5.5,
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
              fontSize: long > 25 ? 10 : long > 14 ? 12 : 14,
              lineHeight: long > 25 ? 12 : long > 14 ? 14 : 17,
              color: gold,
              textAlign: "center",
              marginVertical: 5,
              ...engraved,
            }}
          >
            {book.title}
          </Label>
          {book.shelf === "coleccion" && (
            <Label
              style={{
                fontFamily: "EBGaramond_700Bold",
                fontSize: 6.5,
                lineHeight: 7.5,
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
    if (__DEV__ && ["top", "bottom", "shelves", "drawer"].includes(String(params.dev)))
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
    if (__DEV__ && ["bottom", "shelves"].includes(String(params.dev))) {
      const timer = setTimeout(
        () => params.dev === "shelves"
          ? ref.current?.scrollTo({ y: 250, animated: false })
          : ref.current?.scrollToEnd({ animated: false }),
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
  const resumeBook = catalog.books.find(
    (b) => b.available && progress[b.id] && hasBook(b.id),
  );
  const saved = resumeBook ? progress[resumeBook.id] : undefined;
  const content = resumeBook ? getBook(resumeBook.id) : undefined;
  const section = content?.sections.find((s) =>
    s.blocks.some((b) => b.id === saved?.blockId),
  );
  const pages = content
    ? Math.max(...content.sections.flatMap((s) => s.blocks.map((b) => b.page)))
    : 1;
  return (
    <View style={{ flex: 1 }}>
      <WoodBackground dark={p.dark} />
      <ScrollView
        ref={ref}
        onContentSizeChange={() => {
          if (__DEV__ && params.dev === "bottom")
            ref.current?.scrollToEnd({ animated: false });
        }}
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        {resumeBook && saved && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Continuar leyendo ${resumeBook.title}, página ${saved.page} de ${pages}`}
            onPress={() =>
              router.push({
                pathname: "/reader",
                params: { book: resumeBook.id },
              })
            }
            style={({ pressed }) => ({
              marginHorizontal: 20,
              marginTop: 18,
              marginBottom: 6,
              padding: 20,
              borderRadius: 18,
              backgroundColor: p.dark ? p.paper : "#FFF4DC",
              borderWidth: 1,
              borderColor: p.dark ? "#8A6A3F" : "#B58345",
              shadowColor: "#3B2412",
              shadowOpacity: 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                name="book-outline"
                size={24}
                color={p.accent}
              />
              <Label style={{ fontSize: 22, fontWeight: "600", flex: 1 }}>
                Continuar leyendo
              </Label>
              <Ionicons
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                name="chevron-forward"
                size={20}
                color={p.accent}
              />
            </View>
            <Label style={{ marginTop: 16, fontSize: 18, fontWeight: "600" }}>
              {resumeBook.title}
            </Label>
            <Label style={{ marginTop: 6, color: p.muted }}>
              {section?.title}
            </Label>
            <View
              style={{
                height: 4,
                backgroundColor: p.line,
                borderRadius: 2,
                marginTop: 16,
              }}
            >
              <View
                style={{
                  width: `${Math.min(100, (saved.page / pages) * 100)}%`,
                  height: 4,
                  backgroundColor: p.accent,
                  borderRadius: 2,
                }}
              />
            </View>
            <Label style={{ marginTop: 10, fontSize: 14, color: p.muted }}>
              Página {saved.page} de {pages}
            </Label>
          </Pressable>
        )}
        {(["coran", "coleccion", "breves"] as const).map((shelf, si) => (
          <View key={shelf}>
            <LinearGradient
              colors={woodPanel(p.dark)}
              style={{ paddingTop: 14 }}
            >
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
                <WoodGrain />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingTop: 20,
                  paddingBottom: 10,
                  gap: 36,
                }}
              >
                {catalog.books
                  .filter((b) => b.shelf === shelf)
                  .map((book) => (
                    <Pressable
                      key={book.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${book.title}${book.available ? "" : ", Próximamente. No disponible"}`}
                      accessibilityState={{ disabled: !book.available }}
                      disabled={!book.available}
                      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                      onPress={() =>
                        book.available && hasBook(book.id)
                          ? router.push({
                              pathname: "/reader",
                              params: { book: book.id },
                            })
                          : setToast(true)
                      }
                    >
                      <View>
                        <Cover book={book} />
                      </View>
                      {!book.available && (
                        <View
                          style={{
                            position: "absolute",
                            bottom: 5,
                            left: 3,
                            right: 3,
                            paddingVertical: 3,
                            backgroundColor: "#29251F",
                            borderRadius: 6,
                          }}
                        >
                          <Label
                            style={{
                              color: "#fff",
                              fontSize: 9,
                              textAlign: "center",
                            }}
                          >
                            Próximamente
                          </Label>
                        </View>
                      )}
                      {book.available && progress[book.id] && (
                        <View
                          style={{
                            position: "absolute",
                            bottom: 4,
                            left: -2,
                            backgroundColor: "#8A3F36",
                            padding: 3,
                            borderRadius: 10,
                          }}
                        >
                          <Label style={{ fontSize: 8, color: "#fff" }}>
                            {es.page} {progress[book.id].page} · Seguir
                          </Label>
                        </View>
                      )}
                    </Pressable>
                  ))}
              </ScrollView>
            </LinearGradient>
            <LinearGradient
              colors={p.dark ? ["#A37A43", "#85602E", "#533619"] : ["#F5D28A", "#DDA04D", "#AC6C2C"]}
              style={{
                height: 30,
                borderTopWidth: 1,
                borderTopColor: p.dark ? "#BE9456" : "#FFE5AD",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 5 },
              }}
            >
              <View style={{ alignSelf: "center", backgroundColor: p.dark ? "#C6B28C" : "#FFF1CE", borderRadius: 7, paddingHorizontal: 14, paddingVertical: 3, borderWidth: 1, borderColor: "#B58345", marginTop: 3 }}>
                <Label style={{ color: "#51351D", fontSize: 13, lineHeight: 17, fontWeight: "600" }}>{es.shelves[si]}</Label>
              </View>
            </LinearGradient>
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
