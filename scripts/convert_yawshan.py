#!/usr/bin/env python3
"""Convert Yawshan with source-checked Arabic and original manuscript crops."""
import argparse
from collections import Counter
from dataclasses import dataclass
import hashlib
import html
import json
from pathlib import Path
import re
import unicodedata as ud

import pymupdf

from convert_meal import ROOT, NUMBER, add_block, json_bytes, page_lines, pinned_pdf, text_spans

PDF = Path.home() / "Desktop/kitaplar/DOC-20260720-WA0023_260720_140751.pdf"
SHA256 = "fd2cfcd00db17bb0d20540676eba24edfcd404a4cefd9db9de27fd3bd77b09ca"
CORPUS = (Path.home() / "Desktop/Risale-i Nur/Risale-i-Nur-Külliyatı Markdown"
          / "obsidian-markdown")
ONLINE = ROOT / "assets/books/yawshan-wikisource.txt"
ONLINE_URL = "https://ar.wikisource.org/?oldid=496858"
ONLINE_LICENSE = "CC BY-SA 4.0"
ONLINE_HASH = "ccbca90d16562acf76366b6e4a92f7289e2727edf72b0e48dc116b88af5d4f08"
SCAN = ROOT / "scripts/arabic_overrides_yawshan_scan.json"
SCAN_HASH = "760d0d33957540bab617e6e7b59c5f49d4a6f8b4f1be511562ba2eec2f65e0ac"
BOOK_ID = "yawshan-al-kabir"
TITLE = "Yawshan al-Kabir"
REFRAIN = re.compile(r"^(\d+)\.\s*¡Glorificado seas!")
CAP = re.compile(r"(?:<br\s*/?>|[۞§])")
ARABIC_CHUNK = re.compile(r"[\u0600-\u06ff\s]+")
ORTHOGRAPHY = str.maketrans("أإآٱىیھہک", "ااااييههك")


def skeleton(text):
    text = ud.normalize("NFKC", text).translate(ORTHOGRAPHY)
    return "".join(c for c in text if c != "ـ" and ud.category(c).startswith("L"))


def phrases(text):
    """Keep each source phrase's original spelling and vowels in NFC."""
    words = ud.normalize("NFC", " ".join(text.split())).split()
    start = 0
    for i, word in enumerate(words):
        if i > start and skeleton(word).startswith("يا"):
            yield " ".join(words[start:i])
            start = i
    if start < len(words):
        yield " ".join(words[start:])


def sources(corpus, online):
    raw = online.read_bytes()
    if hashlib.sha256(raw).hexdigest() != ONLINE_HASH:
        raise ValueError("Unexpected Wikisource revision contents")
    prayer = re.search(r"== كلمات الدعاء ==\s*(.*?)\n==", raw.decode(), re.S)[1]
    numbered = re.split(r"(?m)^\((\d+)\)\s*", prayer)
    online_index = {}
    for number, text in [(1, numbered[0]), *zip(map(int, numbered[1::2]), numbered[2::2])]:
        # The source's refrain differs and is kept as a crop.
        text = re.split(r"\s+سُبْحانَكَ", text, maxsplit=1)[0]
        online_index[number] = {skeleton(line): line for line in phrases(text)}
    if set(online_index) != set(range(1, 101)):
        raise ValueError("Expected all 100 parts in the Wikisource revision")

    if not corpus.is_dir():
        raise ValueError(f"Missing Turkish corpus: {corpus}")
    corpus_index = {}
    for path in sorted(corpus.rglob("*.md")):
        for number, source_line in enumerate(path.read_text().splitlines(), 1):
            for chunk in CAP.split(html.unescape(source_line)):
                for text in ARABIC_CHUNK.findall(chunk):
                    for line in phrases(text):
                        key = skeleton(line)
                        if len(key) >= 4:
                            corpus_index.setdefault(key, {
                                "text": line, "source": str(path.relative_to(corpus)),
                                "line": number, "kind": "corpus",
                            })
    return corpus_index, online_index


@dataclass
class ArabicLine:
    y: float
    bbox: pymupdf.Rect
    key: str
    refrain: bool


def glyph_rows(page):
    chars = []
    for trace in page.get_texttrace():
        color = trace["color"]
        red = isinstance(color, (list, tuple)) and color[0] > .7 and color[1] < .45
        for code, _, (x, y), bbox in trace["chars"]:
            char = chr(code)
            if y < 490 and (skeleton(char) or char == "\ufffd" and bbox[2] - bbox[0] > 4):
                chars.append((y, x, char, bbox, red))
    rows = []
    for char in sorted(chars):
        if not rows or abs(char[0] - rows[-1][0][0]) > 4:
            rows.append([])
        rows[-1].append(char)
    for row in rows:
        bbox = pymupdf.Rect(row[0][3])
        for char in row:
            bbox |= pymupdf.Rect(char[3])
        # Reverse the visual order before expanding ligatures and removing marks.
        key = "".join(skeleton(c[2]) or c[2] for c in sorted(row, key=lambda c: -c[1]))
        yield ArabicLine(row[0][0], bbox, key, sum(c[4] for c in row) > len(row) / 2)


