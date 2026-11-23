import React from "react";
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
