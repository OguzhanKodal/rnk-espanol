#!/usr/bin/env python3
"""Check the meal rebuild, verse coverage and every source footnote occurrence."""
import argparse
from collections import Counter
import json
from pathlib import Path
import re

from convert_meal import BOOK_ID, NUMBER, PDF, REF, ROOT, build, json_bytes, read_source


def validate(pdf, books, quran):
    generated = build(pdf)
    if (books / f"{BOOK_ID}.json").read_bytes() != json_bytes(generated):
        raise ValueError("Meal JSON differs from rebuild")
    suras = json.loads(quran.read_text())["suras"]
    sections = generated["sections"]
    if len(sections) != len(suras) or len(suras) != 114:
        raise ValueError("Expected 114 suras")
    _, entries, notes = read_source(pdf)
    emitted = Counter()
    verses = 0
    for section, sura in zip(sections, suras, strict=True):
        numbers = []
        preceding = None
        for block in section["blocks"]:
            text = block.get("text") or "".join(span["text"] for span in block["spans"])
            if re.search(r"[﴾﴿]|(?:\b[A-ZÑÁÉÍÓÚ] ){5}[A-ZÑÁÉÍÓÚ]\b|\ufffd", text):
                raise ValueError(f"Running header or replacement character in {block['id']}")
            if block["type"] == "note":
                number = int(REF.match(text)[1])
                emitted[block["page"], number] += 1
                if preceding is None or str(number) not in REF.findall(preceding):
                    raise ValueError(f"Detached footnote {block['id']}")
            else:
                preceding = text
                if block["type"] == "paragraph" and (match := NUMBER.match(text)):
                    numbers.append(int(match[1]))
        if numbers != list(range(1, sura[2] + 1)):
            raise ValueError(f"Incorrect verse sequence in {section['id']}")
        verses += len(numbers)
    references = [key for entry in entries for key in entry.refs]
    if verses != 6236 or emitted != Counter(notes.keys()) or any(
        emitted[key] != 1 for key in references
    ):
        raise ValueError("Incorrect verse or footnote coverage")
    print(f"PASS: meal rebuild byte-identical; 114 suras, {verses} consecutive verses, "
          f"{len(references)} references resolved by {len(notes)} footnotes; no running headers")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", type=Path, default=PDF)
    parser.add_argument("--books", type=Path, default=ROOT / "assets/books")
    parser.add_argument("--quran", type=Path, default=ROOT / "assets/quran/quran.json")
    args = parser.parse_args()
    validate(args.pdf, args.books, args.quran)