def crop(page, rect, output_dir, name):
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(4, 4), clip=rect)
    (output_dir / name).write_bytes(pixmap.tobytes("jpeg", jpg_quality=90))
    return {"image": name, "imageSize": [pixmap.width, pixmap.height]}


def scanned_boxes(page):
    # Red-ink Arabic refrains identify both part ends on these five raster pages.
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(2, 2))
    samples = pixmap.samples
    rows = []
    for y in range(50, 975):
        red = 0
        for x in range(100, 585):
            i = (y * pixmap.width + x) * 3
            r, g, b = samples[i:i+3]
            red += r > 140 and g < r * .64 and b < r * .65
        if red > 16:
            rows.append(y / 2)
    clusters = []
    for y in rows:
        if not clusters or y - clusters[-1][-1] > 10:
            clusters.append([])
        clusters[-1].append(y)
    if len(clusters) != 2:
        raise ValueError(f"Could not locate two scanned refrains on PDF page {page.number + 1}")
    ends = [max(group) + 6 for group in clusters]
    return [pymupdf.Rect(49, start, 296, end)
            for start, end in zip([20, ends[0]], ends)]


def line_boundaries(page, rows):
    """Cut between the rendered glyphs, including marks above a line's baseline."""
    density = 3
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(density, density),
                            clip=pymupdf.Rect(55, 0, 290, 490))
    samples = pixmap.samples
    stride = pixmap.stride
    ink = [
        sum(pixel < 158 for pixel in samples[y * stride + 1:(y + 1) * stride:3])
        for y in range(pixmap.height)
    ]
    boundaries = [max(14, rows[0].y - 15)]
    for previous, following in zip(rows, rows[1:]):
        expected = (previous.y + (following.y - previous.y) * .22) * density
        candidates = range(round((previous.y - 1) * density),
                           round((following.y - 3) * density))
        cut = min(candidates, key=lambda y: (ink[y], abs(y - expected)))
        boundaries.append(cut / density)
    boundaries.append(min(490, rows[-1].y + 9))
    return boundaries


def arabic_parts(page, first, section_pair, target, corpus, online, provenance):
    folio = page.number
    if first >= 91:
        for section, rect in zip(section_pair, scanned_boxes(page), strict=True):
            fields = crop(page, rect, target, f"{section['id']}-scan.jpg")
            block = add_block(section, folio, "arabic", text="", unresolved=True, **fields)
            provenance.append({"kind": "image", "block": block["id"], "page": folio,
                               "pdfPage": folio + 1, "bbox": list(rect), "units": 1,
                               "scope": "scanned part"})
        return
    rows = list(glyph_rows(page))
    ends = [i + 1 for i, line in enumerate(rows)
            if line.refrain and line.key.startswith("سبحانك")]
    if len(ends) != 2 or ends[-1] != len(rows):
        raise ValueError(f"Unexpected Arabic part boundaries on folio {folio}: {ends}/{len(rows)}")
    boundaries = line_boundaries(page, rows)
    for i, section in enumerate(section_pair):
        start = 0 if i == 0 else ends[i - 1]
        end = ends[i]
        candidates = online[first + i]
        pending = []

        def flush():
            if not pending:
                return
            a, b = pending[0], pending[-1]
            rect = pymupdf.Rect(51, boundaries[a], 296, boundaries[b + 1])
            fields = crop(page, rect, target, f"{section['id']}-ar{a-start+1}.jpg")
            block = add_block(section, folio, "arabic", text="", unresolved=True, **fields)
            provenance.append({"kind": "image", "block": block["id"], "page": folio,
                               "pdfPage": folio + 1, "bbox": list(rect), "units": len(pending)})
            pending.clear()

        for j in range(start, end):
            key = rows[j].key
            match = corpus.get(key)
            if not match and key in candidates:
                match = {"kind": "online", "text": candidates[key], "source": ONLINE_URL,
                         "license": ONLINE_LICENSE, "part": first + i}
            if match and not rows[j].refrain:
                flush()
                block = add_block(section, folio, "arabic", text=match["text"])
                provenance.append({**match, "block": block["id"], "page": folio,
                                   "pdfPage": folio + 1, "skeleton": key,
                                   "bbox": list(rows[j].bbox), "units": 1})
            else:
                pending.append(j)
        flush()


def spanish(text):
    # Calibri glyph Ɵ represents the visible "ti" ligature in this PDF.
    return ud.normalize("NFKC", text).replace("Ɵ", "ti").strip()


