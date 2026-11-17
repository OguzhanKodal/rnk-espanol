import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useMemo,
  memo,
} from "react";
import { View, Text, PanResponder, TextStyle } from "react-native";
import { usePalette } from "./store";
import { es } from "../i18n/es";
export { wordBounds } from "./selection-range";
export type WordPiece = {
  text: string;
  start: number;
  end: number;
  style: TextStyle;
  glossary?: unknown;
};
type Rect = { x: number; y: number; width: number; height: number };

// Visible text NEVER changes structure or metrics when selection changes. Native
// prefix layout is measured in an invisible, absolute sibling only while active.
export function WordSelection({
  pieces,
  start,
  end,
  fontSize,
  font,
  color,
  onMove,
  onDrag,
  onWord,
  onSelect,
  onGlossary,
  testMove,
}: {
  pieces: WordPiece[];
  start?: number;
  end?: number;
  fontSize: number;
  font: string;
  color: string;
  onMove: (edge: "start" | "end", start: number, end: number) => void;
  onDrag: (active: boolean) => void;
  onWord: (start: number, end: number) => void;
  onSelect: (start: number, end: number) => void;
  onGlossary: (index: number) => void;
  testMove?: boolean;
}) {
  const p = usePalette();
  const container = useRef<React.ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const [measured, setMeasured] = useState<Record<number, Rect>>({});
  const moved = useRef(false);
  const latest = useRef({ pieces, onMove, onDrag, measured });
  useLayoutEffect(() => {
    latest.current = { pieces, onMove, onDrag, measured };
  });
  const active = start !== undefined && end !== undefined;
  const base = useMemo<TextStyle>(
    () => ({
      fontSize,
      fontFamily: font,
      color,
      lineHeight: fontSize * 1.85,
      textAlign: "left",
    }),
    [fontSize, font, color],
  );
  const hit = (edge: "start" | "end", x: number, y: number) => {
    let best = -1,
      distance = Infinity;
    Object.entries(latest.current.measured).forEach(([index, rect]) => {
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
  /* eslint-disable react-hooks/refs -- PanResponder registers touch callbacks, never render-time calls. */
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
  useEffect(() => {
    if (
      !active ||
      !testMove ||
      moved.current ||
      !measured[Math.min(8, pieces.length - 1)]
    )
      return;
    const timer = setTimeout(() => {
      moved.current = true;
      const target = measured[Math.min(8, pieces.length - 1)];
      latest.current.onDrag(true);
      hit("end", target.x + target.width / 2, target.y + target.height / 2);
      latest.current.onDrag(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [active, testMove, measured, pieces.length]);
  const first = pieces.findIndex(
    (t) => t.end > (start ?? 0) && /\S/u.test(t.text),
  );
  const last = pieces.findLastIndex(
    (t) => t.start < (end ?? 0) && /\S/u.test(t.text),
  );
  return (
    <View ref={container}>
      <Text
        style={base}
        android_hyphenationFrequency="none"
        lineBreakStrategyIOS="none"
      >
        {pieces.map((piece, i) => (
          <Text
            key={i}
            accessibilityRole={piece.glossary ? "link" : undefined}
            accessibilityHint={
              piece.glossary ? "Toca para consultar el glosario" : undefined
            }
            suppressHighlighting
            onLongPress={() => onSelect(piece.start, piece.end)}
            onPress={() =>
              piece.glossary ? onGlossary(i) : onWord(piece.start, piece.end)
            }
            style={[
              piece.style,
              {
                color:
                  active && piece.start < end && piece.end > start
                    ? piece.style.writingDirection === "rtl"
                      ? p.selectionArabic
                      : p.selectionText
                    : piece.style.color,
                backgroundColor:
                  active && piece.start < end && piece.end > start
                    ? p.selection
                    : piece.style.backgroundColor,
              },
            ]}
          >
            {piece.text}
          </Text>
        ))}
      </Text>
      {active && (
        <WordMeasurements pieces={pieces} base={base} onMeasure={setMeasured} />
      )}
      {active &&
        ([first, last] as const).map((index, edge) => {
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

// Geometry work is memoized separately: moving a handle only repaints backgrounds
// and overlays, without recreating the (potentially long) native prefix copies.
const WordMeasurements = memo(function WordMeasurements({
  pieces,
  base,
  onMeasure,
}: {
  pieces: WordPiece[];
  base: TextStyle;
  onMeasure: React.Dispatch<React.SetStateAction<Record<number, Rect>>>;
}) {
  const widths = useRef<Record<number, number>>({});
  const ends = useRef<Record<number, Rect>>({});
  const record = (i: number) => {
    const finish = ends.current[i],
      width = widths.current[i];
    if (!finish || width === undefined) return;
    const rect = { ...finish, x: finish.x + finish.width - width, width };
    onMeasure((old) =>
      JSON.stringify(old[i]) === JSON.stringify(rect)
        ? old
        : { ...old, [i]: rect },
    );
  };
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", top: 0, left: 0, right: 0, opacity: 0 }}
    >
      {pieces.map((piece, i) =>
        !/\S/u.test(piece.text) ? null : (
          <React.Fragment key={i}>
            <Text
              android_hyphenationFrequency="none"
              lineBreakStrategyIOS="none"
              style={[
                base,
                { position: "absolute", top: 0, left: 0, right: 0 },
              ]}
              onTextLayout={(e) => {
                const line = e.nativeEvent.lines.at(-1);
                if (line) {
                  ends.current[i] = line;
                  record(i);
                }
              }}
            >
              {pieces.slice(0, i + 1).map((t, j) => (
                <Text key={j} style={t.style}>
                  {j === i ? t.text.trimEnd() : t.text}
                </Text>
              ))}
            </Text>
            <Text
              style={[
                base,
                piece.style,
                { position: "absolute", top: 0, left: 0, width: 10000 },
              ]}
              onTextLayout={(e) => {
                widths.current[i] = e.nativeEvent.lines[0]?.width ?? 0;
                record(i);
              }}
            >
              {piece.text.trim()}
            </Text>
          </React.Fragment>
        ),
      )}
    </View>
  );
});
