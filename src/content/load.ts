import { bookImages, bookLoaders, catalogData, frasesData } from "./registry";
import { Book, Catalog } from "./types";
export type Quote = {
  text: string;
  section: string;
  page: number;
  bookId?: string;
};
export const catalog = catalogData as Catalog;
export const frases = (
  Array.isArray(frasesData) ? frasesData : (frasesData.frases ?? [])
) as Quote[];
export const getBook = (id: string): Book =>
  (Object.hasOwn(bookLoaders, id)
    ? bookLoaders[id]()
    : bookLoaders.muestra()) as Book;
export const bookImage = (bookId: string, name: string): number | undefined =>
  bookImages[bookId]?.[name];
export const hasBook = (id: string) => Object.hasOwn(bookLoaders, id);
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
