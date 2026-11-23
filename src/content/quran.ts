// Verified Tanzil Uthmani text, built by scripts-ui/build-quran.mjs. Do not edit the JSON.
export type QuranData = {
  source: string;
  license: string;
  bismillah: string;
  bismillahVariants: Record<string, string>;
  /** [arabic name, transliteration, verse count, M(ecan)/D (medinan), first page] */
  suras: [string, string, number, "M" | "D", number][];
  /** first [sura, verse] of each of the 604 pages / 30 juz */
  pages: [number, number][];
  juz: [number, number][];
  verses: string[][];
};
export const QURAN_ID = "el-coran";
export const PAGE_COUNT = 604;
let cache: QuranData | undefined;
export const loadQuran = () =>
  (cache ??= require("../../assets/quran/quran.json") as QuranData);

export const arabicDigits = (n: number) =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

export type PageGroup = {
  sura: number;
  startsSura: boolean;
  verses: { n: number; text: string }[];
};
export function pageContent(q: QuranData, page: number): PageGroup[] {
  let [s, a] = q.pages[page - 1];
  const [es, ea] = page < PAGE_COUNT ? q.pages[page] : [115, 1];
  const groups: PageGroup[] = [];
  while (s < es || (s === es && a < ea)) {
    let g = groups[groups.length - 1];
    if (!g || g.sura !== s) {
      g = { sura: s, startsSura: a === 1, verses: [] };
      groups.push(g);
    }
    g.verses.push({ n: a, text: q.verses[s - 1][a - 1] });
    if (a < q.suras[s - 1][2]) a++;
    else {
      s++;
      a = 1;
    }
  }
  return groups;
}
export function juzOfPage(q: QuranData, page: number) {
  const [s, a] = q.pages[page - 1];
  let j = 0;
  while (
    j + 1 < q.juz.length &&
    (q.juz[j + 1][0] < s || (q.juz[j + 1][0] === s && q.juz[j + 1][1] <= a))
  )
    j++;
  return j + 1;
}
export function pageOf(q: QuranData, sura: number, verse: number) {
  let p = 0;
  while (
    p + 1 < q.pages.length &&
    (q.pages[p + 1][0] < sura ||
      (q.pages[p + 1][0] === sura && q.pages[p + 1][1] <= verse))
  )
    p++;
  return p + 1;
}
