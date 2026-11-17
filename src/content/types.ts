export type Catalog = { books: CatalogBook[] };
export type CatalogBook = { id: string; title: string; shelf: 'coran' | 'coleccion' | 'breves'; available: boolean; coverColor?: string };
export type Book = { id: string; title: string; author: string; credits: string[]; sections: Section[] };
export type Section = { id: string; title: string; blocks: Block[] };
export type Block =
  | { id: string; type: 'heading'; level: 1 | 2 | 3; text: string; page: number }
  | { id: string; type: 'paragraph'; spans: Span[]; page: number }
  | { id: string; type: 'arabic'; text: string; page: number; unresolved?: true }
  | { id: string; type: 'note'; spans: Span[]; page: number }
  | { id: string; type: 'pageBreak'; page: number };
export type Span =
  | { t: 'text'; text: string }
  | { t: 'arabic'; text: string; unresolved?: true }
  | { t: 'bold'; text: string }
  | { t: 'italic'; text: string };
