"""Validate the Destellos manuscript sources and its generated app book."""

from collections import Counter
from functools import lru_cache
import json
from pathlib import Path

from convert_docx import (
    BOOK_ID, OVERRIDES, PDF_PAGES, ROOT, SECTION_TITLES, check_inventory,
    convert, locate_pages, read_docx, sha256, source_excerpt,
)
from validate import arabic, check, integer, keys, string


def validate_sources(overrides, source_root):
    @lru_cache
    def source_file(relative_path):
        source = source_root / relative_path
        return sha256(source), source.read_text(encoding="utf-8").splitlines()

    for key, entry in overrides.items():
        common = ["image", "inline", "context", "text", "source", "line", "source_sha256", "confidence"]
        if entry.get("unresolved"):
            keys(entry, common + ["unresolved", "reason"])
            check(entry["source"] is entry["line"] is entry["source_sha256"] is None,
                  f"Unresolved Arabic has a source citation: {key}")
            string(entry["reason"])
        else:
            keys(entry, common, ["line_end"])
            string(entry["source"])
            relative = Path(entry["source"])
            check(not relative.is_absolute() and ".." not in relative.parts,
                  f"Invalid corpus path: {key}")
            integer(entry["line"])
            first, last = entry["line"], entry.get("line_end", entry["line"])
            integer(last)
            check(first <= last, f"Invalid source line range: {key}")
            check(len(entry["source_sha256"]) == 64, f"Missing SHA-256: {key}")
            if source_root is not None:
                digest, lines = source_file(entry["source"])
                check(digest == entry["source_sha256"], f"Source hash changed: {entry['source']}")
                check(last <= len(lines) and entry["text"] in source_excerpt(lines[first - 1:last]),
                      f"Arabic is absent from the recorded source lines: {key}")
        string(entry["context"])
        check(type(entry["inline"]) is bool, f"Invalid Arabic position: {key}")
        check(entry["confidence"] in ("high", "medium", "low"), f"Invalid confidence: {key}")
        arabic(entry)


def check_book_schema(book, overrides):
    keys(book, ["id", "title", "author", "credits", "sections"])
    check(book["id"] == BOOK_ID, "Incorrect book id")
    for field in ("title", "author"):
        string(book[field])
    check(isinstance(book["credits"], list) and bool(book["credits"]), "Missing credits")
    for line in book["credits"]:
        string(line)
    check(tuple(s["title"] for s in book["sections"]) == SECTION_TITLES, "Incorrect section order")

    page, arabic_blocks, note_count = 0, [], 0
    for i, section in enumerate(book["sections"], 1):
        keys(section, ["id", "title", "blocks"])
        check(section["id"] == f"s{i}" and bool(section["blocks"]), "Empty or unstable section")
        for j, block in enumerate(section["blocks"], 1):
            base = ["id", "page", "type"]
            kind = block["type"]
            block_id = block["id"]
            check(block_id == f"s{i}-b{j}", f"Unstable block id: {block_id}")
            integer(block["page"])
            check(block["page"] <= PDF_PAGES, f"Page exceeds Word PDF length: {block_id}")
            if kind == "pageBreak":
                keys(block, base)
                check(block["page"] > page, f"Repeated or nonmonotonic page break: {block_id}")
                page = block["page"]
                continue
            check(block["page"] == page, f"Missing page break at {block_id}")
            if kind == "heading":
                keys(block, base + ["level", "text"])
                string(block["text"])
                check(type(block["level"]) is int and 1 <= block["level"] <= 3, "Invalid heading level")
            elif kind == "arabic":
                keys(block, base + ["text"], ["unresolved", "image", "imageSize"])
                arabic(block)
                arabic_blocks.append((False, block["text"], block.get("unresolved", False)))
            elif kind in ("paragraph", "note"):
                keys(block, base + ["spans"])
                check(isinstance(block["spans"], list) and bool(block["spans"]), f"Empty spans: {block_id}")
                note_count += kind == "note"
                for span in block["spans"]:
                    check(span["t"] in ("text", "bold", "italic", "arabic"), f"Invalid span: {block_id}")
                    if span["t"] == "arabic":
                        keys(span, ["t", "text"], ["unresolved", "image", "imageSize"])
                        arabic(span)
                        arabic_blocks.append((True, span["text"], span.get("unresolved", False)))
                    else:
                        keys(span, ["t", "text"])
                        check(isinstance(span["text"], str) and bool(span["text"]), f"Empty span: {block_id}")
            else:
                raise ValueError(f"Unexpected block type: {kind}")
    expected = [
        (entry["inline"], entry["text"], entry.get("unresolved", False))
        for entry in overrides.values()
    ]
    check(arabic_blocks == expected, "Arabic occurrence order, position or contents changed")
    return note_count


def validate_destellos(docx, pdf, source_root, book=None):
    paragraphs, notes = read_docx(docx)
    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8"))
    check_inventory(paragraphs, notes, overrides)
    validate_sources(overrides, source_root)
    counts = Counter(
        "unresolved" if entry.get("unresolved") else entry["confidence"] for entry in overrides.values()
    )
    print(f"PASS: Destellos source inventory, {len(notes)} footnotes, {len(overrides)} images {dict(counts)}")
    if book is None:
        print("Pending: the Word PDF is required to validate the generated Destellos book.")
        return
    note_count = check_book_schema(book, overrides)
    check(note_count == len(notes), "Footnote coverage")
    pages = locate_pages(paragraphs, docx, pdf)
    expected = convert(paragraphs, notes, overrides, pages)
    check(book == expected, "Los Destellos differs from the Word manuscript/PDF conversion")
    print(f"PASS: Destellos book, {len(book['sections'])} sections, PDF SHA-256 {sha256(pdf)}")
