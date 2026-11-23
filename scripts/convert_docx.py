#!/usr/bin/env python3
"""Convert the Destellos Word manuscript, using curated Arabic transcriptions."""

import argparse
from bisect import bisect_left
from collections import Counter
from dataclasses import dataclass
from functools import lru_cache
import hashlib
import html
from itertools import combinations
import json
from pathlib import Path, PurePosixPath
import posixpath
import re
import unicodedata
import xml.etree.ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
BOOK_ID = "los-destellos"
DOCX = Path.home() / "Downloads/Destellos (TERMINADO).docx"
DOCX_SHA256 = "cd26f885a3eb26eed4b327f0794d0588407186f729613e87b206868a7d0233ee"
OVERRIDES = ROOT / "scripts/arabic_overrides_destellos.json"
PDF = Path.home() / "Downloads/Destellos (TERMINADO).pdf"
PDF_SHA256 = "92b627f2d48900a2077200e102ab29cae36ebfcfddf373f56d6cb4bf9d484a49"
PDF_PAGES = 288

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
MC = "{http://schemas.openxmlformats.org/markup-compatibility/2006}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
V = "{urn:schemas-microsoft-com:vml}"

ORDINALS = (
    "Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve",
    "Diez", "Once", "Doce", "Trece", "Catorce", "Quince", "Dieciséis", "Diecisiete",
    "Dieciocho", "Diecinueve", "Veinte", "Veintiuno", "Veintidós", "Veintitrés",
    "Veinticuatro", "Veinticinco", "Veintiséis", "Veintisiete", "Veintiocho",
    "Veintinueve", "Treinta", "Treinta y Uno", "Treinta y Dos", "Treinta y Tres",
)
DESTELLOS = tuple(f"Destello {ordinal}" for ordinal in ORDINALS)
SECTION_TITLES = ("DESTELLOS", "Introducción", *DESTELLOS, "Una Súplica", "Oración final")


@dataclass
class Paragraph:
    key: str
    style: str
    alignment: str
    parts: list
    footnotes: list

    @property
    def text(self):
        return "".join(part["text"] for part in self.parts if part["t"] != "image").strip()


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def corpus_line(line):
    line = re.sub(r"<br\s*/?>", "\n", line, flags=re.I)
    line = html.unescape(re.sub(r"<[^>]+>", "", line))
    return re.sub(r"[ \t]*§[ \t]*", " ", line)


def source_excerpt(lines):
    """Remove Markdown footnote callouts and normalize the corpus's XML layout."""
    return "\n".join(
        normalized for line in lines
        if (normalized := re.sub(r"\s*\[\^[^\]]+\]", "", corpus_line(line)).strip())
    )


def property_value(node, name):
    if node is None:
        return None
    item = node.find(W + name)
    return item.get(W + "val", "") if item is not None else None


def logical_nodes(node):
    """Read the DrawingML choice once, skipping its legacy VML duplicate."""
    yield node
    if node.tag == MC + "AlternateContent":
        choice = node.find(MC + "Choice")
        if choice is None:
            choice = node.find(MC + "Fallback")
        if choice is not None:
            yield from logical_nodes(choice)
        return
    for child in node:
        yield from logical_nodes(child)


def relationships(archive, part):
    path = PurePosixPath(part)
    rels = path.parent / "_rels" / (path.name + ".rels")
    return {
        rel.get("Id"): posixpath.normpath(str(path.parent / rel.get("Target")))
        for rel in ET.fromstring(archive.read(str(rels)))
        if rel.get("Type").endswith("/image") and rel.get("TargetMode") != "External"
    }


