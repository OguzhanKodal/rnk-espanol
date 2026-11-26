#!/usr/bin/env python3
"""Convert the eight pinned Word PDF exports into the reader's book schema."""

import argparse
from collections import Counter
from dataclasses import dataclass, field
from hashlib import sha256
import json
from pathlib import Path
import re
import unicodedata

import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[1]
PDF_ROOT = Path.home() / "Desktop/kitaplar"
CORPUS_ROOT = (Path.home() / "Desktop/Risale-i Nur"
               / "Risale-i-Nur-Külliyatı Markdown/obsidian-markdown")
AUTHOR = "Bediüzzaman Said Nursî"
TEXT_FLAGS = (fitz.TEXTFLAGS_DICT & ~fitz.TEXT_PRESERVE_IMAGES
              & ~fitz.TEXT_PRESERVE_LIGATURES)
ARABIC = re.compile(r"[\u0600-\u06ff\ufb50-\ufdff\ufe70-\ufefc]")
ARABIC_RUN = re.compile(
    r"[\u0600-\u06ff\ufb50-\ufdff\ufe70-\ufefc]"
    r"(?:[\u0600-\u06ff\ufb50-\ufdff\ufe70-\ufefc\d .،؛!؟-]*"
    r"[\u0600-\u06ff\ufb50-\ufdff\ufe70-\ufefc])?"
)
# The reader represents bold and italic as alternatives. For a face with both
# flags, use italic (typically these are transliterated expressions).
SUPERSCRIPT, ITALIC, BOLD = 1, 2, 16


@dataclass(frozen=True)
class Source:
    file: str
    id: str
    title: str
    pages: int
    digest: str


SOURCES = (
    Source("Ego", "tratado-sobre-el-ego-y-el-atomo", "Tratado sobre el Ego y el Átomo", 19,
           "817010c2ae8d14dbfe5fc291b42d6c4d138e68dd0a8d5e991d3ceb2806f917b8"),
    Source("Enfermos", "tratado-sobre-los-enfermos", "Tratado sobre los Enfermos", 27,
           "d98a7aab1140cde7294b503a7d019fe6a5bdb9f049c2a38307ac17baee623180"),
    Source("Hermandad", "tratado-sobre-la-hermandad", "Tratado sobre la Hermandad", 18,
           "541cd2f48601fcbc4eb66f1abc211d4639787775cfb9cebcf2d6b87edff81487"),
    Source("La guía del servicio", "la-guia-del-servicio", "La Guía del Servicio", 107,
           "71e0f02fc7d7966958a9721914bacea0617e6c7b7724c2f8ce094fc477fe8a96"),
    Source("Milagros", "la-carta-diecinueve", "La Carta Diecinueve", 95,
           "905ffd840101affc34cdee628ad6f539df17e3b4b624afbaefe7a452855efa08"),
    Source("Naturaleza", "tratado-sobre-la-naturaleza", "Tratado Sobre la Naturaleza", 17,
           "a69dc47fc152c634dcb96d5b2920e40f82ec09ec74bcc2248480f78d89d76e73"),
    Source("Palabras Pequeñas", "palabras-pequenas", "Palabras Pequeñas", 33,
           "7842ca1e1a6697c8cf34d40fbdaea0308927ed86f0819d81679b7c23d6a568a6"),
    Source("Resurrección", "tratado-sobre-la-resurreccion", "Tratado sobre la Resurrección", 56,
           "221b00c72f67bfcbb20b8be740f11e5175bc14f0cdc6c10f30706c3d6bcac9c2"),
)

# Each pair was reviewed against the line endings. Other wraps ending in a
# hyphen keep that glyph (transliterations, names and printed punctuation).
DISCRETIONARY = {
    ("sobera-", "nía"), ("elec-", "ción"), ("Nom-", "bres"),
    ("Determi-", "nación"), ("Misericor-", "dioso"),
}
DISCRETIONARY_RETAIN_SPACE = {("Ascensión-", "cuando")}
# Word stored these quotations as two separate pictures over consecutive
# lines. For 18:4 and 18:5 it also placed the last word before the rest.
CONNECTED_QUOTES = {("Milagros", 13): ("13:1", "13:2"),
                    ("Milagros", 18): ("18:4", "18:5")}
