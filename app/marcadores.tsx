import React, { useState } from "react";
import { View, FlatList, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { usePalette, useStore, Mark } from "../src/ui/store";
import { Label, Button, styles } from "../src/ui/common";
import { getBook } from "../src/content/load";
import { es } from "../src/i18n/es";
export default function Marks() {
  const p = usePalette(),
    { marks, deleteMark } = useStore(),
    [tab, setTab] = useState(0);
  const kinds: Mark["kind"][] = ["bookmark", "highlight", "note"];
  return (
    <View style={{ flex: 1, backgroundColor: p.bg, padding: 18 }}>
      <View
        style={[
          styles.row,
          { marginBottom: 24, justifyContent: "space-between" },
        ]}
      >
        {[es.marks, es.highlights, es.notes].map((t, i) => (
          <Button
            key={t}
            title={t}
            active={tab === i}
            onPress={() => setTab(i)}
          />
        ))}
      </View>
      <FlatList
        data={marks.filter((m) => m.kind === kinds[tab]).reverse()}
        keyExtractor={(m) => m.id}
        ListEmptyComponent={
          <View style={{ padding: 24, paddingTop: 90, alignItems: "center" }}>
            <Label style={{ fontSize: 44, color: p.accent }}>◇</Label>
            <Label
              style={{
                fontSize: 22,
                fontFamily: "EBGaramond_400Regular",
                marginTop: 20,
              }}
            >
              {es.empty}
            </Label>
            <Label
              style={{
                fontSize: 14,
                color: p.muted,
                textAlign: "center",
                marginTop: 10,
              }}
            >
              {es.emptyHint}
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
            <Label
              style={{ fontSize: 20, fontFamily: "EBGaramond_400Regular" }}
            >
              {item.note ?? item.text}
            </Label>
            <Label style={{ color: p.muted, fontSize: 12, marginTop: 12 }}>
              {getBook(item.bookId).title} · {es.page} {item.page}
            </Label>
          </Pressable>
        )}
      />
      <Label
        style={{
          fontSize: 11,
          color: p.muted,
          textAlign: "center",
          marginTop: 15,
        }}
      >
        {es.deleteHint}
      </Label>
    </View>
  );
}