def read_docx(path):
    actual_hash = sha256(path)
    if actual_hash != DOCX_SHA256:
        raise ValueError(f"Unexpected Destellos manuscript SHA-256: {actual_hash}")
    with ZipFile(path) as archive:
        styles = ET.fromstring(archive.read("word/styles.xml"))
        by_id = {e.get(W + "styleId"): e for e in styles.findall(W + "style")}

        @lru_cache
        def style_property(style_id, kind, name):
            style = by_id.get(style_id)
            if style is None:
                return None
            own = property_value(style.find(W + kind), name)
            if own is not None:
                return own
            return style_property(property_value(style, "basedOn"), kind, name)

        def parse(p, key, refs):
            props = p.find(W + "pPr")
            style_id = property_value(props, "pStyle") or "Normal"
            align = property_value(props, "jc") or style_property(style_id, "pPr", "jc")
            parts, footnotes = [], []
            images = 0
            for run in logical_nodes(p):
                if run.tag != W + "r":
                    continue
                run_props = run.find(W + "rPr")
                char_style = property_value(run_props, "rStyle")

                def enabled(name):
                    for flag in (
                        property_value(run_props, name),
                        style_property(char_style, "rPr", name),
                        style_property(style_id, "rPr", name),
                    ):
                        if flag is not None:
                            return flag not in ("0", "false", "off")
                    return False

                kind = "bold" if enabled("b") else "italic" if enabled("i") else "text"
                for child in logical_nodes(run):
                    if child.tag == W + "t":
                        parts.append({"t": kind, "text": child.text or ""})
                    elif child.tag in (W + "tab", W + "br", W + "cr"):
                        parts.append({"t": kind, "text": " " if child.tag == W + "tab" else "\n"})
                    elif child.tag in (A + "blip", V + "imagedata"):
                        target = refs[child.get(R + ("embed" if child.tag == A + "blip" else "id"))]
                        images += 1
                        name = PurePosixPath(target).name
                        parts.append({"t": "image", "key": f"{key}:{images}:{name}", "image": name})
                    elif child.tag == W + "footnoteReference":
                        note_id = int(child.get(W + "id"))
                        footnotes.append(note_id)
                        parts.append({"t": "text", "text": f"[{note_id - 1}]", "marker": True})
            return Paragraph(key, style_id, align, parts, footnotes)

        body_name = "word/document.xml"
        body = ET.fromstring(archive.read(body_name)).find(W + "body")
        body_refs = relationships(archive, body_name)
        paragraphs = [
            parse(p, f"p{i}", body_refs) for i, p in enumerate(body.findall(W + "p"), 1)
        ]
        note_name = "word/footnotes.xml"
        notes_root = ET.fromstring(archive.read(note_name))
        note_refs = relationships(archive, note_name)
        notes = {}
        for node in notes_root.findall(W + "footnote"):
            if node.get(W + "type") is not None:
                continue
            note_id = int(node.get(W + "id"))
            notes[note_id] = [
                parse(p, f"fn{note_id}.p{i}", note_refs)
                for i, p in enumerate(node.findall(W + "p"), 1)
            ]
    references = Counter(n for p in paragraphs for n in p.footnotes)
    if references != Counter({key: 1 for key in notes}):
        raise ValueError(f"Missing, orphaned or repeated footnotes: {references}")
    return paragraphs, notes


def image_inventory(paragraphs, notes):
    """Return source occurrence metadata in reading order, including footnotes."""
    inventory = {}
    nonempty = [i for i, p in enumerate(paragraphs) if p.text]
    for i, p in enumerate(paragraphs):
        hosts = [(p, None)]
        for note_id in p.footnotes:
            hosts.extend((note, note_id) for note in notes[note_id])
        for host, note_id in hosts:
            if not any(part["t"] == "image" for part in host.parts):
                continue
            prev = next((paragraphs[j].text for j in reversed(nonempty) if j < i), "")
            following = next((paragraphs[j].text for j in nonempty if j > i), "")
            for part in host.parts:
                if part["t"] != "image":
                    continue
                marked = "".join(
                    ("⟦imagen⟧" if token is part else "⟦otra imagen⟧")
                    if token["t"] == "image" else token["text"]
                    for token in host.parts
                ).strip()
                at = marked.index("⟦imagen⟧")
                excerpt = " ".join(marked[max(0, at - 95):at + 104].split())
                if note_id is not None:
                    excerpt = f"Nota {note_id - 1} · {excerpt}"
                elif not host.text:
                    excerpt = f"{prev[-100:].strip()} / {excerpt} / {following[:100].strip()}"
                inventory[part["key"]] = {
                    "image": part["image"],
                    "inline": bool(host.text),
                    "context": excerpt,
                }
    return inventory


