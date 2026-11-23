import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

// Original procedural pine grain; fixed paths keep shelf rendering inexpensive.
const grain = Array.from({ length: 110 }, (_, i) => {
  const x = i * 4 + Math.sin(i * 3) * 2;
  const bend = Math.sin(i * 1.7) * 3;
  return `M ${x} 0 C ${x + bend} 40 ${x - bend} 65 ${x} 95 S ${x + bend} 150 ${x - 1} 190`;
});

export function WoodGrain() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 414 190" preserveAspectRatio="none">
      {grain.map((d, i) => (
        <Path key={i} d={d} fill="none" stroke={i % 3 ? "#6B3D17" : "#FFE3A7"} strokeWidth={i % 4 ? 0.4 : 0.8} opacity={i % 3 ? 0.13 : 0.2} />
      ))}
    </Svg>
  );
}

export const woodPanel = (dark: boolean) =>
  (dark
    ? ["#69421F", "#80552B", "#614020"]
    : ["#C68A43", "#DEA452", "#BD7C36"]) as [string, string, string];

export const woodInk = (dark: boolean) => (dark ? "#FBE9C8" : "#3B2412");

// Full-bleed wood: fills its parent (used behind the whole library screen and its header).
export function WoodBackground({ dark }: { dark: boolean }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={woodPanel(dark)} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
        <WoodGrain />
      </View>
    </View>
  );
}
