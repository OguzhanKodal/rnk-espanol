#!/usr/bin/env python3
"""Deterministic conversion of the Nur Ediciones PDF. Requires PyMuPDF 1.28.2.
Run: scripts/.venv/bin/python scripts/convert_book.py
Arabic is outlined (not encoded text) in this PDF; curated source-linked bounding
boxes in arabic_overrides.json supply Unicode. See docs/content-report.md.
"""
import argparse
import json
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
BOOK_ID = 'ramadan-frugalidad-agradecimiento'
TITLE = 'Ramadán, Frugalidad y Agradecimiento'

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def text_of(line):
    return ''.join(s['text'] for s in line['spans']).strip()

def style(s):
    if 'Bold' in s['font'] or s.get('flags', 0) & 16:
        return 'bold'
    if 'Italic' in s['font'] or s.get('flags', 0) & 2:
        return 'italic'
    return 'text'

def append(spans, incoming, separator=''):
    if spans and separator:
        if spans[-1]['t']=='arabic':
            spans.append(dict(t='text',text=separator))
        else:
            spans[-1]['text'] += separator
    for s in incoming:
        if not s['text'] and s.get('t') != 'arabic':
            continue
        if spans and s['t'] != 'arabic' and spans[-1]['t'] == s['t']:
            spans[-1]['text'] += s['text']
        else:
            spans.append(dict(s))

def convert(pdf, overrides):
    doc = pymupdf.open(pdf)
    credit_lines = sorted([l for b in doc[1].get_text('dict', flags=11)['blocks'] for l in b.get('lines', [])], key=lambda l:l['bbox'][1])
    credits = [text_of(l) for l in credit_lines if text_of(l)]
    book = dict(id=BOOK_ID, title=TITLE, author='Bediüzzaman Said Nursî', credits=credits, sections=[])
    titles = {5:'Sobre el Mes de Ramadán', 25:'Destello Diecinueve — Sobre la Frugalidad', 52:'Tratado Sobre el Agradecimiento'}
    used = set()
    for pdf_index in range(4, 92):
        page = doc[pdf_index]
        lines = [l for b in page.get_text('dict', flags=11)['blocks'] for l in b.get('lines', []) if text_of(l)]
        footer = ' '.join(text_of(l) for l in lines if l['bbox'][1] > 409)
        numbers = re.findall(r'\b\d+\b', footer)
        if not numbers:
            raise ValueError(f'No printed page footer at PDF page {pdf_index+1}')
        printed = int(numbers[-1])
        if printed in titles:
            section = dict(id=f's{len(book["sections"])+1}', title=titles[printed], blocks=[])
            book['sections'].append(section)
        blocks = section['blocks']
        def emit(kind, **kwargs):
            block = dict(id=f'{section["id"]}-b{len(blocks)+1}', type=kind, **kwargs, page=printed)
            blocks.append(block)
            return block
        carry = next((b for b in reversed(blocks) if b['type']=='paragraph'), None)
        emit('pageBreak')
        lines = [l for l in lines if l['bbox'][1] < 409 and not any('Barla' in s['font'] for s in l['spans'])]
        entries = []
        for line in lines:
            spans = []
            for s in sorted(line['spans'], key=lambda s:s['bbox'][0]):
                if s['text'].strip():
                    append(spans, [dict(t=style(s), text=s['text'].replace('\ufffd-', '-'))])
            entries.append(dict(bbox=list(line['bbox']), spans=spans, footnote=any(s['font'].startswith('NewCenturySchlbk') for s in line['spans'])))
        for key, a in overrides.items():
            if int(key.split(':')[0]) != printed:
                continue
            used.add(key)
            sp = dict(t='arabic', text=a['text'])
            if a.get('unresolved'):
                sp.update(text='', unresolved=True)
            box = a['bbox']
            if a['inline']:
                cy=(box[1]+box[3])/2
                candidates=[e for e in entries if e['bbox'][1]-4 <= cy <= e['bbox'][3]+4]
                if not candidates:
                    raise ValueError(f'Inline Arabic without Spanish baseline: {key}')
                # A PDF gap separates the left/right Spanish lines. Merge in physical LTR
                # order, placing the RTL span at its actual position within the sentence.
                candidates.sort(key=lambda e:e['bbox'][0])
                combined=[];placed=False
                for e in candidates:
                    if not placed and e['bbox'][0]>box[0]:
                        append(combined,[sp], ' ' if combined else '');placed=True
                    cleaned=[dict(s, text=s['text'].strip()) for s in e['spans']]
                    append(combined,cleaned,' ' if combined else '')
                    entries.remove(e)
                if not placed:append(combined,[sp],' ')
                entries.append(dict(bbox=[min([box[0]]+[e['bbox'][0] for e in candidates]),min(e['bbox'][1] for e in candidates),max([box[2]]+[e['bbox'][2] for e in candidates]),max(e['bbox'][3] for e in candidates)],spans=combined))
            else:
                entries.append(dict(bbox=box,arabic=sp))
        entries.sort(key=lambda e:(e['bbox'][1],e['bbox'][0]))
        current=None;previous=None;note=False
        for entry_index, e in enumerate(entries):
            if 'arabic' in e:
                sp=e['arabic'];emit('arabic',**{k:v for k,v in sp.items() if k!='t'});current=None;previous=None;continue
            spans=e['spans'];text=''.join(s['text'] for s in spans).strip()
            if not text or text=='***':
                current=None;previous=None;continue
            spans[0]['text']=spans[0]['text'].lstrip() if spans[0]['t']!='arabic' else spans[0]['text']
            if spans[-1]['t']!='arabic':spans[-1]['text']=spans[-1]['text'].rstrip()
            heading=bool(re.fullmatch(r'(?:Primer|Segundo|Tercer|Cuarto|Quinto|Sexto|Séptimo|Octavo|Noveno) Punto',text,re.I) or re.fullmatch(r'(?:PRIMER|SEGUNDO|TERCER|CUARTO|QUINTO|SEXTO|SÉPTIMO|OCTAVO|NOVENO) PUNTO:',text) or text.startswith('LA QUINTA FRASE:') or text=='Un tevafuk extraordinario e instructivo' or (printed==25 and text=='Sobre la Frugalidad'))
            if heading:
                if any(s['t']=='arabic' for s in spans):
                    # heading contract has plain text; retain adjacent Arabic separately.
                    title=''.join(s['text'] for s in spans if s['t']!='arabic').strip();emit('heading',level=2,text=title)
                    for s in spans:
                        if s['t']=='arabic':emit('arabic',text=s['text'].replace('\ufffd-', '-'))
                else:emit('heading',level=2,text=text)
                current=None;previous=None;continue
            if printed==62 and 80<e['bbox'][1]<115:
                if blocks[-1]['type']=='heading':blocks[-1]['text']+=' '+text
                else:emit('heading',level=2,text=text)
                current=None;previous=None;continue
            indent=e['bbox'][0]>44
            gap=e['bbox'][1]-previous['bbox'][3] if previous else 99
            delta=e['bbox'][1]-previous['bbox'][1] if previous else 99
            start=current is None or (indent and not note and delta>15.5) or gap>12
            if entry_index==0 and e['bbox'][0]<44 and carry is not None:
                current=carry;start=False
            # Bracketed introductory note uses a fixed inset on every wrapped line.
            if text.startswith('['):start=True;note=True
            footnote=e.get('footnote',False)
            if footnote and (current is None or current['type']!='note'):start=True
            if not footnote and current is not None and current['type']=='note' and not note:start=True
            if start:
                current=emit('note' if note or footnote else 'paragraph',spans=[])
            sep=' ' if current['spans'] else ''
            if current['spans'] and current['spans'][-1]['text'].endswith('-') and re.match(r'^[A-Za-zÁÉÍÓÚÑÜáéíóúñü]',spans[0]['text']):
                tail=current['spans'][-1]['text']
                if re.match(r'^[a-záéíóúñü]',spans[0]['text']) and not tail.endswith(('al-', 'pre-', 'post-')):
                    current['spans'][-1]['text']=tail[:-1]
                sep=''
            append(current['spans'],spans,sep)
            previous=e
            if note and text.endswith(']'):note=False;current=None
    if set(overrides)!=used:raise ValueError(f'Unused overrides: {set(overrides)-used}')
    return book

