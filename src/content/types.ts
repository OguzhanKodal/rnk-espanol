export type Catalog = { books: CatalogBook[] };
export type CatalogBook = {
  id: string;
  title: string;
  shelf: "coran" | "coleccion" | "breves";
  available: boolean;
  coverColor?: string;
};
type BookMetadata = {
  id: string;
  title: string;
  author: string;
  credits: string[];
};
export type PageImage = {
  id: string;
  image: string;
  imageSize: [number, number];
};
export type PageBook = BookMetadata & {
  kind: "pages";
  sections: [];
  pages: PageImage[];
};
export type TextBook = BookMetadata & {
  kind?: undefined;
  sections: Section[];
};
export type Book = TextBook | PageBook;
export type Section = { id: string; title: string; blocks: Block[] };
export type Block =
  | {
      id: string;
      type: "heading";
      level: 1 | 2 | 3;
      text: string;
      page: number;
    }
  | { id: string; type: "paragraph"; spans: Span[]; page: number }
  | {
      id: string;
      type: "arabic";
      text: string;
      page: number;
      unresolved?: true;
      /** Manuscript PNG shown when the Arabic could not be recovered as text. */
      image?: string;
      imageSize?: [number, number];
    }
  | { id: string; type: "note"; spans: Span[]; page: number }
  | { id: string; type: "pageBreak"; page: number };
export type Span =
  | { t: "text"; text: string }
  | {
      t: "arabic";
      text: string;
      unresolved?: true;
      image?: string;
      imageSize?: [number, number];
    }
  | { t: "bold"; text: string }
  | { t: "italic"; text: string };
