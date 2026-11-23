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

type Book = {
  id: string;
  title: string;
  author: string;             // "Bediüzzaman Said Nursî"
  credits: string[];          // translator / publisher lines from the copyright page, verbatim
  sections: Section[];
};

type Section = {
  id: string;                 // "s1", "s2", ...
  title: string;              // real heading text, e.g. "Sobre el Mes de Ramadán"
  blocks: Block[];
};

type Block =
  | { id: string; type: "heading"; level: 1 | 2 | 3; text: string; page: number }
  | { id: string; type: "paragraph"; spans: Span[]; page: number }
  | { id: string; type: "arabic"; text: string; page: number; unresolved?: true }   // standalone, centered, red, RTL
  | { id: string; type: "note"; spans: Span[]; page: number }                      // bracketed intro notes, italic
  | { id: string; type: "pageBreak"; page: number };                                // emitted where a printed page starts

type Span =
  | { t: "text"; text: string }
  | { t: "arabic"; text: string; unresolved?: true }   // inline Arabic inside a sentence, red
  | { t: "bold"; text: string }
  | { t: "italic"; text: string };
```

Rules
- Block ids are stable across reruns of the converter (`<sectionId>-b<index>`), because highlights/notes are anchored to `blockId + start/end character offset` over the concatenated span text of that block.
- `page` is the source page where the block starts. The first book uses printed folios. A Word manuscript uses the one-based page position in its Microsoft Word PDF export.
- `unresolved: true` arabic has `text: ""` and the app shows a small grey "[árabe]" marker.
- An unresolved arabic block or span may carry `image` (a PNG copied from the manuscript into `assets/books/<bookId>/`) and `imageSize: [width, height]` in pixels. The reader then shows that original image instead of the marker: blocks tinted with the Arabic colour, inline spans untinted and capped at one line height. `scripts-ui/gen-registry.mjs` exposes these files as `bookImages`.

Interaction: tap opens no word popup. Long-press selects UTF-16 text ranges for annotation, copy and share. Only catalog, requested books and quotes are bundled; no dictionary dataset is required.
