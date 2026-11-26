import React from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
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
      <Label style={{ color: p.muted, marginTop: 20, fontSize: 14 }}>
        {es.version}
      </Label>
      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL("https://github.com/OguzhanKodal/rnk-espanol")}
        hitSlop={8}
        style={({ pressed }) => ({
          alignSelf: "flex-start",
          minHeight: 44,
          justifyContent: "center",
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Label style={{ color: p.accent, fontSize: 15, fontWeight: "600" }}>
          {es.openSource}
        </Label>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL("https://ar.wikisource.org/?oldid=496858")}
        style={{ marginTop: 24 }}
      >
        <Label style={{ color: p.muted, fontSize: 13 }}>{es.yawshanCredit}</Label>
      </Pressable>
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
