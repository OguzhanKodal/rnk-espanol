import React from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { catalog, getBook, hasBook } from "../src/content/load";
import { usePalette } from "../src/ui/store";
import { Label, styles } from "../src/ui/common";
import { es } from "../src/i18n/es";
export default function About() {
  const p = usePalette();
  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={styles.pad}
    >
      <Label
        style={{
          fontSize: 43,
          fontWeight: "600",
          color: p.accent,
          marginTop: 20,
        }}
      >
        {es.brand}
      </Label>
      <Label style={{ fontSize: 18, color: p.muted, marginTop: 8 }}>
        {es.language}
      </Label>
      <Label style={{ fontSize: 17, marginTop: 30 }}>{es.aboutText}</Label>
      <Label style={{ color: p.muted, marginTop: 20, fontSize: 14 }}>
        {es.version}
      </Label>
      <View style={[styles.divider, { backgroundColor: p.line }]} />
      <Label style={styles.title}>{es.credits}</Label>
      {catalog.books
        .filter((b) => hasBook(b.id))
        .map((b) => (
          <View key={b.id} style={{ marginVertical: 15 }}>
            <Label style={{ fontSize: 22, fontWeight: "600" }}>{b.title}</Label>
            <Label style={{ color: p.muted, marginTop: 8 }}>
              {getBook(b.id).author}
            </Label>
            {getBook(b.id).credits.map((c, i) => (
              <Label key={i} style={{ fontSize: 14, marginTop: 8 }}>
                {c}
              </Label>
            ))}
          </View>
        ))}
      <View style={[styles.divider, { backgroundColor: p.line }]} />
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Powered by Nüve Dijital, abre nuvedigital.com"
        onPress={() => Linking.openURL("https://nuvedigital.com")}
        hitSlop={8}
        style={({ pressed }) => ({
          alignSelf: "center",
          minHeight: 44,
          justifyContent: "center",
          marginBottom: 24,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Label style={{ color: p.muted, fontSize: 14 }}>
          Powered by <Label style={{ color: p.accent, fontSize: 14, fontWeight: "600" }}>Nüve Dijital</Label>
        </Label>
      </Pressable>
    </ScrollView>
  );
}
