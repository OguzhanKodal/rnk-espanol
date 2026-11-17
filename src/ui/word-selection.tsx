import React, { useRef, useState, useLayoutEffect } from "react";
import { View, Text, PanResponder } from "react-native";
import { es } from "../i18n/es";
import { wordBounds } from "./selection-range";
export type WordPiece = {
  text: string;
  start: number;
  end: number;
  style: object;
};
type Rect = { x: number; y: number; width: number; height: number };
export { wordBounds };
export function WordSelection({
  pieces,
  start,
  end,
  onMove,
  onDrag,
  onWord,
  fontSize,
  testMove,
}: {
  pieces: WordPiece[];
  start: number;
  end: number;
  fontSize: number;
  onMove: (edge: "start" | "end", start: number, end: number) => void;
  onDrag: (active: boolean) => void;
  onWord: (start: number, end: number) => void;
  testMove?: boolean;
}) {
  const container = useRef<React.ComponentRef<typeof View>>(null),
    rects = useRef<Record<number, Rect>>({}),
    origin = useRef({ x: 0, y: 0 });
  const [measured, setMeasured] = useState<Record<number, Rect>>({});
  const moved = useRef(false);
  const latest = useRef({ pieces, start, end, onMove, onDrag });
  useLayoutEffect(() => {
    latest.current = { pieces, start, end, onMove, onDrag };
  });
  const hit = (edge: "start" | "end", x: number, y: number) => {
    let best = 0,
      distance = Infinity;
    Object.entries(rects.current).forEach(([index, rect]) => {
      const dx = Math.max(rect.x - x, 0, x - rect.x - rect.width);
      const dy = Math.max(rect.y - y, 0, y - rect.y - rect.height);
      const d = dx * dx + dy * dy * 9;
      if (d < distance) {
        distance = d;
        best = Number(index);
      }
    });
    const word = latest.current.pieces[best];
    if (word) latest.current.onMove(edge, word.start, word.end);
  };
  /* eslint-disable react-hooks/refs -- PanResponder registers these callbacks; they run only on touch events. */
  const [responders] = useState(() =>
    (["start", "end"] as const).map((edge) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          latest.current.onDrag(true);
          container.current?.measureInWindow((x, y) => {
            origin.current = { x, y };
          });
        },
        onPanResponderMove: (_, g) =>
          hit(edge, g.moveX - origin.current.x, g.moveY - origin.current.y),
        onPanResponderRelease: () => latest.current.onDrag(false),
        onPanResponderTerminate: () => latest.current.onDrag(false),
        onPanResponderTerminationRequest: () => false,
      }),
    ),
  );
  /* eslint-enable react-hooks/refs */
  const first = pieces.findIndex((t) => t.end > start),
    last = pieces.findLastIndex((t) => t.start < end);
  return (
    <View
      ref={container}
      style={{ flexDirection: "row", flexWrap: "wrap", paddingBottom: 24 }}
    >
      {pieces.map((piece, i) => (
        <Text
          key={i}
          suppressHighlighting
          onPress={() => onWord(piece.start, piece.end)}
          onLayout={(e) => {
            rects.current[i] = e.nativeEvent.layout;
            if (Object.keys(rects.current).length === pieces.length) {
              setMeasured({ ...rects.current });
              if (testMove && !moved.current) {
                moved.current = true;
                const target = rects.current[Math.min(8, pieces.length - 1)];
                if (target)
                  setTimeout(() => {
                    latest.current.onDrag(true);
                    hit(
                      "end",
                      target.x + target.width / 2,
                      target.y + target.height / 2,
                    );
                    latest.current.onDrag(false);
                  }, 500);
              }
            }
          }}
          style={[
            piece.style,
            {
              lineHeight: fontSize * 1.85,
              ...(piece.start < end && piece.end > start
                ? { backgroundColor: "#A9C8E9", color: "#302920" }
                : {}),
            },
          ]}
        >
          {piece.text}
        </Text>
      ))}
      {([first, last] as const).map((index, edge) => {
        const rect = measured[index];
        if (!rect) return null;
        return (
          <View
            key={edge}
            {...responders[edge].panHandlers}
            accessibilityLabel={edge ? es.selectionEnd : es.selectionStart}
            style={{
              position: "absolute",
              left: rect.x + (edge ? rect.width : 0) - 22,
              top: rect.y + rect.height - 16,
              width: 44,
              height: 44,
              zIndex: 10,
              alignItems: "center",
            }}
          >
            <View
              style={{ width: 2, height: 16, backgroundColor: "#366BA6" }}
            />
            <View
              style={{
                width: 13,
                height: 13,
                borderRadius: 7,
                backgroundColor: "#366BA6",
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
