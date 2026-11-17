import React, { useState } from "react";
import { ThemePicker } from "../src/ui/theme-picker";
import { ScrollView, View } from "react-native";
import { usePalette, useStore } from "../src/ui/store";

import { Label, Button, styles } from "../src/ui/common";
import { es } from "../src/i18n/es";
export default function Settings() {
  const p = usePalette(),
    { settings, update } = useStore();
  const [themes, setThemes] = useState(false);
  return (
    <ScrollView
      style={{ backgroundColor: p.bg }}
      contentContainerStyle={[
        styles.pad,
        { margin: 18, padding: 20, borderRadius: 22, backgroundColor: p.paper },
      ]}
    >
      <Label style={{ fontSize: 24, fontWeight: "600", marginBottom: 24 }}>
        {es.reading}
      </Label>
      <Label style={{ marginBottom: 14 }}>{es.theme}</Label>
      <Button
        title={es.themes[settings.theme]}
        onPress={() => setThemes(true)}
      />
      <ThemePicker visible={themes} onClose={() => setThemes(false)} />
      <View style={[styles.divider, { backgroundColor: p.line }]} />
      <Label style={{ marginBottom: 14 }}>{es.size}</Label>
      <View style={styles.row}>
        <Button
          title="A −"
          onPress={() =>
            update({ fontSize: Math.max(14, settings.fontSize - 1) })
          }
        />
        <Label style={{ fontSize: 24, minWidth: 50, textAlign: "center" }}>
          {settings.fontSize}
        </Label>
        <Button
          title="A +"
          onPress={() =>
            update({ fontSize: Math.min(34, settings.fontSize + 1) })
          }
        />
      </View>
      <Label style={{ fontSize: 14, color: p.muted, marginTop: 12 }}>
        {es.fontHint}
      </Label>
      <View style={[styles.divider, { backgroundColor: p.line }]} />
      <Label style={{ marginBottom: 14 }}>{es.font}</Label>
      <View style={{ gap: 10 }}>
        {es.fonts.map((t, i) => (
          <Button
            title={t}
            key={t}
            active={settings.font === i}
            onPress={() => update({ font: i })}
          />
        ))}
      </View>
      <View
        style={{
          marginTop: 30,
          padding: 24,
          borderWidth: 1,
          borderColor: p.line,
          borderRadius: 18,
        }}
      >
        <Label
          style={{
            fontFamily: settings.font
              ? "LibreBaskerville_400Regular"
              : "EBGaramond_400Regular",
            fontSize: settings.fontSize,
          }}
        >
          {es.free}
        </Label>
      </View>
    </ScrollView>
  );
}
