// Builds assets/quran/quran.json from the verbatim Tanzil sources in data-src/quran.
// The Tanzil text may not be changed: every verse is stored byte-for-byte, except that
// the bismillah Tanzil prefixes to verse 1 is stored separately so it can be shown as
// a header. The script proves the split is lossless before writing.
import fs from "node:fs";
import vm from "node:vm";

const src = new URL("../data-src/quran/", import.meta.url);
const raw = fs.readFileSync(new URL("tanzil-uthmani.txt", src), "utf8");
const license = raw
  .split("\n")
  .filter((l) => l.startsWith("#"))
  .map((l) => l.replace(/^#\s?/, ""))
  .join("\n")
  .trim();
const ctx = {};
vm.runInNewContext(
  fs.readFileSync(new URL("quran-data.js", src), "utf8") + ";this.Q=QuranData;",
  ctx,
);
const Q = ctx.Q;

const text = new Map();
for (const line of raw.split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [s, a, ...rest] = line.split("|");
  text.set(`${s}:${a}`, rest.join("|"));
}
const fail = (m) => {
  throw new Error(`build-quran: ${m}`);
};
if (text.size !== 6236) fail(`expected 6236 verses, got ${text.size}`);

const bismillah = text.get("1:1");
const pages = Q.Page.slice(1, 605);
const juz = Q.Juz.slice(1, 31);
if (pages.length !== 604 || juz.length !== 30) fail("page/juz metadata size");
const pageOf = (s, a) => {
  let p = 0;
  while (p + 1 < pages.length) {
    const [ns, na] = pages[p + 1];
    if (ns > s || (ns === s && na > a)) break;
    p++;
  }
  return p + 1;
};

const suras = [];
const verses = [];
const headers = {};
for (let s = 1; s <= 114; s++) {
  const [, ayas, , , name, tname, , type] = Q.Sura[s];
  const list = [];
  for (let a = 1; a <= ayas; a++) {
    const t = text.get(`${s}:${a}`);
    if (t === undefined) fail(`missing ${s}:${a}`);
    list.push(t);
  }
  if (s !== 1 && s !== 9) {
    // Tanzil prefixes the bismillah to verse 1; 95 and 97 carry an extra shadda.
    const words = list[0].split(" ");
    const head = words.slice(0, 4).join(" ");
    const plain = head.replace(/ّ/g, "");
    if (plain !== bismillah.replace(/ّ/g, "")) fail(`no bismillah in ${s}:1`);
    list[0] = words.slice(4).join(" ");
    if (head + " " + list[0] !== text.get(`${s}:1`)) fail(`lossy split ${s}:1`);
    if (head !== bismillah) headers[s] = head;
  }
  suras.push([name, tname, ayas, type === "Meccan" ? "M" : "D", pageOf(s, 1)]);
  verses.push(list);
}

// Prove every verse can be rebuilt exactly.
let letters = 0;
for (let s = 1; s <= 114; s++)
  verses[s - 1].forEach((t, i) => {
    const full =
      i === 0 && s !== 1 && s !== 9
        ? `${headers[s] ?? bismillah} ${t}`
        : t;
    if (full !== text.get(`${s}:${i + 1}`)) fail(`mismatch ${s}:${i + 1}`);
    letters += [...full].length;
  });

const out = {
  source: "Tanzil Quran Text (Uthmani, Version 1.1) — https://tanzil.net",
  license,
  bismillah,
  bismillahVariants: headers,
  suras,
  pages,
  juz,
  verses,
};
fs.mkdirSync(new URL("../assets/quran/", import.meta.url), { recursive: true });
fs.writeFileSync(
  new URL("../assets/quran/quran.json", import.meta.url),
  JSON.stringify(out),
);
console.log(
  `quran.json: 114 suras, 6236 verses, 604 pages, ${letters} codepoints, ${Object.keys(headers).length} bismillah variants`,
);