def spans(parts, overrides):
    result = []
    for part in parts:
        kind = part["t"]
        if kind == "image":
            entry = overrides[part["key"]]
            arabic = {"t": "arabic", "text": entry["text"]}
            if entry.get("unresolved"):
                arabic["unresolved"] = True
            result.append(arabic)
            continue
        value = part["text"]
        if not value:
            continue
        if result and result[-1]["t"] == kind:
            result[-1]["text"] += value
        else:
            result.append({"t": kind, "text": value})
    if result and result[0]["t"] != "arabic":
        result[0]["text"] = result[0]["text"].lstrip()
    if result and result[-1]["t"] != "arabic":
        result[-1]["text"] = result[-1]["text"].rstrip()
    return [part for part in result if part["text"] or part["t"] == "arabic"]


def title_text(paragraph):
    return "".join(
        part["text"] for part in paragraph.parts if part["t"] != "image" and not part.get("marker")
    ).strip()


def heading_level(p):
    if p.style in ("Heading2", "Heading3"):
        return int(p.style[-1])
    text = title_text(p)
    if len(text) <= 115 and text.isupper() and re.search(r"[A-ZÁÉÍÓÚÑ]", text):
        return 2
    if re.fullmatch(
        r"(?i)(?:El |La )?(?:Primer[ao]?|Segund[ao]|Tercer[ao]?|Cuart[ao]|"
        r"Quint[ao]|Sext[ao]|Séptim[ao]|Octav[ao]|Noven[ao]|Décim[ao](?: \w+)?) "
        r"(?:punto|remedio|nota|nivel|grado|indicación|aspecto|parte|razón|pregunta|esperanza|principio)[.:]?",
        text,
    ):
        return 3
    return None


def is_separator(p):
    return bool(re.fullmatch(r"(?:\*\s*){2,}", p.text))


def block_for(p, overrides, level=None):
    if is_separator(p):
        return []
    values = spans(p.parts, overrides)
    if not values:
        return []
    if all(sp["t"] == "arabic" or not sp["text"].strip() for sp in values):
        return [
            {"type": "arabic", **{k: v for k, v in sp.items() if k != "t"}}
            for sp in values if sp["t"] == "arabic"
        ]
    if level and all(sp["t"] != "arabic" for sp in values):
        return [{"type": "heading", "level": level, "text": "".join(sp["text"] for sp in values)}]
    return [{"type": "paragraph", "spans": values}]


def matching_text(value):
    """Ignore case, accents, typography, spaces and line-end hyphens for alignment."""
    return "".join(
        char for char in unicodedata.normalize("NFKD", value).casefold()
        if ("a" <= char <= "z" or "0" <= char <= "9")
    )


def paragraph_key(paragraph, keep_markers=()):
    return matching_text("".join(
        part["text"] for part in paragraph.parts
        if part["t"] != "image" and (not part.get("marker") or part["text"] in keep_markers)
    ))


def split_match(needle, pages, pageno, offset):
    """Confirm the entire paragraph when a folio or footer interrupts the page join."""
    page = pages[pageno]
    prefix = needle[: min(len(needle), 32)]
    start = page.find(prefix, offset)
    while start >= 0:
        available = page[start:]
        # Keep the last matching character before the page's footer or footnotes.
        matched = 0
        for actual, expected in zip(available, needle):
            if actual != expected:
                break
            matched += 1
        if matched == len(needle):
            return start, pageno, start + matched
        continuation = needle[matched:]
        if matched >= len(prefix) and pageno + 1 < len(pages):
            following = pages[pageno + 1]
            tail = following.find(continuation)
            if 0 <= tail <= 140:
                return start, pageno + 1, tail + len(continuation)
        start = page.find(prefix, start + 1)
    return None


def text_pages(doc, fitz):
    pages, layout = [], []
    for number, page in enumerate(doc, 1):
        lines, edges = [], []
        offset = 0
        for block in page.get_text(
            "dict", sort=True, flags=fitz.TEXTFLAGS_DICT & ~fitz.TEXT_PRESERVE_IMAGES
        )["blocks"]:
            for line in block.get("lines", []):
                value = "".join(
                    span["text"] for span in line["spans"]
                    if not (span["flags"] & fitz.TEXT_FONT_SUPERSCRIPT and span["text"].strip().isdigit())
                )
                if value.strip() == str(number):
                    _, top, _, bottom = line["bbox"]
                    if top < page.rect.height * .12 or bottom > page.rect.height * .88:
                        continue
                value = matching_text(value)
                if value:
                    offset += len(value)
                    lines.append(value)
                    edges.append((offset, line["bbox"][1], line["bbox"][3]))
        pages.append("".join(lines))
        layout.append(edges)
    return pages, layout


