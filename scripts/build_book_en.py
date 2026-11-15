"""Convierte la traducción inglesa de Godley (Perseus, CC BY-SA 4.0) en JSON por libro.

Uso: python3 scripts/build_book_en.py tlg0016.tlg001.perseus-eng2.xml public/book
Fuente: github.com/PerseusDL/canonical-greekLit (data/tlg0016/tlg001)
"""
import json, re, sys
import xml.etree.ElementTree as ET

src, out = sys.argv[1], sys.argv[2]
NS = '{http://www.tei-c.org/ns/1.0}'
root = ET.parse(src).getroot()
SKIP_TYPES = ('continent', 'ocean', 'hemisphere', 'nation', 'sea', 'general region')
places = {}

def reg_info(reg):
    m = re.match(r'\s*(.*?)\s*\[(-?[\d.]+),\s*(-?[\d.]+)\]\s*\(([^)]*)\)', re.sub(r'\s+', ' ', reg or ''))
    if not m: return None
    lng, lat = float(m.group(2)), float(m.group(3))
    if not (-12 <= lng <= 82 and 8 <= lat <= 56): return None
    if m.group(4) in SKIP_TYPES: return None
    return lat, lng, m.group(4)

def walk(el, segs):
    """Aplana un elemento en segmentos: texto o [texto, idLugar]."""
    tag = el.tag.replace(NS, '')
    if tag == 'note': 
        if el.tail: segs.append(el.tail)
        return
    if tag == 'name' and el.get('type') == 'place':
        reg = el.find(NS + 'reg'); pn = el.find(NS + 'placeName')
        info = reg_info(reg.text if reg is not None else '')
        if pn is not None:
            label = ''.join(pn.itertext())
        else:
            # Variante sin <placeName>: el nombre va tras <reg>
            label = (el.text or '') + ''.join((c.tail or '') if c.tag == NS + 'reg' else ''.join(c.itertext()) + (c.tail or '') for c in el)
        label = re.sub(r'\s+', ' ', label).strip()
        key = (el.get('key') or '').replace('tgn,', '')
        if info and label and key:
            places.setdefault(key, [label, round(info[0], 3), round(info[1], 3), info[2]])
            segs.append([label, key])
        elif label:
            segs.append(label)
        if el.tail: segs.append(el.tail)
        return
    if tag == 'reg':
        if el.tail: segs.append(el.tail)
        return
    if el.text: segs.append(el.text)
    for ch in el: walk(ch, segs)
    if el.tail: segs.append(el.tail)

def tidy(segs):
    res = []
    for s in segs:
        if isinstance(s, str):
            s = re.sub(r'\s+', ' ', s)
            if res and isinstance(res[-1], str): res[-1] += s
            else: res.append(s)
        else: res.append(s)
    res = [re.sub(r' {2,}', ' ', s) if isinstance(s, str) else s for s in res]
    if res and isinstance(res[0], str): res[0] = res[0].lstrip()
    if res and isinstance(res[-1], str): res[-1] = res[-1].rstrip()
    return [s for s in res if s != '']

for book in root.iter(NS + 'div'):
    if book.get('subtype') != 'Book': continue
    chapters = []
    for ch in book.findall(NS + 'div'):
        if ch.get('subtype') != 'chapter': continue
        segs = []
        for sec in ch: walk(sec, segs); segs.append(' ')
        segs = tidy(segs)
        ids = []
        for s in segs:
            if not isinstance(s, str) and s[1] not in ids: ids.append(s[1])
        chapters.append({'n': ch.get('n'), 's': segs, 'p': ids})
    json.dump({'chapters': chapters}, open(f'{out}/en/{book.get("n")}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    print('book', book.get('n'), 'chapters', len(chapters))
json.dump(places, open(f'{out}/places.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('places', len(places))
