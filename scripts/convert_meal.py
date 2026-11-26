#!/usr/bin/env python3
"""Convert the source edition using its printed folios and typographic roles."""
import argparse
from dataclasses import dataclass, field
import hashlib
import json
from pathlib import Path
import re

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
PDF = Path.home() / "Desktop/kitaplar/kuranmeal.pdf"
SHA256 = "b3f9cf1594630792ce4cb6fe899a23fd270716ca4a968f809f8cc1f39edc106b"
BOOK_ID = "el-coran-significado"
TITLE = "El Corán – Significado en español"
NUMBER = re.compile(r"^(\d+)\.\s*")
FOLIO = re.compile(r"﴾\s*(\d+)\s*﴿")
REF = re.compile(r"\[(\d+)\]")
# These are printed compound/transliteration separators, even at a line end.
PRINTED_COMPOUNDS = {"al-ḥaqqah", "al-qari’ah", "al-jaṭṭab"}


def pinned_pdf(path, digest):
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != digest:
        raise ValueError(f"Unexpected SHA-256 for {path}: {actual}")
    return pymupdf.open(path)


def page_lines(page):
    lines = (
        line
        for block in page.get_text("dict", flags=pymupdf.TEXTFLAGS_TEXT)["blocks"]
        for line in block["lines"]
    )
    return sorted(lines, key=lambda line: (line["spans"][0]["origin"][1], line["bbox"][0]))


def json_bytes(book):
    return (json.dumps(book, ensure_ascii=False, indent=2) + "\n").encode()


def add_block(section, page, kind, **fields):
    block = {"id": f"{section['id']}-b{len(section['blocks']) + 1}",
             "type": kind, **fields, "page": page}
    section["blocks"].append(block)
    return block


def text_spans(text):
    return [{"t": "text", "text": text}]


def join_lines(lines):
    text = lines[0].strip()
    for line in lines[1:]:
        line = line.strip()
        split = re.search(r"([^\W\d_]+)-$", text)
        if split and line[0].isalpha() and not text.endswith(" -refiriéndose al Corán-"):
            suffix = re.match(r"[^\W\d_]+(?:[’'][^\W\d_]+)?", line)[0]
            compound = f"{split[1]}-{suffix}".casefold()
            if compound not in PRINTED_COMPOUNDS:
                text = text[:-1]
            text += line
        else:
            text += " " + line
    return text


@dataclass
class Entry:
    kind: str
    section: dict
    page: int
    lines: list[str] = field(default_factory=list)
    refs: list[tuple[int, int]] = field(default_factory=list)


