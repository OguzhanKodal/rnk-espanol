import React, { useMemo, useState } from "react";
import { View, TextInput, FlatList, Pressable } from "react-native";
import { glossary, GlossaryEntry, normalize } from "../src/content/load";
import { Label, Sheet, styles } from "../src/ui/common";
import { usePalette } from "../src/ui/store";
import { es } from "../src/i18n/es";
export default function Glossary() {
  const p = usePalette(),
    [query, setQuery] = useState(""),
    [entry, setEntry] = useState<GlossaryEntry>();
  const entries = useMemo(
    () =>
      glossary.filter((g) =>
        normalize(g.term + " " + g.variants.join(" ")).includes(
          normalize(query),
        ),
      ),
    [query],
  );
  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingHorizontal: 22 }}>
      <TextInput
        accessibilityLabel={es.search}
        placeholder={es.search}
        placeholderTextColor={p.muted}
        value={query}
        onChangeText={setQuery}
        style={{
          backgroundColor: p.paper,
          color: p.text,
          padding: 17,
          borderRadius: 14,
          marginVertical: 15,
          fontSize: 16,
        }}
      />
      <FlatList
        data={entries}
        keyExtractor={(x) => x.term}
        ListEmptyComponent={<Label>{es.noResults}</Label>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setEntry(item)}
            style={{
              paddingVertical: 20,
              borderBottomWidth: 1,
              borderColor: p.line,
            }}
          >
            <Label
              style={{ fontFamily: "EBGaramond_600SemiBold", fontSize: 24 }}
            >
              {item.term}
            </Label>
            <Label
              numberOfLines={2}
              style={{ color: p.muted, fontSize: 14, marginTop: 5 }}
            >
              {item.definition}
            </Label>
          </Pressable>
        )}
      />
      <Sheet
        title={entry?.term ?? es.definition}
        visible={!!entry}
        onClose={() => setEntry(undefined)}
      >
        <Label style={{ fontSize: 19 }}>{entry?.definition}</Label>
        {!entry?.verified && (
          <Label style={[styles.muted, { color: p.muted, marginTop: 20 }]}>
            {es.unverified}
          </Label>
        )}
      </Sheet>
    </View>
  );
}