def spanish_lines(page):
    return [text for line in page_lines(page)
            if (text := spanish("".join(s["text"] for s in line["spans"]
                                        if s["font"] != "ArialMT")))]


def spanish_parts(lines, first, section_pair, folio):
    parts = []
    paragraphs = []
    invocation = 0
    end = False
    for text in lines:
        if end and (not paragraphs or not text.startswith("protección")):
            parts.append(paragraphs)
            end, invocation, paragraphs = False, 0, []
        if match := REFRAIN.match(text):
            number = int(match[1])
            if invocation == 0 or number != first + len(parts):
                raise ValueError(f"Unexpected refrain {text} on folio {folio}")
            paragraphs.append(text)
            end = True
        elif match := NUMBER.match(text):
            number = int(match[1])
            if number != invocation + 1:
                raise ValueError(f"Unexpected invocation {text} on folio {folio}")
            invocation = number
            paragraphs.append(text)
        elif invocation:
            paragraphs[-1] += " " + text
        else:
            paragraphs.append(text)
    if not end:
        raise ValueError(f"Missing last refrain on folio {folio}")
    parts.append(paragraphs)
    for section, paragraphs in zip(section_pair, parts, strict=True):
        for text in paragraphs:
            add_block(section, folio, "paragraph", spans=text_spans(text))


def build(pdf, output_dir, corpus_root=CORPUS, online_path=ONLINE, scan_path=SCAN):
    corpus, online = sources(corpus_root, online_path)
    scan_bytes = scan_path.read_bytes()
    if hashlib.sha256(scan_bytes).hexdigest() != SCAN_HASH:
        raise ValueError("Unexpected checked scan transcription SHA-256")
    scan = json.loads(scan_bytes)
    if set(scan) != {"93", "95", "97", "99", "101"}:
        raise ValueError("Expected five checked Spanish scan transcriptions")
    output_dir.mkdir(parents=True, exist_ok=True)
    target = output_dir / BOOK_ID
    target.mkdir(exist_ok=True)
    sections, provenance = [], []
    with pinned_pdf(pdf, SHA256) as doc:
        if len(doc) != 106:
            raise ValueError("Expected 106 source pages")
        cover = {"id": "portada", "title": TITLE, "blocks": []}
        sections.append(cover)
        title, subtitle = spanish_lines(doc[0])
        add_block(cover, 1, "heading", level=1, text=title)
        add_block(cover, 1, "paragraph", spans=text_spans(subtitle))
        for number in range(1, 101, 2):
            pair = []
            for part in (number, number + 1):
                section = {"id": f"s{part}", "title": f"Parte {part}", "blocks": []}
                add_block(section, number, "heading", level=1, text=section["title"])
                pair.append(section)
            arabic_parts(doc[number], number, pair, target, corpus, online, provenance)
            translation = doc[number + 1]
            lines = scan.get(str(translation.number + 1)) or spanish_lines(translation)
            spanish_parts(lines, number, pair, translation.number)
            sections.extend(pair)
        for arabic_page, title in [(102, "Súplica"), (104, "Súplica final")]:
            section = {"id": f"s{len(sections)}", "title": title, "blocks": []}
            folio = arabic_page - 1
            add_block(section, folio, "heading", level=1, text=title)
            rect = pymupdf.Rect(47 if arabic_page == 102 else 52, 23, 301, 488 if arabic_page == 102 else 450)
            fields = crop(doc[folio], rect, target, f"{section['id']}.jpg")
            block = add_block(section, folio, "arabic", text="", unresolved=True, **fields)
            provenance.append({"kind": "image", "block": block["id"], "page": folio,
                               "pdfPage": arabic_page, "bbox": list(rect), "units": 1,
                               "scope": "supplication"})
            for line in spanish_lines(doc[arabic_page]):
                add_block(section, arabic_page, "paragraph", spans=text_spans(line))
            sections.append(section)
    book = {"id": BOOK_ID, "title": TITLE, "author": "", "credits": [], "sections": sections}
    (output_dir / f"{BOOK_ID}.json").write_bytes(json_bytes(book))
    (target / "provenance.json").write_bytes(json_bytes(provenance))
    return book, provenance


def counts(provenance):
    totals = Counter()
    for line in provenance:
        totals[line["kind"]] += line["units"]
    return totals


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path, nargs="?", default=PDF)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "assets/books")
    parser.add_argument("--corpus", type=Path, default=CORPUS)
    parser.add_argument("--online-source", type=Path, default=ONLINE)
    parser.add_argument("--scan", type=Path, default=SCAN)
    args = parser.parse_args()
    _, provenance = build(args.pdf, args.output_dir, args.corpus, args.online_source, args.scan)
    print(f"100 numbered parts; {dict(counts(provenance))}")


if __name__ == "__main__":
    main()
