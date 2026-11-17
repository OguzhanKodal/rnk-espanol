import { bookLoaders, catalogData, glossaryData, frasesData } from "./registry";
import { Book, Catalog } from "./types";
export type GlossaryEntry = {
  term: string;
  variants: string[];
  definition: string;
  verified: boolean;
};
export type Quote = {
  text: string;
  section: string;
  page: number;
  bookId?: string;
};
export const catalog = catalogData as Catalog;
export const glossary = (
  Array.isArray(glossaryData) ? glossaryData : (glossaryData.entries ?? [])
) as GlossaryEntry[];
export const frases = (
  Array.isArray(frasesData) ? frasesData : (frasesData.frases ?? [])
) as Quote[];
export const getBook = (id: string): Book =>
  (Object.hasOwn(bookLoaders, id)
    ? bookLoaders[id]()
    : bookLoaders.muestra()) as Book;
export const hasBook = (id: string) => Object.hasOwn(bookLoaders, id);
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
export function glossaryRanges(
  text: string,
  entries: GlossaryEntry[] = glossary,
) {
  const normalized = normalize(text),
    ranges: { start: number; end: number; entry: GlossaryEntry }[] = [];
  const terms = entries
    .flatMap((entry) =>
      [entry.term, ...entry.variants].map((term) => ({
        term: normalize(term),
        entry,
      })),
    )
    .sort((a, b) => b.term.length - a.term.length);
  for (const { term, entry } of terms) {
    let pos = 0;
    while (term && (pos = normalized.indexOf(term, pos)) >= 0) {
      const end = pos + term.length;
      if (
        !/[\p{L}\p{N}]/u.test(normalized[pos - 1] ?? " ") &&
        !/[\p{L}\p{N}]/u.test(normalized[end] ?? " ") &&
        !ranges.some((r) => pos < r.end && end > r.start)
      )
        ranges.push({ start: pos, end, entry });
      pos = end;
    }
  }
  return ranges.sort((a, b) => a.start - b.start);
}
