#!/usr/bin/env python3
"""Rebuild the scanned book and compare both the manifest and its JPEG assets."""
import argparse
from pathlib import Path
from tempfile import TemporaryDirectory

from convert_calligraphy import BOOK_ID, PDF, ROOT, build


def validate(pdf, books):
    with TemporaryDirectory() as directory:
        rebuilt = Path(directory)
        book, total = build(pdf, rebuilt)
        files = [Path(f"{BOOK_ID}.json")]
        files.extend(Path(BOOK_ID) / page["image"] for page in book["pages"])
        for relative in files:
            if (rebuilt / relative).read_bytes() != (books / relative).read_bytes():
                raise ValueError(f"Calligraphy rebuild differs: {relative}")
    if total > 15_000_000:
        raise ValueError("Scanned assets exceed 15 MB")
    print(f"PASS: calligraphy rebuild byte-identical; {len(book['pages'])} pages, "
          f"{total / 1_000_000:.2f} MB of JPEGs")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", type=Path, default=PDF)
    parser.add_argument("--books", type=Path, default=ROOT / "assets/books")
    args = parser.parse_args()
    validate(args.pdf, args.books)