def image_signature(fitz, data, mask=None):
    try:
        image = fitz.Pixmap(data)
        if mask:
            if image.alpha:
                image = fitz.Pixmap(image, 0)
            image = fitz.Pixmap(image, fitz.Pixmap(mask))
        if image.colorspace is None:
            return None
        gray = fitz.Pixmap(fitz.csGRAY, image)
        sample = fitz.Pixmap(gray, 24, 16, None)
        raw = sample.samples
        if sample.alpha:
            raw = bytes(255 + value - alpha for value, alpha in zip(raw[::2], raw[1::2]))
    except (ValueError, RuntimeError):
        return None
    return image.width / image.height, raw


def image_pages(doc, docx, fitz, paragraphs, located, anchors):
    missing = [index for index, paragraph in enumerate(paragraphs)
               if paragraph.key not in located and any(p["t"] == "image" for p in paragraph.parts)]
    if not missing:
        return []
    ordered_indices = [i for i, paragraph in enumerate(paragraphs) if paragraph.key in anchors]
    with ZipFile(docx) as archive:
        names = {part["image"] for i in missing for part in paragraphs[i].parts if part["t"] == "image"}
        signatures = {
            name: image_signature(fitz, archive.read("word/media/" + name)) for name in names
        }

    @lru_cache
    def pdf_signatures(number):
        return [
            (sig, block["bbox"]) for block in doc[number - 1].get_text("dict")["blocks"]
            if block["type"] == 1
            if (sig := image_signature(fitz, block["image"], block.get("mask"))) is not None
        ]

    unplaced = []
    previous = 1
    for index in missing:
        paragraph = paragraphs[index]
        insertion = bisect_left(ordered_indices, index)
        before, bottom = anchors[paragraphs[ordered_indices[insertion - 1]].key][1] if insertion else (1, 0)
        after, top = (
            anchors[paragraphs[ordered_indices[insertion]].key][0]
            if insertion < len(ordered_indices) else (len(doc), float("inf"))
        )
        first, last = max(previous, before), after
        if first == last:
            located[paragraph.key] = previous = first
            continue
        name = next(part["image"] for part in paragraph.parts if part["t"] == "image")
        signature = signatures[name]
        matches = []
        if signature:
            ratio, expected = signature
            for number in range(first, last + 1):
                for (actual_ratio, samples), (_, y0, _, y1) in pdf_signatures(number):
                    if (number == before and y0 < bottom - 3) or (number == after and y1 > top + 3):
                        continue
                    if not .84 < actual_ratio / ratio < 1.19:
                        continue
                    difference = sum(abs(a - b) for a, b in zip(samples, expected)) / len(expected)
                    if difference <= 9:
                        matches.append((difference, number))
        matches.sort()
        if matches:
            score, number = matches[0]
            contenders = {n for error, n in matches if error <= score + 2}
            if contenders == {number}:
                located[paragraph.key] = previous = number
                continue
        unplaced.append(f"{paragraph.key} {name} (between PDF pages {first} and {last})")
    return unplaced


