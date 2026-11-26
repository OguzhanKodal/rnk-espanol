#!/usr/bin/env python3
"""Render the complete scanned Yasin and Yawshan booklet as local JPEG assets."""
import argparse
from pathlib import Path

from convert_meal import ROOT, json_bytes, pinned_pdf

PDF = Path.home() / "Desktop/kitaplar/cevsen.pdf"
SHA256 = "7392333fc96c23e8de1e135c269293d2f55de5194f04a7433372d0db4b235ac6"
BOOK_ID = "yasin-yawshan-caligrafia"
TITLE = "Yasin y Yawshan al-Kabir (caligrafía)"


def build(pdf, output_dir):
    target = output_dir / BOOK_ID
    target.mkdir(parents=True, exist_ok=True)
    pages = []
    total = 0
    with pinned_pdf(pdf, SHA256) as doc:
        if len(doc) != 61:
            raise ValueError("Expected 61 scanned pages")
        for number, page in enumerate(doc, 1):
            image = f"page-{number:03d}.jpg"
            # The scan itself is 946px wide; retain its resolution and color.
            pixmap = page.get_pixmap(dpi=300)
            jpeg = pixmap.tobytes("jpeg", jpg_quality=85)
            (target / image).write_bytes(jpeg)
            total += len(jpeg)
            pages.append({"id": f"page-{number}", "image": image,
                          "imageSize": [pixmap.width, pixmap.height]})
    book = {"id": BOOK_ID, "title": TITLE, "author": "", "credits": [],
            "sections": [], "kind": "pages", "pages": pages}
    (output_dir / f"{BOOK_ID}.json").write_bytes(json_bytes(book))
    return book, total


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path, nargs="?", default=PDF)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "assets/books")
    args = parser.parse_args()
    book, total = build(args.pdf, args.output_dir)
    print(f"{len(book['pages'])} scanned pages, {total / 1_000_000:.2f} MB")


if __name__ == "__main__":
    main()
