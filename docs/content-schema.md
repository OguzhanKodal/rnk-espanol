# Book content schema (contract between converter and app)

Each book is one JSON file: `assets/books/<bookId>.json`. Catalog: `assets/books/catalog.json`.

```ts
// src/content/types.ts mirrors this exactly
type Catalog = {
  books: CatalogBook[];
};
type CatalogBook = {
  id: string;                 // "ramadan-frugalidad-agradecimiento"
  title: string;              // "Ramadán, Frugalidad y Agradecimiento"
  shelf: "coran" | "coleccion" | "breves";
  available: boolean;         // false → "Próximamente"
  coverColor?: string;        // hex, optional
};

type BookMetadata = {
  id: string;
  title: string;
  author: string;             // empty when the source edition gives no author
  credits: string[];          // translator / publisher lines from the copyright page, verbatim
};
type Book = BookMetadata & (
  | { kind?: undefined; sections: Section[] }
  | { kind: "pages"; sections: []; pages: PageImage[] }
);
type PageImage = {
  id: string;                 // "page-1", "page-2", ...
  image: string;              // filename under assets/books/<bookId>/
  imageSize: [number, number]; // width, height in pixels
};

type Section = {
  id: string;                 // "s1", "s2", ...
  title: string;              // real heading text, e.g. "Sobre el Mes de Ramadán"
  blocks: Block[];
};

type Block =
  | { id: string; type: "heading"; level: 1 | 2 | 3; text: string; page: number }
  | { id: string; type: "paragraph"; spans: Span[]; page: number }
  | { id: string; type: "arabic"; text: string; page: number; unresolved?: true; image?: string; imageSize?: [number, number] } // standalone, centered, red, RTL
  | { id: string; type: "note"; spans: Span[]; page: number }                      // bracketed intro notes, italic
  | { id: string; type: "pageBreak"; page: number };                                // emitted where a printed page starts

type Span =
  | { t: "text"; text: string }
  | { t: "arabic"; text: string; unresolved?: true; image?: string; imageSize?: [number, number] } // inline Arabic inside a sentence, red
  | { t: "bold"; text: string }
  | { t: "italic"; text: string };
```

Rules
- Block ids are stable across reruns of the converter (`<sectionId>-b<index>`), because highlights/notes are anchored to `blockId + start/end character offset` over the concatenated span text of that block.
- `page` is the source page where the block starts. The first book uses printed folios. A Word manuscript uses the one-based page position in its Microsoft Word PDF export.
- `unresolved: true` arabic has `text: ""` and the app shows a small grey "[árabe]" marker.
- An unresolved Arabic block or span may carry `image` and `imageSize: [width, height]`. Transparent PNG blocks are tinted with the Arabic color. JPEG blocks retain their original colors and paper. Inline spans remain untinted and fit within one line. The registry bundles PNG and JPEG assets under `assets/books/<bookId>/`.
- A page book preserves the source image order and color. The reader displays the images in a virtualized vertical list, starting at screen width. Pinch zoom goes up to 3× and a horizontal drag reveals the rest of a zoomed page. Progress is saved as `{ blockId: "page-N", page: N }`. Links can pass that ID in the reader's `block` parameter.
- The Quran meaning book uses the printed folio. Bracketed numbers mark print superscripts and note blocks follow their source verse or heading. A verse carried onto a second folio keeps its starting folio. Its footnote keeps the folio where the reference and note were printed.

Interaction: tap opens no word popup. Long-press selects UTF-16 text ranges for annotation, copy and share. Only catalog, requested books and quotes are bundled; no dictionary dataset is required.
