import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, View, Pressable, Image } from "react-native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { catalog, hasBook, getBook } from "../src/content/load";
import { Book, CatalogBook } from "../src/content/types";
import { Label } from "../src/ui/common";
import { usePalette, useProgress, useStore } from "../src/ui/store";
import { PrayerCard } from "../src/ui/prayer";
import { WoodBackground, WoodGrain, woodPanel } from "../src/ui/wood-grain";
import { es } from "../src/i18n/es";
import { QURAN_ID } from "../src/content/quran";
const coverArt = {
  green: require("../assets/covers/coran.jpg"),
  ochre: require("../assets/covers/meal.jpg"),
  red: require("../assets/covers/coleccion.jpg"),
  small: require("../assets/covers/breves.jpg"),
};
type CoverLook = keyof typeof coverArt;
const coverLook = (book: CatalogBook): CoverLook =>
  book.shelf === "breves"
    ? "small"
    : book.id === "el-coran"
    ? "green"
    : book.id === "el-coran-significado"
    ? "ochre"
    : "red";
const coverBase: Record<CoverLook, string> = {
  green: "#0D3B29",
  ochre: "#6E4F0E",
  red: "#6E1220",
  small: "#7A1C2E",
};
// Large covers are 88x132; small books are 10% smaller.
const LARGE = { w: 88, h: 132 };
const gold = "#EBCB86";
const shelves = (["coran", "coleccion", "breves"] as const).map((shelf) => ({
  shelf,
  books: catalog.books.filter((b) => b.shelf === shelf),
}));
// Page count and section lookup scan the whole book; cache per book/block.
const lastPage = new Map<string, number>();
function resumeInfo(content: Book, blockId: string) {
  let pages = lastPage.get(content.id);
  if (pages === undefined) {
    pages =
      content.kind === "pages"
        ? content.pages.length
        : content.sections.reduce(
            (max, s) => s.blocks.reduce((m, b) => Math.max(m, b.page), max),
            1,
          );
    lastPage.set(content.id, pages);
  }
  const section = content.sections.find((s) =>
    s.blocks.some((b) => b.id === blockId),
  );
  return { pages, section };
}
const engraved = {
  textShadowColor: "#2a0608",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 1.5,
};
const Cover = memo(function Cover({ book }: { book: CatalogBook }) {
  const look = coverLook(book);
  const small = look === "small";
  const k = small ? 0.9 : 1;
  const w = Math.round(LARGE.w * k),
    h = Math.round(LARGE.h * k);
  const long = book.title.length;
  const collection = book.shelf !== "coran";
  // Shrink the title until its longest word fits on one line inside the frame
  // (Playfair Bold averages ~0.55em per glyph); never break a word.
  const padX = small ? 11 : 15;
  const longestWord = Math.max(...book.title.split(/\s+/).map((t) => t.length));
  const baseSize = long > 25 ? 10 : long > 14 ? 12 : 14;
  const titleSize = Math.min(baseSize * k, (w - 2 * padX) / (longestWord * 0.55));
  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: small ? 3 : 4,
        backgroundColor: coverBase[look],
        shadowColor: "#160d06",
        shadowOffset: { width: 4, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 6,
        elevation: 6,
      }}
    >
      <Image
        source={coverArt[look]}
        resizeMode="stretch"
        style={{
          position: "absolute",
          width: w,
          height: h,
          borderRadius: small ? 3 : 4,
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
          width: Math.round(16 * k),
        }}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: padX,
        }}
      >
        {collection && (
          <Label
            style={{
              fontFamily: "EBGaramond_600SemiBold",
              fontSize: 5.5 * k,
              color: gold,
              textAlign: "center",
              ...engraved,
            }}
          >
            {es.fromCollection}
          </Label>
        )}
        <Label
          numberOfLines={5}
          style={{
            fontFamily: "PlayfairDisplay_700Bold",
            fontSize: titleSize,
            lineHeight: Math.round(titleSize * 1.2 * 10) / 10,
            color: gold,
            textAlign: "center",
            marginVertical: 5 * k,
            ...engraved,
          }}
        >
          {book.title}
        </Label>
        {collection && (
          <Label
            style={{
              fontFamily: "EBGaramond_700Bold",
              fontSize: 6.5 * k,
              lineHeight: 7.5 * k,
              color: gold,
              textAlign: "center",
              ...engraved,
            }}
          >
            {"Bediüzzaman\nSaid Nursî"}
          </Label>
        )}
      </View>
    </View>
  );
});
export default function Home() {
  const p = usePalette(),
    { update, flushProgress } = useStore(),
    progress = useProgress(),
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
  // Show the position the reader just left without waiting for the batch.
  useFocusEffect(useCallback(() => flushProgress(), [flushProgress]));
  const resumeBook = catalog.books.find(
    (b) => b.available && progress[b.id] && hasBook(b.id),
  );
  const saved = resumeBook ? progress[resumeBook.id] : undefined;
  const { pages, section } = useMemo(
    () =>
      resumeBook && saved
        ? resumeInfo(getBook(resumeBook.id), saved.blockId)
        : { pages: 1, section: undefined },
    [resumeBook, saved],
  );
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
            {section && (
              <Label style={{ marginTop: 6, color: p.muted }}>
                {section.title}
              </Label>
            )}
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
        {shelves.map(({ shelf, books }, si) => (
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
                {books.map((book) => (
                    <Pressable
                      key={book.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${book.title}${book.available ? "" : ", Próximamente. No disponible"}`}
                      accessibilityState={{ disabled: !book.available }}
                      disabled={!book.available}
                      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                      onPress={() =>
                        book.id === QURAN_ID
                          ? router.push("/coran")
                          : book.available && hasBook(book.id)
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