def locate_pages(paragraphs, docx, pdf):
    actual_hash = sha256(pdf)
    if actual_hash != PDF_SHA256:
        raise ValueError(f"Unexpected Destellos Word PDF SHA-256: {actual_hash}")
    import pymupdf
    with pymupdf.open(pdf) as doc:
        if len(doc) != PDF_PAGES:
            raise ValueError(f"Expected {PDF_PAGES} Word PDF pages, found {len(doc)}")
        pages, layout = text_pages(doc, pymupdf)
        located, anchors, unplaced = {}, {}, []
        def y_position(pageno, char_index, edge):
            return next(line[edge] for line in layout[pageno] if char_index < line[0])

        cursor_page, cursor_offset = 0, 0
        for paragraph in paragraphs:
            needle = paragraph_key(paragraph)
            if not needle:
                continue
            markers = [f"[{n - 1}]" for n in paragraph.footnotes]
            needles = [needle]
            # Word may position a superscript without marking it in the PDF, so
            # also accept the exact cited digits where the manuscript puts them.
            for count in range(1, len(markers) + 1):
                needles.extend(paragraph_key(paragraph, keep) for keep in combinations(markers, count))
            for pageno in range(cursor_page, len(pages)):
                offset = cursor_offset if pageno == cursor_page else 0
                match = next((found for candidate in needles
                              if (found := split_match(candidate, pages, pageno, offset)) is not None), None)
                if match is not None:
                    located[paragraph.key] = pageno + 1
                    start, cursor_page, cursor_offset = match
                    anchors[paragraph.key] = (
                        (pageno + 1, y_position(pageno, start, 1)),
                        (cursor_page + 1, y_position(cursor_page, cursor_offset - 1, 2)),
                    )
                    break
            else:
                unplaced.append(f"{paragraph.key} {paragraph.text[:145]}")
        if unplaced:
            raise ValueError("Unplaced DOCX paragraphs:\n" + "\n".join(unplaced))
        unplaced = image_pages(doc, docx, pymupdf, paragraphs, located, anchors)
        if unplaced:
            raise ValueError("Unplaced DOCX image paragraphs:\n" + "\n".join(unplaced))
        last_page = 0
        for paragraph in paragraphs:
            if paragraph.key in located:
                if located[paragraph.key] < last_page:
                    raise ValueError(f"Nonmonotonic PDF page at {paragraph.key}")
                last_page = located[paragraph.key]
            elif paragraph.text and not is_separator(paragraph):
                raise ValueError(f"Unplaced DOCX paragraph: {paragraph.key} {paragraph.text}")
        return located


def check_inventory(paragraphs, notes, overrides):
    inventory = image_inventory(paragraphs, notes)
    if set(inventory) != set(overrides):
        raise ValueError(f"Arabic coverage differs: {inventory.keys() ^ overrides.keys()}")
    for key, item in inventory.items():
        if any(overrides[key].get(k) != v for k, v in item.items()):
            raise ValueError(f"Stale image metadata: {key}")



def convert(paragraphs, notes, overrides, located):
    check_inventory(paragraphs, notes, overrides)
    # The only attribution in the title matter is the printed author line.
    book = {
        "id": BOOK_ID, "title": paragraphs[0].text, "author": "Bediüzzaman Said Nursî",
        "credits": [p.text for p in paragraphs[2:4]], "sections": [],
    }
    previous_page = 0
    for p in paragraphs:
        title = title_text(p)
        section_title = title if title in ("DESTELLOS", *DESTELLOS, "Una Súplica") else {
            "p7": "Introducción", "p3268": "Oración final",
        }.get(p.key)
        if section_title is not None:
            section = {"id": f"s{len(book['sections']) + 1}", "title": section_title, "blocks": []}
            book["sections"].append(section)

        blocks = block_for(p, overrides, 1 if title == section_title else heading_level(p))
        for note_id in p.footnotes:
            # One note block per Word reference. Preserve paragraph breaks inside it.
            note_spans = [{"t": "text", "text": f"[{note_id - 1}] "}]
            for note_p in notes[note_id]:
                line = spans(note_p.parts, overrides)
                if line:
                    if len(note_spans) > 1:
                        note_spans.append({"t": "text", "text": "\n"})
                    note_spans.extend(line)
            blocks.append({"type": "note", "spans": note_spans})
        if not blocks:
            continue

        page = located[p.key]
        if page != previous_page:
            blocks.insert(0, {"type": "pageBreak"})
            previous_page = page
        for block in blocks:
            block_id = f"{section['id']}-b{len(section['blocks']) + 1}"
            section["blocks"].append({"id": block_id, **block, "page": page})

    if tuple(section["title"] for section in book["sections"]) != SECTION_TITLES:
        raise ValueError("Unexpected section boundaries")
    return book


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docx", nargs="?", type=Path, default=DOCX)
    parser.add_argument("--pdf", type=Path, default=PDF)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "assets/books")
    args = parser.parse_args()
    if not args.pdf.is_file():
        parser.error(f"Word PDF is required for page references: {args.pdf}")
    paragraphs, notes = read_docx(args.docx)
    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8"))
    check_inventory(paragraphs, notes, overrides)
    located = locate_pages(paragraphs, args.docx, args.pdf)
    book = convert(paragraphs, notes, overrides, located)
    write_json(args.output_dir / f"{BOOK_ID}.json", book)
    print(f"{len(book['sections'])} sections, {len(overrides)} Arabic occurrences")


if __name__ == "__main__":
    main()
