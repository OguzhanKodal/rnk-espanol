#!/usr/bin/env python3
"""Verify locally generated PDF books against their Word exports and corpus."""

import argparse
from collections import Counter, defaultdict
from functools import lru_cache
from hashlib import sha256
import json
from pathlib import Path
import re
import sys
import unicodedata

# Python -I omits the script directory from sys.path.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from convert_docx import source_excerpt
from convert_pdf_books import (
    ARABIC, AUTHOR, CORPUS_ROOT, DISCRETIONARY, PDF_ROOT, ROOT, SOURCES, TEXT_FLAGS,
    convert, json_bytes, load_decisions, open_source, resolve_path,
)
from validate import check, integer, keys, string


def validate_schema(book, source):
    keys(book, ["id", "title", "author", "credits", "sections"])
    check((book["id"], book["title"], book["author"]) == (source.id, source.title, AUTHOR),
          f"{source.id}: book metadata changed")
    check(isinstance(book["credits"], list), "Invalid credits")
    for credit in book["credits"]:
        string(credit)
    count = Counter()
    references, notes = Counter(), Counter()
    page = 0
    blocks = {}
    for i, section in enumerate(book["sections"], 1):
        keys(section, ["id", "title", "blocks"])
        check(section["id"] == f"s{i}" and bool(section["blocks"]), "Invalid section")
        string(section["title"])
        for j, block in enumerate(section["blocks"], 1):
            block_id = f"s{i}-b{j}"
            check(block["id"] == block_id, f"Unstable block id: {block_id}")
            integer(block["page"])
            kind = block["type"]
            base = ["id", "type", "page"]
            count[kind] += 1
            blocks[block_id] = block
            if kind == "pageBreak":
                keys(block, base)
                page += 1
            check(block["page"] == page, f"Wrong pageBreak or page at {block_id}")
            if kind == "pageBreak":
                continue
            if kind == "heading":
                keys(block, base + ["level", "text"])
                check(type(block["level"]) is int and 1 <= block["level"] <= 3, "Invalid heading")
                string(block["text"])
                text = block["text"]
            elif kind == "arabic":
                keys(block, base + ["text"], ["unresolved", "image", "imageSize"])
                validate_arabic(block)
                continue
            else:
                check(kind in ("paragraph", "note"), f"Unexpected block type: {kind}")
                keys(block, base + ["spans"])
                check(isinstance(block["spans"], list) and bool(block["spans"]), "Empty spans")
                for span in block["spans"]:
                    if span["t"] == "arabic":
                        keys(span, ["t", "text"], ["unresolved", "image", "imageSize"])
                        validate_arabic(span)
                    else:
                        keys(span, ["t", "text"])
                        check(span["t"] in ("text", "italic", "bold") and isinstance(span["text"], str)
                              and bool(span["text"]) and not ARABIC.search(span["text"]),
                              f"Invalid Latin span in {block_id}")
                text = "".join(sp["text"] for sp in block["spans"] if sp["t"] != "arabic")
            label = re.match(r"^\[(\d+)\]", text) if kind == "note" else None
            if label:
                notes[label[1]] += 1
                text = text[label.end():]
            references.update(re.findall(r"\[(\d+)\]", text))
    check(page == source.pages, "Incomplete pageBreak coverage")
    check(Counter({key: n for key, n in references.items() if key in notes}) == notes,
          f"{source.id}: unresolved or repeated rendered note references")
    return blocks, count, notes, references


def validate_arabic(asset):
    if asset.get("unresolved"):
        check(asset["unresolved"] is True and asset["text"] == "", "Invalid fallback text")
        string(asset["image"])
        check(Path(asset["image"]).name == asset["image"], "Invalid image path")
        size = asset["imageSize"]
        check(isinstance(size, list) and len(size) == 2, "Invalid image dimensions")
        for n in size:
            integer(n)
    else:
        check(not ({"unresolved", "image", "imageSize"} & asset.keys()), "Unexpected image metadata")
        string(asset["text"])
        check(bool(ARABIC.search(asset["text"])), "Corpus text is missing Arabic script")
        check(not re.search(r"[\ufb50-\ufdff\ufe70-\ufefc]", asset["text"]),
              "Arabic presentation glyphs leaked into the book")