FOOTNOTE_REFS = {
    ("Milagros", 59, "6"),
}
MAJOR = re.compile(
    r"(?i)^(?:Palabra (?:Uno|Dos|Tres|Cuatro|Cinco|Seis|Siete|Ocho|Nueve)|"
    r"(?:LA )?(?:PRIMERA?|SEGUND[OA]|TERCERA?|CUART[OA]|QUINT[OA]|SEXT[OA]|"
    r"S[ÉE]PTIM[OA]|OCTAV[OA]|NOVEN[OA]|(?:UN|DUO)?D[ÉE]CIM[OA][A-ZÁÉÍÓÚ]*|"
    r"VIG[ÉE]SIM[OA](?: [A-ZÁÉÍÓÚ]+)?) (?:REMEDIO|SEÑAL SUTIL|VERDAD)|"
    r"(?:Primer|Segundo) (?:Tema|Objetivo)|"
    r"En cuanto al (?:Primer|Segundo|Tercer|Cuarto) Camino|"
    r"(?:Introducción|Conclusión|Un recordatorio)|"
    r"La Primera Estación de la Palabra Veintiuno|"
    r".+ Parte del Apéndice|De La Palabra Diez|Los Milagros de Muhammad .+|"
    r"La Carta Diecisiete|El Segundo Destello|El Apéndice del Destello Veinticinco|"
    r"Sobre El Milagro De La División De La Luna|Un Don Divino y Una Marca Del Favor de Allah|"
    r"La Respuesta a una Pregunta Confidencial|Un Punto Significativo y un Misterio Importante|"
    r"El Ojo de la Obstinación Cree que un Ángel es Satanás|Un asunto instructivo)$"
)


def nfc(value):
    return unicodedata.normalize("NFC", value)


def resolve_path(base, relative):
    for part in Path(relative).parts:
        matches = [p for p in base.iterdir() if nfc(p.name) == nfc(part)]
        if len(matches) != 1:
            raise ValueError(f"Expected one match for {part!r} under {base}, got {matches}")
        base = matches[0]
    return base


def open_source(pdf_root, source):
    path = resolve_path(pdf_root, f"{source.file} (TERMINADO).pdf")
    if sha256(path.read_bytes()).hexdigest() != source.digest:
        raise ValueError(f"PDF SHA-256 mismatch: {path}")
    doc = fitz.open(path)
    if len(doc) != source.pages or fitz.VersionBind != "1.28.2":
        raise ValueError("Expected the pinned page count and PyMuPDF 1.28.2")
    return doc


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(json_bytes(data))


