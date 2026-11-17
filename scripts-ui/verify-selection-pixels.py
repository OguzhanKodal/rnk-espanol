"""Pillow pixel regression for the iPhone 16 Pro v5 captures (1206 × 2622).
Run: /path/to/pillow-venv/bin/python scripts-ui/verify-selection-pixels.py
Masks are seeded ONLY by known selection/handle blue, never by changed pixels.
"""
from pathlib import Path
import json
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / 'docs/ekran/v5'
PAIRS = [
    ('appear-real', '01-selection-off', '02-selection-on'),
    ('move-real', '02-selection-on', '03-handle-moved'),
    ('clear-real', '06-cycle-on', '07-cycle-cleared'),
    ('appear-fixture', '08-fixture-off', '09-fixture-on'),
    ('clear-fixture', '09-fixture-on', '10-fixture-cleared'),
]
results = []
for name, before, after in PAIRS:
    a = Image.open(ROOT / (before + '.png')).convert('RGB')
    b = Image.open(ROOT / (after + '.png')).convert('RGB')
    assert a.size == b.size
    # Exclude OS chrome and the absolute toolbar plus shadow; include the full
    # unobscured reading area, including subsequent paragraphs in the fixture.
    box = (0, 405, a.width, 1940)
    mask = Image.new('L', a.size)
    target = mask.load()
    for im in (a, b):
        for y in range(box[1], box[3]):
            xs = [x for x, colour in enumerate(im.crop((0, y, a.width, y + 1)).get_flattened_data())
                  if colour in {(169, 200, 233), (54, 107, 166)}]
            if xs:
                for x in range(min(xs), max(xs) + 1):
                    target[x, y] = 255
    # Fill glyph holes within blue runs; 4 px dilation covers edge antialiasing.
    mask = mask.filter(ImageFilter.MaxFilter(9))
    roi = Image.new('L', a.size)
    roi.paste(255, box)
    included = ImageChops.subtract(roi, mask)
    diff = Image.composite(ImageChops.difference(a, b), Image.new('RGB', a.size), included)
    count = sum(pixel != (0, 0, 0) for pixel in diff.get_flattened_data())
    compared = sum(pixel == 255 for pixel in included.get_flattened_data())
    diff.save(ROOT / (name + '-diff.png'))
    mask.save(ROOT / (name + '-mask.png'))
    # Also compare solid foreground glyph cores INSIDE the highlight. Exclude
    # only the handle overlay; blue fill is not excluded from this second check.
    def glyph_core(im):
        out = Image.new('1', im.size)
        out.putdata([v in {(53, 46, 38), (48, 41, 32)} for v in im.get_flattened_data()])
        return out.convert('L')
    handle = Image.new('L', a.size)
    handle.putdata([255 if v == (54, 107, 166) else 0 for v in b.get_flattened_data()])
    old_handle = Image.new('L', a.size)
    old_handle.putdata([255 if v == (54, 107, 166) else 0 for v in a.get_flattened_data()])
    handle = ImageChops.lighter(handle, old_handle).filter(ImageFilter.MaxFilter(9))
    glyph_diff = ImageChops.difference(glyph_core(a), glyph_core(b))
    glyph_diff = ImageChops.multiply(glyph_diff, ImageChops.subtract(roi, handle))
    glyph_count = sum(v != 0 for v in glyph_diff.get_flattened_data())
    glyph_diff.save(ROOT / (name + '-glyph-diff.png'))
    result = dict(pair=name, dimensions=a.size, roi=box, compared_pixels=compared,
                  changed_pixels=count, difference_bbox=diff.getbbox(), glyph_core_changed_pixels=glyph_count)
    results.append(result)
    print(result)
(ROOT / 'pixel-report.json').write_text(json.dumps(results, indent=2) + '\n')
assert all(r['changed_pixels'] == 0 and r['glyph_core_changed_pixels'] == 0 for r in results), 'Text moved or pixels changed outside selection'
# Term ends before comma and space; retain full-resolution crop for inspection.
im = Image.open(ROOT / '05-natural-wrapping-oscuro.png')
im.crop((58, 1088, 1126, 1204)).resize((2136, 232)).save(ROOT / '11-glossary-closeup.png')
