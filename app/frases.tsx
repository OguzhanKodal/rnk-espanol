import React from "react";
import { ScrollView, View, Pressable, Share } from "react-native";
import { router } from "expo-router";
import { catalog, frases, getBook } from "../src/content/load";
import { Label, Button, styles } from "../src/ui/common";
import { usePalette } from "../src/ui/store";
import { es } from "../src/i18n/es";
export default function Quotes() {
  const p = usePalette();
  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={styles.pad}
    >
      {frases.map((q, i) => (
        <View
          key={i}
          style={[
            styles.card,
            {
              backgroundColor: p.paper,
              borderWidth: 1,
              borderColor: p.line,
              padding: 25,
            },
          ]}
        >
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/reader",
                params: {
                  book:
                    q.bookId ??
                    catalog.books.find((b) => b.available)?.id ??
                    "muestra",
                  page: q.page,
                },
              })
            }
          >
            <Label
              style={{
                fontSize: 48,
                color: p.accent,
                fontFamily: "EBGaramond_400Regular",
              }}
            >
              “
            </Label>
            <Label
              style={{
                fontSize: 26,
                fontFamily: "EBGaramond_400Regular",
                marginTop: -15,
              }}
            >
              {q.text}
            </Label>
            <Label
              style={{
                fontSize: 12,
                color: p.muted,
                marginTop: 20,
                marginBottom: 18,
              }}
            >
              {getBook(
                q.bookId ??
                  catalog.books.find((b) => b.available)?.id ??
                  "muestra",
              ).sections.find((s) => s.id === q.section)?.title ??
                q.section}{" "}
              · {es.page} {q.page}
            </Label>
          </Pressable>
          <Button
            title={es.share}
            onPress={() =>
              void Share.share({
                message: `“${q.text}”\n${q.section} · ${es.page} ${q.page}\n${es.app}`,
              })
            }
          />
        </View>
      ))}
    </ScrollView>
  );
}
