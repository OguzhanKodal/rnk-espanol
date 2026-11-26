#!/usr/bin/env python3
"""Recheck the sourced Arabic and compare the book, provenance and crops."""
import argparse
from pathlib import Path
from tempfile import TemporaryDirectory

from convert_yawshan import (
    BOOK_ID, CORPUS, NUMBER, ONLINE, PDF, REFRAIN, ROOT, SCAN, build, counts, skeleton,
)


def validate(pdf, books, corpus, online, scan):
    with TemporaryDirectory() as directory:
        rebuilt = Path(directory)
        book, provenance = build(pdf, rebuilt, corpus, online, scan)
        for path in [rebuilt / f"{BOOK_ID}.json", *(rebuilt / BOOK_ID).iterdir()]:
            relative = path.relative_to(rebuilt)
            if path.read_bytes() != (books / relative).read_bytes():
                raise ValueError(f"Yawshan rebuild differs: {relative}")
    parts = book["sections"][1:-2]
    if [s["id"] for s in parts] != [f"s{i}" for i in range(1, 101)]:
        raise ValueError("Incorrect part sequence")
    invocations = 0
    for number, part in enumerate(parts, 1):
        paragraphs = ["".join(s["text"] for s in block["spans"])
                      for block in part["blocks"] if block["type"] == "paragraph"]
        refrain = REFRAIN.match(paragraphs[-1])
        if not refrain or int(refrain[1]) != number:
            raise ValueError(f"Missing numbered refrain in part {number}")
        numbers = [int(match[1]) for text in paragraphs[:-1] if (match := NUMBER.match(text))]
        if not numbers or numbers != list(range(1, len(numbers) + 1)):
            raise ValueError(f"Incorrect invocation sequence in part {number}")
        invocations += len(numbers)
    inventory = {entry["block"]: entry for entry in provenance}
    blocks = [block for section in book["sections"] for block in section["blocks"]
              if block["type"] == "arabic"]
    if len(blocks) != len(inventory) or len(inventory) != len(provenance):
        raise ValueError("Arabic inventory differs from book")
    for block in blocks:
        entry = inventory[block["id"]]
        if entry["kind"] == "image":
            if block["text"] or not block.get("unresolved") or not block.get("image"):
                raise ValueError(f"Invalid image fallback at {block['id']}")
        elif block["text"] != entry["text"] or skeleton(block["text"]) != entry["skeleton"]:
            raise ValueError(f"Unverified Arabic at {block['id']}")
    totals = counts(provenance)
    print(f"PASS: Yawshan rebuild byte-identical; 100 parts, {invocations} Spanish invocations; "
          f"Arabic: {totals['corpus']} corpus, {totals['online']} Wikisource, "
          f"{totals['image']} fallback units in "
          f"{sum(p['kind'] == 'image' for p in provenance)} crops")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", type=Path, default=PDF)
    parser.add_argument("--books", type=Path, default=ROOT / "assets/books")
    parser.add_argument("--corpus", type=Path, default=CORPUS)
    parser.add_argument("--online-source", type=Path, default=ONLINE)
    parser.add_argument("--scan", type=Path, default=SCAN)
    args = parser.parse_args()
    validate(args.pdf, args.books, args.corpus, args.online_source, args.scan)