def json_bytes(data):
    return (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


@dataclass
class Item:
    key: str
    bbox: fitz.Rect
    data: dict
    raw: str = ""
    offset: int = 0

    @property
    def x(self):
        return self.bbox.x0


@dataclass
class Line:
    page: int
    baseline: float
    items: list[Item] = field(default_factory=list)
    small: bool = False

    @property
    def text(self):
        return "".join(item.data.get("text", "") for item in self.items).strip()

    @property
    def x0(self):
        return min(item.bbox.x0 for item in self.items)

    @property
    def x1(self):
        return max(item.bbox.x1 for item in self.items)

    @property
    def all_bold(self):
        return all(item.data["t"] == "bold" or not item.data.get("text", "").strip()
                   for item in self.items)


def get_style(flags):
    if flags & ITALIC:
        return "italic"
    return "bold" if flags & BOLD else "text"


def read_page(page, source):
    """Return PDF rows with stable child ids and the ignored whitespace inventory."""
    number = page.number + 1
    lines, excluded, images = [], {}, {}
    extracted = page.get_text("rawdict", flags=TEXT_FLAGS)["blocks"]
    for block in extracted:
        for index, line in enumerate(block["lines"], 1):
            spans = [(s, "".join(c["c"] for c in s["chars"])) for s in line["spans"]]
            key = f"{number}/l{block['number']}.{index}"
            visible = [s for s, text in spans if text.strip()]
            if not visible:
                excluded[key] = "whitespace-only PDF line"
                continue
            anchor = max(visible, key=lambda s: s["size"])
            baseline = anchor["origin"][1]
            small = anchor["size"] < 11
            row = next((r for r in reversed(lines) if abs(r.baseline - baseline) < 1.25), None)
            if row is None:
                row = Line(number, baseline, small=small)
                lines.append(row)
            else:
                row.small &= small
            for span_index, (span, value) in enumerate(spans, 1):
                if not value:
                    continue
                span_key = f"{key}.{span_index}"
                box = fitz.Rect(span["bbox"])
                if value.strip().isdigit() and not small and (
                    span["flags"] & SUPERSCRIPT
                ) or (value.strip().isdigit() and span["font"] == "ArialMT"
                      and (source.file, number, value.strip()) in FOOTNOTE_REFS):
                    row.small = False
                    row.items.append(Item(span_key, box, {"t": "ref", "text": value.strip()}, value))
                    continue
                begin = 0
                for match in ARABIC_RUN.finditer(value):
                    if match.start() > begin:
                        row.items.append(Item(span_key, character_box(span, begin, match.start()),
                                              {"t": get_style(span["flags"]),
                                               "text": value[begin:match.start()]},
                                              value[begin:match.start()], begin))
                    arabic_key = f"{span_key}.a{match.start()}"
                    crop = character_box(span, match.start(), match.end())
                    if crop.is_empty:
                        excluded[arabic_key] = "zero-width mark at the edge of an embedded image"
                    else:
                        row.items.append(Item(span_key, crop, {"t": "asset", "key": arabic_key}, match.group(), match.start()))
                        images[arabic_key] = (crop, [], match.group())
                    begin = match.end()
                if begin < len(value):
                    row.items.append(Item(span_key, character_box(span, begin, len(value)),
                                          {"t": get_style(span["flags"]), "text": value[begin:]}, value[begin:], begin))
    # Word places pictures as separate PDF objects, including when inline.
    # Their bottom edge sits just below the baseline of the host text.
    for parts in image_groups(page, lines, source):
        key = parts[0][0]
        box = fitz.Rect()
        for _, bounds, _ in parts:
            box |= bounds
        images[key] = (box, parts, None)
        candidates = [
            row for row in lines if -2 <= box.y1 - row.baseline <= 6
            and all(min(box.x1, item.bbox.x1) - max(box.x0, item.x) < 1.75
                    for item in row.items if item.data.get("text", "").strip())
        ]
        if candidates:
            row = min(candidates, key=lambda r: abs(box.y1 - r.baseline - 2))
        else:
            row = Line(number, box.y1 - 2)
            lines.append(row)
        row.items.append(Item(key, box, {"t": "asset", "key": key}))
    if source.file == "Milagros" and number == 59:
        # Note 6 is printed on the right edge of a three-line Arabic quotation.
        marker, = [r for r in lines if r.text == "6"]
        target, = [r for r in lines if any(it.data.get("key") == "59:5" for it in r.items)]
        if marker is not target:
            target.items.extend(marker.items)
            lines.remove(marker)
    for row in lines:
        row.items.sort(key=lambda item: item.x)
    ordered = sorted(lines, key=lambda r: r.baseline)
    return list(split_heading_prefixes(ordered)), excluded, images


def split_heading_prefixes(rows):
    """Word prints the fifth sign and the twelve aspects as run-in headings."""
    for row in rows:
        if row.small or len(row.items) < 2:
            yield row
            continue
        prefix, *rest = row.items
        text = prefix.data.get("text", "").strip()
        is_aspect = re.fullmatch(r"[A-ZÁÉÍÓÚ ]+ ASPECTO:", text)
        if prefix.data["t"] == "bold" and (text == "QUINTA SEÑAL SUTIL:" or is_aspect):
            yield Line(row.page, row.baseline, [prefix])
            yield Line(row.page, row.baseline, rest)
        else:
            yield row


def image_groups(page, lines, source):
    """Coalesce image fragments displayed as one quotation in Word."""
    images = sorted(page.get_image_info(xrefs=True), key=lambda im: (im["bbox"][1], im["bbox"][0]))
    groups = []
    for i, image in enumerate(images, 1):
        box = fitz.Rect(image["bbox"])
        item = (f"{page.number + 1}:{i}", box, image["xref"])
        touching = [group for group in groups
                    if any(same_image_line(box, other, lines) for _, other, _ in group)]
        if not touching:
            groups.append([item])
            continue
        parts = touching[0]
        parts.append(item)
        for group in touching[1:]:
            parts.extend(group)
            groups.remove(group)
    known = CONNECTED_QUOTES.get((source.file, page.number + 1))
    if known:
        first, second = (next(group for group in groups if group[0][0] == key)
                         for key in known)
        first.extend(second)
        groups.remove(second)
    return groups


def same_image_line(left, right, lines):
    if (left & right).get_area() > 0.25:
        return True
    if abs(left.y1 - right.y1) > 2.5:
        return False
    left, right = sorted((left, right), key=lambda box: box.x0)
    if not 0 <= right.x0 - left.x1 <= 10:
        return False
    gap = fitz.Rect(left.x1, min(left.y0, right.y0), right.x0, max(left.y1, right.y1))
    return not any((item.bbox & gap).get_area() > 3 for row in lines for item in row.items
                   if item.data.get("text", "").strip())


def character_box(span, start, stop):
    box = fitz.Rect()
    for char in span["chars"][start:stop]:
        box |= fitz.Rect(char["bbox"])
    return box


def row_kind(row):
    if row.text:
        return "small" if row.small else "body"
    return "asset"


def heading_level(row, source, at_start, following):
    text = row.text
    if text == source.title:
        return 1
    if any(it.data["t"] == "asset" for it in row.items):
        return None
    if not row.all_bold:
        # A centered remedy heading can include a superscript.
        if not all(it.data["t"] in ("bold", "ref") or not it.data["text"].strip()
                   for it in row.items):
            return None
    if re.fullmatch(r"(?i)(?:de la Colección Risale-i Nur|Bediüzzaman Said Nursi)", text):
        return None
    text = re.sub(r"\d+$", "", text).strip().rstrip(":")
    centered = abs((row.x0 + row.x1) / 2 - 298) < 12
    if MAJOR.fullmatch(text):
        return 2
    if re.fullmatch(r"[A-ZÁÉÍÓÚ ]+ ASPECTO", text):
        return 3
    if at_start and centered and len(text) < 125 and (
        following is None or following.page != row.page
        or following.baseline - row.baseline > 18
        or (following.x0 > 78 and following.x1 > 533)
    ):
        return 3
    return None


def new_paragraph(previous, row):
    if previous is None:
        return True
    # The manuscript uses 35pt indents, with some 32pt exceptions. Centered
    # wrapped paragraphs lack indents and follow the normal baseline pitch.
    if row.page != previous.page:
        return (row.x0 >= 77 or row.baseline > 98
                or (previous.x1 < 525 and re.search(r'[.!?…\]”»]"?$', previous.text)))
    gap = row.baseline - previous.baseline
    if gap > 19:
        return True
    if not row.text or not previous.text:
        return True
    # A new indented line ends a justified paragraph. Centered lines whose
    # baseline pitch stays constant can be wraps in the same paragraph.
    if 82 <= row.x0 <= 102 and (row.x1 >= 530 or previous.x0 < 70):
        return True
    return False


def span_data(row, assets):
    for item in row.items:
        part = item.data
        if part["t"] == "ref":
            yield {"t": "text", "text": f"[{part['text']}]"}
        elif part["t"] == "asset":
            yield {"t": "arabic", **assets[part["key"]]}
        else:
            yield dict(part)


def trim_spans(spans):
    for part in spans:
        if part["t"] == "arabic":
            break
        part["text"] = part["text"].lstrip()
        if part["text"]:
            break
    for part in reversed(spans):
        if part["t"] == "arabic":
            break
        part["text"] = part["text"].rstrip()
        if part["text"]:
            break
    return [part for part in spans if part["text"] or part["t"] == "arabic"]


def wrap_separator(left, right):
    lword = re.search(r"[\w-]+-$", left)
    rword = re.match(r"[\w-]+", right)
    if not lword or not rword:
        return " ", False
    pair = lword.group(), rword.group()
    if pair in DISCRETIONARY:
        return "", True
    if pair in DISCRETIONARY_RETAIN_SPACE:
        return " ", False
    return "", False


def append_spans(spans, incoming, separator=" "):
    if spans and incoming and separator == " " and spans[-1]["t"] != "arabic" and incoming[0]["t"] != "arabic":
        separator, drop = wrap_separator(spans[-1]["text"], incoming[0]["text"])
        if drop:
            spans[-1]["text"] = spans[-1]["text"][:-1]
    if spans and incoming and separator:
        incoming.insert(0, {"t": spans[-1]["t"] if spans[-1]["t"] != "arabic" else "text",
                            "text": separator})
    for part in incoming:
        if spans and part["t"] != "arabic" and spans[-1]["t"] == part["t"]:
            spans[-1]["text"] += part["text"]
        else:
            spans.append(part)


def image_png(page, box, parts, words):
    """Render a 4× crop, suppressing overlapping text objects in a scratch PDF."""
    matrix = fitz.Matrix(4, 4)
    if parts and any((box & word).get_area() > 4 for word in words):
        with fitz.open() as scratch:
            scratch.insert_pdf(page.parent, from_page=page.number, to_page=page.number,
                               links=False, annots=False)
            copy = scratch[0]
            copy.add_redact_annot(box, fill=False, cross_out=False)
            copy.apply_redactions(images=0, graphics=0, text=0)
            return copy.get_pixmap(matrix=matrix, clip=box)
    return page.get_pixmap(matrix=matrix, clip=box)


def transparent_png(pix):
    """The reader tints the ink. Convert the paper luminance to transparency."""
    gray = fitz.Pixmap(fitz.csGRAY, pix)
    alpha = gray.samples.translate(bytes(reversed(range(256))))
    transparent = fitz.Pixmap(fitz.csRGB, pix.width, pix.height,
                              bytes(4 * pix.width * pix.height), True)
    transparent.set_alpha(alpha, premultiply=0)
    return transparent.tobytes("png")


@dataclass
class Build:
    book: dict
    images: dict = field(default_factory=dict)
    table: dict = field(default_factory=dict)
    inventory: dict = field(default_factory=dict)
    witnesses: dict = field(default_factory=dict)
    refs: Counter = field(default_factory=Counter)
    note_ids: Counter = field(default_factory=Counter)


def make_assets(page, pdf_assets, decisions, result, lines):
    assets = {}
    contexts = {
        item.data["key"]: " ".join(filter(None, (lines[index - 1].text if index else "",
                                                row.text,
                                                lines[index + 1].text if index + 1 < len(lines) else "")))[:360]
        for index, row in enumerate(lines) for item in row.items if item.data["t"] == "asset"
    }
    words = [fitz.Rect(word[:4]) for word in page.get_text("words", flags=TEXT_FLAGS)] if pdf_assets else []
    for key, (box, parts, _) in pdf_assets.items():
        record = {"bbox": list(box), "context": contexts[key]}
        if parts:
            record["objects"] = [part[0] for part in parts]
        decision = decisions.get(key, {})
        if decision.get("confidence") in ("high", "medium"):
            assets[key] = {"text": decision["text"]}
            result.table[key] = {**record, **decision}
            continue
        name = "p" + key.replace(":", "-").replace("/", "-").replace(".", "-") + ".png"
        pix = image_png(page, box, parts, words)
        asset = {"text": "", "unresolved": True, "image": name, "imageSize": [pix.width, pix.height]}
        result.images[name] = transparent_png(pix)
        ornament = decision.get("confidence") == "ornament"
        result.table[key] = {**record, "confidence": "ornament" if ornament else "image",
                             "reason": decision.get("reason", "No verified corpus transcription"),
                             **asset}
        assets[key] = asset
    return assets


def partition_notes(rows, ref_numbers, open_note):
    body, notes = [], []
    note_id = open_note
    in_notes = False
    for row in rows:
        match = re.match(r"^(\d+)(?![\d-])", row.text) if row.small else None
        if match and match[1] in ref_numbers:
            note_id = match[1]
            in_notes = True
            notes.append((note_id, row, True))
        elif note_id is not None and (row.small or (in_notes and row_kind(row) == "asset")):
            # Notes can continue onto the next physical page, below body type.
            in_notes = True
            notes.append((note_id, row, False))
        else:
            if in_notes:
                raise ValueError(f"Body after footnote on page {row.page}: {row.text}")
            body.append(row)
    return body, notes


def convert(doc, source, decisions):
    result = Build({"id": source.id, "title": source.title, "author": AUTHOR,
                    "credits": [], "sections": []})
    rows_by_page = {}
    assets = {}
    for page in doc:
        number = page.number + 1
        rows, excluded, images = read_page(page, source)
        rows_by_page[number] = rows
        result.inventory[number] = {"excluded": excluded,
                                    "items": [item for row in rows for item in row.items]}
        assets.update(make_assets(page, images, decisions, result, rows))
    if set(decisions) - assets.keys():
        raise ValueError(f"Unknown Arabic occurrence ids: {set(decisions) - assets.keys()}")
    result.refs.update(it.data["text"] for rows in rows_by_page.values()
                       for row in rows for it in row.items if it.data["t"] == "ref")
    body, note_rows = [], {}
    open_note = None
    for number, rows in rows_by_page.items():
        text_rows, notes = partition_notes(rows, result.refs, open_note)
        body.extend(text_rows)
        open_note = notes[-1][0] if notes else None
        for note_id, row, starts in notes:
            if starts:
                result.note_ids[note_id] += 1
            note_rows.setdefault(note_id, []).append(row)

    blocks = []
    previous, paragraph = None, None
    for i, row in enumerate(body):
        next_row = body[i + 1] if i + 1 < len(body) else None
        start = new_paragraph(previous, row)
        level = heading_level(row, source, start, next_row)
        values = trim_spans(list(span_data(row, assets)))
        if not values:
            raise ValueError(f"Empty source row: {row}")
        rendered = "".join(p["text"] for p in values)
        if row.page == 1 and re.fullmatch(r"(?i)(?:de la Colección Risale-i Nur|Bediüzzaman Said Nursi)", rendered):
            result.book["credits"].append(rendered)
        if all(p["t"] == "arabic" for p in values):
            items = [item for item in row.items if item.data["t"] == "asset"]
            for index, (part, item) in enumerate(zip(values, items, strict=True)):
                source_keys = [item.key]
                if index == 0:
                    source_keys.extend(it.key for it in row.items if it.data["t"] != "asset")
                blocks.append((row.page, row.baseline, {"type": "arabic",
                               **{k: v for k, v in part.items() if k != "t"}}, [row], source_keys))
            paragraph = None
        elif level:
            blocks.append((row.page, row.baseline,
                           {"type": "heading", "level": level, "text": rendered}, [row],
                           [item.key for item in row.items]))
            paragraph = None
        else:
            if start or paragraph is None:
                kind = "note" if rendered.startswith("[") and not re.match(r"^\[\d+\]", rendered) else "paragraph"
                paragraph = (row.page, row.baseline, {"type": kind, "spans": []}, [], [])
                blocks.append(paragraph)
            paragraph[3].append(row)
            paragraph[4].extend(it.key for it in row.items)
            append_spans(paragraph[2]["spans"], values)
        previous = row

    for note_id, rows in note_rows.items():
        spans = []
        for i, row in enumerate(rows):
            values = trim_spans(list(span_data(row, assets)))
            if not i:
                if not re.match(r"^\d+", values[0]["text"]):
                    raise ValueError(f"Missing note label: {source.file} {row.page}: {row.text}")
                values[0]["text"] = re.sub(r"^\d+\s*", f"[{note_id}] ", values[0]["text"], count=1)
            if i and row.x0 > 84 and rows[i - 1].text.endswith((".", ":", "”", ")")):
                separator = "\n"
            else:
                separator = " "
            append_spans(spans, values, separator)
        # Follow Destellos when the citing paragraph and note start on the
        # same page. Otherwise place the note on its actual starting page.
        anchor = next(((p, y) for p, y, _, refs, _ in blocks for r in refs
                       if any(it.data == {"t": "ref", "text": note_id} for it in r.items)), None)
        baseline = anchor[1] if anchor and anchor[0] == rows[0].page else rows[0].baseline
        blocks.append((rows[0].page, baseline, {"type": "note", "spans": spans}, rows,
                       [it.key for row in rows for it in row.items]))

    if result.refs != result.note_ids:
        raise ValueError(f"{source.file}: missing notes {result.refs - result.note_ids}; "
                         f"missing references {result.note_ids - result.refs}")
    previous_page = 0
    sections = result.book["sections"]
    for page, _, block, rows, item_keys in sorted(blocks, key=lambda b: (b[0], b[1])):
        if not sections or (block["type"] == "heading" and block["level"] == 2):
            title = block["text"] if block["type"] == "heading" else source.title
            sections.append({"id": f"s{len(sections) + 1}", "title": title, "blocks": []})
        section = sections[-1]
        for number in range(previous_page + 1, page + 1):
            emit(section, number, {"type": "pageBreak"})
        previous_page = page
        block_id = emit(section, page, block)
        result.witnesses[block_id] = (rows, item_keys)
    for number in range(previous_page + 1, len(doc) + 1):
        emit(sections[-1], number, {"type": "pageBreak"})
    return result


def emit(section, page, block):
    block_id = f"{section['id']}-b{len(section['blocks']) + 1}"
    section["blocks"].append({"id": block_id, **block, "page": page})
    return block_id


def load_decisions(override_dir, source):
    path = override_dir / f"arabic_overrides_{source.id}.json"
    if not path.exists():
        return {}
    return {key: {k: v for k, v in value.items() if k not in ("bbox", "context", "objects")}
            for key, value in json.loads(path.read_text()).items()}


def write_build(result, output_dir, override_dir):
    book_id = result.book["id"]
    write_json(output_dir / f"{book_id}.json", result.book)
    image_dir = output_dir / book_id
    if result.images:
        image_dir.mkdir(parents=True, exist_ok=True)
    for name, data in result.images.items():
        (image_dir / name).write_bytes(data)
    for old in image_dir.glob("p[0-9]*.png"):
        if old.name not in result.images and re.fullmatch(r"p[0-9]+-(?:[0-9]+|l[0-9.-]+a[0-9]+)\.png", old.name):
            old.unlink()
    write_json(override_dir / f"arabic_overrides_{book_id}.json", result.table)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf-root", type=Path, default=PDF_ROOT)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "assets/books")
    parser.add_argument("--override-dir", type=Path, default=ROOT / "scripts")
    parser.add_argument("--book", choices=[source.id for source in SOURCES])
    args = parser.parse_args()
    for source in SOURCES:
        if args.book and args.book != source.id:
            continue
        with open_source(args.pdf_root, source) as doc:
            result = convert(doc, source, load_decisions(args.override_dir, source))
        write_build(result, args.output_dir, args.override_dir)
        print(f"{source.id}: {source.pages} pages, {len(result.witnesses) + source.pages} blocks, "
              f"{len(result.note_ids)} footnotes, {dict(Counter(a['confidence'] for a in result.table.values()))}")


if __name__ == "__main__":
    main()