def validate_arabic_sources(table, corpus_root):
    @lru_cache
    def source_file(name):
        path = Path(name)
        check(not path.is_absolute() and ".." not in path.parts, f"Invalid corpus path: {name}")
        data = resolve_path(corpus_root, path).read_bytes()
        return sha256(data).hexdigest(), data.decode("utf-8").splitlines()

    def validate_part(part):
        keys(part, ["text", "source", "line", "source_sha256"], ["line_end"])
        integer(part["line"])
        digest, lines = source_file(part["source"])
        check(digest == part["source_sha256"], f"Corpus hash changed: {part['source']}")
        last = part.get("line_end", part["line"])
        integer(last)
        check(part["line"] <= last <= len(lines), f"Missing corpus line: {part}")
        line = source_excerpt(lines[part["line"] - 1:last])
        # Word and HTML wrap at different widths. The Arabic letters and
        # diacritics must survive exactly, including their Unicode order.
        match_text = lambda value: re.sub(r"\s+", " ", value).strip()
        check(match_text(part["text"]) in match_text(line), f"Unverified corpus excerpt: {part}")
        validate_arabic({"text": part["text"]})

    for key, row in table.items():
        common = ["bbox", "context", "confidence"]
        if row["confidence"] in ("image", "ornament"):
            keys(row, common + ["reason", "text", "unresolved", "image", "imageSize"], ["objects"])
            validate_arabic(row)
            continue
        citation = ["text", "source", "line", "source_sha256"]
        keys(row, common + citation, ["parts", "joiner", "objects", "line_end"])
        check(row["confidence"] in ("high", "medium"), f"Bad confidence flag: {key}")
        if "parts" in row:
            check(row["joiner"] in (" ", "\n") and len(row["parts"]) >= 2, f"Invalid parts: {key}")
            check(row["text"] == row["joiner"].join(p["text"] for p in row["parts"]),
                  f"Unexpected composite text: {key}")
            check(all(row[k] == row["parts"][0][k] for k in citation if k != "text"),
                  f"Unexpected composite citation: {key}")
            for part in row["parts"]:
                validate_part(part)
        else:
            validate_part({k: row[k] for k in (*citation, "line_end") if k in row})


def latin_source(rows, note_id=None):
    """Independently reconstruct the Latin stream from each represented PDF line."""
    values = []
    for row in rows:
        values.append("".join(
            f"[{it.data['text']}]" if it.data["t"] == "ref" else it.data.get("text", "")
            for it in row.items
        ).strip())
    if note_id:
        values[0] = re.sub(r"^\d+", f"[{note_id}]", values[0], count=1)
    for i in range(len(values) - 1):
        left, right = values[i], values[i + 1]
        tail, head = re.search(r"[\w-]+-$", left), re.match(r"[\w-]+", right)
        if tail and head and (tail[0], head[0]) in DISCRETIONARY:
            values[i] = left[:-1]
    return re.sub(r"\s", "", "".join(values))


