import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { View, FlatList, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { usePalette, useStore, Mark } from "../src/ui/store";
import { Segments } from "../src/ui/segments";
import { Label, styles } from "../src/ui/common";
import { getBook } from "../src/content/load";
import { es } from "../src/i18n/es";
export default function Marks() {
  const p = usePalette(),
    { marks, deleteMark } = useStore(),
    [tab, setTab] = useState(0);
  const kinds: Mark["kind"][] = ["bookmark", "highlight", "note"];
  return (
    <View style={{ flex: 1, backgroundColor: p.bg, padding: 18 }}>
      <View style={{ marginBottom: 20 }}>
        <Segments
          values={[es.marks, es.highlights, es.notes]}
          selected={tab}
          onChange={setTab}
        />
      </View>
      <FlatList
        data={marks.filter((m) => m.kind === kinds[tab]).reverse()}
        keyExtractor={(m) => m.id}
        ListEmptyComponent={
          <View style={{ padding: 24, paddingTop: 90, alignItems: "center" }}>
            <Ionicons
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              name={
                (
                  [
                    "bookmark-outline",
                    "color-fill-outline",
                    "create-outline",
                  ] as const
                )[tab]
              }
              size={40}
              color={p.accent}
            />
            <Label
              style={{
                fontSize: 22,
                fontWeight: "400",
                marginTop: 20,
              }}
            >
              {
                [
                  "Tus páginas favoritas",
                  "Pasajes para recordar",
                  "Tus reflexiones",
                ][tab]
              }
            </Label>
            <Label
              style={{
                fontSize: 14,
                color: p.muted,
                textAlign: "center",
                marginTop: 10,
              }}
            >
              {
                [
                  "Guarda un marcador al seleccionar un pasaje del libro.",
                  "Selecciona un pasaje y toca Resaltar para conservarlo aquí.",
                  "Selecciona un pasaje y toca Nota para escribir una reflexión.",
                ][tab]
              }
            </Label>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/reader",
                params: { book: item.bookId, block: item.blockId },
              })
            }
            onLongPress={() =>
              Alert.alert(es.deletePrompt, "", [
                { text: es.cancel, style: "cancel" },
                {
                  text: es.remove,
                  style: "destructive",
                  onPress: () => deleteMark(item.id),
                },
              ])
            }
            style={[
              styles.card,
              {
                backgroundColor: p.paper,
                borderLeftWidth: 3,
                borderLeftColor: item.color || p.accent,
              },
            ]}
          >
            <Label style={{ fontSize: 17, fontWeight: "400" }}>
              {item.note ?? item.text}
            </Label>
            <Label style={{ color: p.muted, fontSize: 14, marginTop: 12 }}>
              {getBook(item.bookId).title} · {es.page} {item.page}
            </Label>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Eliminar elemento"
              onPress={() =>
                Alert.alert(es.deletePrompt, "", [
                  { text: es.cancel, style: "cancel" },
                  {
                    text: es.remove,
                    style: "destructive",
                    onPress: () => deleteMark(item.id),
                  },
                ])
              }
              style={{
                alignSelf: "flex-end",
                minWidth: 44,
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                name="trash-outline"
                size={22}
                color={p.muted}
              />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}