def catalog():
    catalog_path = ROOT / 'assets/books/catalog.json'
    if catalog_path.is_file():
        return json.loads(catalog_path.read_text(encoding='utf-8'))
    entries=[(BOOK_ID,TITLE,'breves',True),('el-coran','El Corán','coran',False),('el-coran-significado','El Corán – Significado en español','coran',False),('las-palabras','Las Palabras','coleccion',False),('las-cartas','Las Cartas','coleccion',False),('los-destellos','Los Destellos','coleccion',False),('los-rayos','Los Rayos','coleccion',False),('el-masnawi-nuriye','El Masnawi Nuriye','coleccion',False),('el-fruto-de-la-fe','El Fruto de la Fe','breves',False),('guia-para-la-juventud','Guía para la Juventud','breves',False)]
    return {'books':[dict(id=i,title=t,shelf=s,available=a) for i,t,s,a in entries]}

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--pdf',type=Path,default=ROOT/'content-src'/f'{BOOK_ID}.pdf');ap.add_argument('--output-dir',type=Path,default=ROOT/'assets/books');args=ap.parse_args()
    overrides=json.loads((ROOT/'scripts/arabic_overrides.json').read_text())
    book=convert(args.pdf,overrides);write_json(args.output_dir/f'{BOOK_ID}.json',book);write_json(args.output_dir/'catalog.json',catalog())
    print(f'{len(book["sections"])} sections, {sum(len(s["blocks"]) for s in book["sections"])} blocks, {len(overrides)} Arabic occurrences')
if __name__=='__main__':main()