def validate_coverage(doc, build, blocks, note_numbers):
    expected, actual = Counter(), Counter()
    arabic_expected, arabic_actual = Counter(), Counter()
    excluded = Counter()
    line_count = 0
    for page in doc:
        n = page.number + 1
        inventory = build.inventory[n]
        skipped = inventory["excluded"]
        excluded.update(skipped.values())
        evidence = defaultdict(list)
        for item in inventory["items"]:
            if "/l" in item.key:
                line, span = item.key.rsplit(".", 1)
                evidence[line].append((int(span), item.offset, item.raw))
        for b in page.get_text("dict", flags=TEXT_FLAGS)["blocks"]:
            for i, line in enumerate(b["lines"], 1):
                line_id = f"{n}/l{b['number']}.{i}"
                value = "".join(span["text"] for span in line["spans"])
                if not value.strip():
                    check(skipped.get(line_id) == "whitespace-only PDF line",
                          f"Missing exclusion: {line_id}")
                    continue
                # Word can leave zero-width diacritics at the edge of an
                # embedded image. The painted manuscript image is represented.
                for key in skipped:
                    if key.startswith(line_id + "."):
                        value = value.rstrip()
                        check(bool(value) and unicodedata.combining(value[-1]) != 0,
                              f"Unexpected zero-width text exclusion: {key}")
                        value = value[:-1]
                reproduced = "".join(raw for _, _, raw in sorted(evidence[line_id]))
                check(value.rstrip() == reproduced.rstrip(), f"Unaccounted PDF text: {line_id}")
                line_count += 1
        expected.update(item.key for item in inventory["items"])
        placed = [obj for row in build.table.values() for obj in row.get("objects", ())
                  if obj.startswith(f"{n}:")]
        check(Counter(placed) == Counter(f"{n}:{i}" for i in range(1, len(page.get_image_info()) + 1)),
              f"Missing or repeated PDF image object on page {n}")

    for block_id, (rows, item_keys) in build.witnesses.items():
        block = blocks[block_id]
        check(block["page"] == rows[0].page == min(r.page for r in rows),
              f"{block_id}: expected the physical page where the block starts")
        check(all((a.page, a.baseline) <= (b.page, b.baseline) for a, b in zip(rows, rows[1:])),
              f"{block_id}: source rows are out of order")
        actual.update(item_keys)
        if block["type"] == "arabic":
            ar = [block]
        else:
            ar = [s for s in block.get("spans", []) if s["t"] == "arabic"]
            text = block.get("text", "".join(s["text"] for s in block.get("spans", [])
                                            if s["t"] != "arabic"))
            note = re.match(r"^\[(\d+)\]", text) if block["type"] == "note" else None
            check(latin_source(rows, note[1] if note and note[1] in note_numbers else None)
                  == re.sub(r"\s", "", text), f"{block_id}: Spanish characters changed")
        arabic_actual.update((a["text"], a.get("image")) for a in ar)
    check(expected == actual, f"Lost or duplicated source runs: {expected - actual}; {actual - expected}")
    arabic_expected.update((a["text"], a.get("image")) for a in build.table.values())
    check(arabic_expected == arabic_actual, "Arabic occurrence inventory differs from the book")
    return line_count, excluded


def validate_pdf_book(source, pdf_root, corpus_root, output_dir, override_dir):
    book_path = output_dir / f"{source.id}.json"
    override_path = override_dir / f"arabic_overrides_{source.id}.json"
    table = json.loads(override_path.read_bytes())
    validate_arabic_sources(table, corpus_root)
    with open_source(pdf_root, source) as doc:
        rebuild = convert(doc, source, load_decisions(override_dir, source))
        check(book_path.read_bytes() == json_bytes(rebuild.book), f"Stale JSON: {book_path}")
        check(override_path.read_bytes() == json_bytes(rebuild.table), f"Stale override table: {override_path}")
        blocks, count, notes, refs = validate_schema(rebuild.book, source)
        check(notes == rebuild.note_ids and all(refs[n] == count for n, count in rebuild.refs.items()),
              f"{source.id}: rendered footnotes differ from PDF numbering")
        line_count, excluded = validate_coverage(doc, rebuild, blocks, notes)
    image_dir = output_dir / source.id
    for name, data in rebuild.images.items():
        check((image_dir / name).read_bytes() == data, f"Stale image fallback: {source.id}/{name}")
    counts = Counter(row["confidence"] for row in table.values())
    print(
        f"PASS: {source.id}: {source.pages} pages, {len(blocks)} blocks, {sum(notes.values())} footnotes, "
        f"{line_count} PDF text lines, {sum(excluded.values())} excluded layout runs, "
        f"{counts['high']} high / {counts['medium']} medium / {counts['image']} Arabic images, "
        f"{counts['ornament']} ornaments"
    )
    return count, counts, excluded


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf-root", type=Path, default=PDF_ROOT)
    parser.add_argument("--source-root", type=Path, default=CORPUS_ROOT)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "assets/books")
    parser.add_argument("--override-dir", type=Path, default=ROOT / "scripts")
    args = parser.parse_args()
    catalog = json.loads((ROOT / "assets/books/catalog.json").read_bytes())
    for source in SOURCES:
        matching = [entry for entry in catalog["books"] if entry["id"] == source.id]
        check(len(matching) == 1 and matching[0]["shelf"] == "breves"
              and matching[0]["available"] is True and matching[0]["title"] == source.title,
              f"Missing or invalid catalog entry: {source.id}")
        validate_pdf_book(source, args.pdf_root, args.source_root, args.output_dir, args.override_dir)


if __name__ == "__main__":
    main()
