import React from "react";
import { View, Pressable } from "react-native";
import { Label } from "./common";
import { usePalette } from "./store";
export function Segments({
  values,
  selected,
  onChange,
}: {
  values: readonly string[];
  selected: number;
  onChange: (i: number) => void;
}) {
  const p = usePalette();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        backgroundColor: p.line,
        padding: 3,
        borderRadius: 12,
      }}
    >
      {values.map((value, i) => (
        <Pressable
          key={value}
          accessibilityRole="tab"
          accessibilityState={{ selected: i === selected }}
          onPress={() => onChange(i)}
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: "center",
            borderRadius: 9,
            backgroundColor: i === selected ? p.paper : "transparent",
          }}
        >
          <Label
            style={{ fontSize: 13, fontWeight: i === selected ? "600" : "400" }}
          >
            {value}
          </Label>
        </Pressable>
      ))}
    </View>
  );
}
