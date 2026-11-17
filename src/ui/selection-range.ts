// JS string indices are UTF-16. end is exclusive and always includes the last glyph.
export function wordBounds(text: string, start: number, end: number) {
  const words = [...text.matchAll(/\S+/gu)];
  const first =
    words.find((w) => w.index! + w[0].length > start) ?? words.at(-1);
  const last = [...words].reverse().find((w) => w.index! < end) ?? first;
  return {
    start: first?.index ?? 0,
    end: last ? last.index! + last[0].length : text.length,
  };
}