def read_source(path):
    sections, entries, notes = [], [], {}
    current = None
    with pinned_pdf(path, SHA256) as doc:
        if len(doc) != 448:
            raise ValueError("Expected 448 source pages")
        for page in doc:
            folio = page.number + 4
            note_key = None
            last_note = next(reversed(notes), None)
            printed = []
            for line in page_lines(page):
                spans = line["spans"]
                first = spans[0]
                y = first["origin"][1]
                plain = "".join(span["text"] for span in spans).strip()
                if not plain or y < 30:
                    continue
                if FOLIO.fullmatch(plain):
                    printed.append(int(FOLIO.fullmatch(plain)[1]))
                    continue
                size = round(first["size"], 1)
                font = first["font"]
                bold = font.endswith("-Bold")
                if bold and size in (7.5, 8) and current and current.kind == "heading" and not NUMBER.match(plain):
                    current.lines.append(plain)
                    current.section["title"] = join_lines(current.lines)
                    continue
                if bold and NUMBER.match(plain) and "SURA " in plain:
                    number = int(NUMBER.match(plain)[1])
                    if number != len(sections) + 1:
                        raise ValueError(f"Unexpected sura on folio {folio}: {plain}")
                    refs = [(folio, int(span["text"])) for span in spans
                            if span["flags"] & pymupdf.TEXT_FONT_SUPERSCRIPT]
                    title = "".join(span["text"] for span in spans
                                    if not span["flags"] & pymupdf.TEXT_FONT_SUPERSCRIPT).strip()
                    title = title.replace("!", "(").replace('"', ")")
                    section = {"id": f"s{number}", "title": title, "blocks": []}
                    sections.append(section)
                    current = Entry("heading", section, folio, [title], refs)
                    entries.append(current)
                    continue
                if bold and size == 5.5 and first["text"].strip().isdigit():
                    number = int(first["text"])
                    note_key = (folio, number)
                    if note_key in notes:
                        raise ValueError(f"Duplicate print note {note_key}")
                    notes[note_key] = [plain[len(first["text"].strip()):].strip()]
                    continue
                if size == 7.5 and not bold and (
                    note_key is not None or (current and current.kind == "verse")
                ):
                    note_key = note_key or last_note
                    if note_key is None:
                        raise ValueError(f"Orphan note continuation on folio {folio}")
                    notes[note_key].append(plain)
                    continue
                if note_key is not None:
                    raise ValueError(f"Unexpected print note continuation {folio}: {plain}")
                # The source prints 11:49 as 50 and omits the label on 24:19.
                sura = sections[-1]["id"]
                verse_number = None
                if (sura, folio) == ("s11", 154) and plain.startswith("50. Esto forma"):
                    verse_number = 49
                elif (sura, folio) == ("s24", 242) and plain.startswith("Verdaderamente aquéllos"):
                    verse_number = 19
                if verse_number is not None or (bold and size == 7.5 and NUMBER.match(plain)):
                    kind = "verse"
                elif font.endswith("-Semibol"):
                    kind = "basmala"
                elif size == 7.5 and not bold:
                    kind = "intro"
                elif size >= 9 and current and current.kind == "verse":
                    kind = "continuation"
                else:
                    raise ValueError(f"Unexpected body style {folio}, {font}/{size}: {plain}")
                if kind != "continuation" and not (
                    kind == "intro" and current and current.kind == "intro"
                ):
                    current = Entry(kind, sections[-1], folio)
                    entries.append(current)
                parts = []
                for span in spans:
                    text = span["text"]
                    if span["flags"] & pymupdf.TEXT_FONT_SUPERSCRIPT and text.strip().isdigit():
                        number = int(text)
                        current.refs.append((folio, number))
                        text = f"[{number}]"
                    parts.append(text)
                text = "".join(parts).strip()
                if verse_number is not None:
                    text = f"{verse_number}. " + NUMBER.sub("", text, count=1)
                current.lines.append(text)
            if printed != [folio]:
                raise ValueError(f"Incorrect printed folio {folio}: {printed}")
    return sections, entries, notes


def build(path=PDF):
    sections, entries, notes = read_source(path)
    references = {ref for entry in entries for ref in entry.refs}
    if references != notes.keys():
        raise ValueError(f"Unmatched page-local note keys: {references ^ notes.keys()}")
    emitted = set()
    for entry in entries:
        text = join_lines(entry.lines)
        if entry.kind == "heading":
            add_block(entry.section, entry.page, "heading", level=1, text=text + "".join(f"[{n}]" for _, n in entry.refs))
        else:
            add_block(entry.section, entry.page, "paragraph", spans=text_spans(text))
        for folio, number in entry.refs:
            if (folio, number) in emitted:
                continue
            emitted.add((folio, number))
            add_block(entry.section, folio, "note",
                      spans=text_spans(f"[{number}] {join_lines(notes[folio, number])}"))
    return {"id": BOOK_ID, "title": TITLE, "author": "", "credits": [], "sections": sections}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path, nargs="?", default=PDF)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "assets/books")
    args = parser.parse_args()
    book = build(args.pdf)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / f"{BOOK_ID}.json").write_bytes(json_bytes(book))


if __name__ == "__main__":
    main()
