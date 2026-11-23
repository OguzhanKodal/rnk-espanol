#!/usr/bin/env python3
"""Strict content-schema.md validator plus source/coverage and determinism checks.
Pure stdlib by default. --pdf additionally reruns the converter twice (PyMuPDF).
--source-root optionally verifies Arabic strings against the local Turkish corpus.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
ROOT=Path(__file__).resolve().parents[1]

def check(ok,message):
    if not ok:raise ValueError(message)
def keys(x,required,optional=()):
    check(isinstance(x,dict),'Expected object')
    check(set(required)<=set(x)<=set(required)|set(optional),f'Unexpected keys: {x.keys()}')
def string(x):check(isinstance(x,str) and bool(x.strip()),'Expected nonempty string')
def integer(x):check(type(x)==int and x>0,'Expected positive integer')
def arabic(x):
    if 'unresolved' in x:check(x['unresolved'] is True and x['text']=='','Invalid unresolved Arabic')
    else: string(x['text']);check(bool(re.search('[\u0600-\u06ff]',x['text'])),'Arabic script missing')
    if 'imageSize' in x:  # book blocks only; override records also carry 'image'
        size=x.get('imageSize')
        check(x.get('unresolved') is True and (ROOT/'assets/books/los-destellos'/x['image']).is_file()
              and isinstance(size,list) and len(size)==2 and all(type(n)==int and n>0 for n in size),
              f"Invalid manuscript image {x['image']}")
def main():
    from convert_docx import BOOK_ID, DOCX, PDF
    from validate_destellos import validate_destellos

    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--pdf',action='store_true');ap.add_argument('--source-root',type=Path);ap.add_argument('--docx',type=Path);ap.add_argument('--destellos-pdf',type=Path,default=PDF);args=ap.parse_args()
    load=lambda p:json.loads((ROOT/p).read_text())
    cat=load('assets/books/catalog.json');keys(cat,['books']);check(len(cat['books'])==10,'Catalog needs ten entries');ids=set();books={}
    for c in cat['books']:
        keys(c,['id','title','shelf','available'],['coverColor']);string(c['id']);string(c['title']);check(c['id'] not in ids,'Duplicate catalog id');ids.add(c['id']);check(c['shelf'] in ['coran','coleccion','breves'],'Invalid shelf');check(type(c['available'])==bool,'Invalid available')
        if 'coverColor'in c:check(bool(re.fullmatch('#[0-9a-fA-F]{6}',c['coverColor'])),'Invalid color')
        if not c['available']:continue
        if c['id']=='el-coran':
            check((ROOT/'assets/quran/quran.json').is_file(),'Missing separate Quran dataset')
            continue
        b=load(f'assets/books/{c["id"]}.json');books[b['id']]=b;keys(b,['id','title','author','credits','sections']);check(b['id']==c['id'],'Catalog/book id mismatch')
        if b['id'] == BOOK_ID:
            continue
        for k in ['id','title','author']:string(b[k])
        check(isinstance(b['credits'],list) and len(b['credits'])>5,'Missing credits')
        for t in b['credits']:string(t)
        check(len(b['sections'])==3,'Three tracts expected');pages=[];ar=[];text=[]
        for i,s in enumerate(b['sections'],1):
            keys(s,['id','title','blocks']);check(s['id']==f's{i}','Section id');string(s['title'])
            for j,x in enumerate(s['blocks'],1):
                t=x['type'];base=['id','type','page'];check(x['id']==f's{i}-b{j}','Unstable block id');integer(x['page']);check(5<=x['page']<=92,'Wrong printed page')
                if t=='pageBreak':keys(x,base);pages.append(x['page'])
                elif t=='heading':
                    keys(x,base+['level','text']);check(x['level'] in [1,2,3],'Heading level');string(x['text']);text.append(x['text'])
                elif t=='arabic':keys(x,base+['text'],['unresolved','image','imageSize']);arabic(x);ar.append(x)
                elif t in ['paragraph','note']:
                    keys(x,base+['spans']);check(isinstance(x['spans'],list) and bool(x['spans']),'Empty spans')
                    for sp in x['spans']:
                        keys(sp,['t','text'],['unresolved','image','imageSize'] if sp['t']=='arabic' else [])
                        if sp['t']=='arabic':arabic(sp);ar.append(sp)
                        else:check(sp['t'] in ['text','bold','italic'],'Invalid span');string(sp['text'])
                    text.append(''.join(sp['text'] for sp in x['spans']))
                else:raise ValueError('Unknown block type '+t)
        check(pages==list(range(5,93)),'Printed pageBreak coverage')
        alltext='\n'.join(text);check('\ufffd' not in alltext,'Extraction replacement character');check('SOBRE EL MES DE RAMADÁN' not in alltext,'Running footer leaked');check('atardecer' in alltext and 'atar- decer' not in alltext,'Hyphen repair')
    b=books['ramadan-frugalidad-agradecimiento']
    overrides=load('scripts/arabic_overrides.json');check(len(ar)==len(overrides),'Arabic count differs from overrides')
    from collections import Counter
    check(Counter(x['text'] for x in ar)==Counter(x['text'] for x in overrides.values()),'Arabic content differs from overrides')
    for key,a in overrides.items():
        if args.source_root:
            source=args.source_root/a['source'];check(hashlib.sha256(source.read_bytes()).hexdigest()==a['source_sha256'],'Source hash changed')
            line=source.read_text().splitlines()[a['line']-1].replace('<br/>','\n').replace(' § ',' ')
            check(all(part in line for part in a['text'].split('\n')),'Arabic not copied from source '+key)
    glossary=[]
    # The current app no longer ships the glossary (8e940d1).
    if (ROOT/'assets/glossary.json').is_file():
        glossary=load('assets/glossary.json');check(40<=len(glossary)<=120,'Glossary size')
        for g in glossary:
            keys(g,['term','variants','definition','verified']);string(g['term']);string(g['definition']);check(g['verified'] is False,'Glossary requires human review');check(isinstance(g['variants'],list) and bool(g['variants']),'Missing variants')
            for v in g['variants']:string(v);check(v in alltext,'Variant absent '+v)
    quotes=load('assets/frases.json');check(15<=len(quotes)<=25,'Quote count')
    for q in quotes:
        keys(q,['text','section','page']);string(q['text']);integer(q['page'])
        candidates=[x for s in b['sections'] if s['id']==q['section'] for x in s['blocks'] if x['page']==q['page']]
        check(any(q['text'] in x.get('text',''.join(y['text'] for y in x.get('spans',[]))) for x in candidates),'Quote not verbatim '+q['text'])
    if args.pdf:
        tmp=ROOT/'scripts/.tmp';tmp.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=tmp) as d:
            cmd=[sys.executable,str(ROOT/'scripts/convert_book.py'),'--output-dir',d]
            subprocess.run(cmd,check=True);first={p.name:p.read_bytes() for p in Path(d).glob('*.json')};subprocess.run(cmd,check=True)
            for p in Path(d).glob('*.json'):
                check(first[p.name]==p.read_bytes()==(ROOT/'assets/books'/p.name).read_bytes(),'Nondeterministic or stale output')
        # Every filled vector path on a content page must belong to an override,
        # except the decorative rosette on p51 (y121–133), visually inspected.
        import pymupdf
        doc=pymupdf.open(ROOT/'content-src/ramadan-frugalidad-agradecimiento.pdf')
        # Independent conservation check over all Spanish body characters.
        original=[];converted=[]
        for pg in doc[4:92]:
            for block in pg.get_text('dict',flags=11)['blocks']:
                for line in block.get('lines',[]):
                    if line['bbox'][1]<409:
                        original.extend(sp['text'] for sp in line['spans'] if 'Barla' not in sp['font'])
        for section in b['sections']:
            for block in section['blocks']:
                if block['type']=='heading':converted.append(block['text'])
                else:converted.extend(sp['text'] for sp in block.get('spans',[]) if sp['t']!='arabic')
        normalized=lambda values:Counter(re.sub(r'[\s\-\ufffd*]','',''.join(values)))
        check(normalized(original)==normalized(converted),'Spanish body characters lost or added')
        for n in range(5,93):
            boxes=[pymupdf.Rect(a['bbox'])+(-.02,-.02,.02,.02) for k,a in overrides.items() if k.startswith(f'{n}:')]
            for draw in doc[n-1].get_drawings():
                if draw['fill'] is None:continue
                r=draw['rect']
                if n==51 and 120<r.y0<134:continue
                check(any(box.contains(r) for box in boxes),f'Unaccounted vector glyph: page {n}, {r}')
    print(f'PASS: {len(pages)} printed pages, {len(ar)} Arabic ({sum(not a.get("unresolved") for a in ar)} resolved), {len(glossary)} glossary entries, {len(quotes)} verbatim quotes')
    if BOOK_ID in books or args.docx is not None or DOCX.is_file():
        validate_destellos(args.docx or DOCX, args.destellos_pdf, args.source_root, books.get(BOOK_ID))
if __name__=='__main__':main()
