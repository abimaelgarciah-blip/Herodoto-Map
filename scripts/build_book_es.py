"""Genera el texto español (traducción de Bartolomé Pou, s. XVIII, dominio público) por libro.

Parte del OCR página a página de la edición digital (una página por archivo pNNNN.txt) y
alinea los capítulos con la numeración estándar apoyándose en la longitud de los capítulos
de la edición inglesa, porque el OCR lee mal muchos numerales romanos.

Uso: python3 scripts/build_book_es.py <dir_ocr> public/book
"""
import glob, json, math, re, sys

ocr, out = sys.argv[1], sys.argv[2]
pages = {int(f[-8:-4]): open(f, encoding='utf-8').read() for f in glob.glob(ocr + '/p*.txt')}
STARTS = [18, 183, 330, 478, 618, 723, 828, 998, 1106]
END = 1212
MARK = re.compile(r'(?m)^[ \t]*([IVXLClT1Y]{1,9})[ ]?[\.,:;]{1,2}[ \t]+(?=[A-ZÁÉÍÓÚÑ¿¡—«"\'])')

def roman(s):
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}; t = 0
    for i, c in enumerate(s):
        t += -v[c] if i + 1 < len(s) and v[s[i + 1]] > v[c] else v[c]
    return t

def clean(t):
    t = re.sub(r'(?m)^\s*\d{1,4}\s*$', '', t)          # números de página
    t = re.sub(r'-\n\s*', '', t)                        # palabras partidas
    return re.sub(r'\s+', ' ', t).strip()

for b, st in enumerate(STARTS, 1):
    en_end = STARTS[b] if b < 9 else END
    txt = '\n'.join(pages[p] for p in range(st, en_end))
    marks = list(MARK.finditer(txt))
    # Antes de la primera marca: título, argumento (líneas largas, letra pequeña) y, a veces, el capítulo I
    pre = txt[:marks[0].start()].split('\n')
    k = 0
    for i in range(2, len(pre) - 2):
        block = [l for l in pre[i:i + 4] if l.strip()]
        if len(block) >= 3 and all(len(l) < 56 for l in block) and not pre[i].startswith('—'):
            k = i; break
    summary = clean('\n'.join(pre[2:k] if k else pre[2:]))
    segs = []
    first = clean('\n'.join(pre[k:])) if k else ''
    if len(first) > 200: segs.append((None, first))
    for i, m in enumerate(marks):
        z = marks[i + 1].start() if i + 1 < len(marks) else len(txt)
        r = m.group(1).replace('l', 'I').replace('1', 'I').replace('T', 'I').replace('Y', 'V')
        try: n = roman(r)
        except Exception: n = None
        segs.append((n, clean(txt[m.end():z])))

    # Capítulos estándar y sus lugares, de la edición inglesa (8A, 8B… cuentan como 8)
    en = json.load(open(f'{out}/en/{b}.json'))['chapters']
    E = {}
    for c in en:
        n = int(re.match(r'\d+', c['n']).group())
        e = E.setdefault(n, [0, []])
        e[0] += sum(len(s if isinstance(s, str) else s[0]) for s in c['s'])
        e[1] += [i for i in c['p'] if i not in e[1]]
    N = max(E); el = [E[j][0] for j in range(1, N + 1)]; sl = [len(t) for _, t in segs]; S = len(segs)
    ratio = sum(sl) / sum(el)
    MOVES = {(1, 1): 0, (2, 1): 3, (1, 2): 3, (1, 3): 6, (3, 1): 6}
    INF = float('inf')
    cost = [[INF] * (N + 1) for _ in range(S + 1)]; back = [[None] * (N + 1) for _ in range(S + 1)]
    cost[0][0] = 0
    for i in range(S + 1):
        for j in range(N + 1):
            if cost[i][j] == INF: continue
            for (a, c), pen in MOVES.items():
                if i + a > S or j + c > N: continue
                d = math.log((sum(sl[i:i + a]) + 60) / (ratio * sum(el[j:j + c]) + 60))
                v = cost[i][j] + 4 * d * d + pen - (2.5 if segs[i][0] == j + 1 else 0)
                if v < cost[i + a][j + c]: cost[i + a][j + c] = v; back[i + a][j + c] = (a, c)
    i, j, path = S, N, []
    while i or j:
        a, c = back[i][j]; path.append((i - a, a, j - c, c)); i -= a; j -= c
    chapters = []; odd = 0
    for i, a, j, c in reversed(path):
        if (a, c) != (1, 1): odd += 1
        ids = []
        for q in range(j + 1, j + c + 1): ids += [x for x in E[q][1] if x not in ids]
        chapters.append({'n': str(j + 1) if c == 1 else f'{j + 1}–{j + c}', 't': ' '.join(t for _, t in segs[i:i + a]), 'p': ids})
    json.dump({'summary': summary, 'chapters': chapters}, open(f'{out}/es/{b}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f'libro {b}: {S} segmentos -> {len(chapters)} entradas ({N} capítulos), {odd} uniones, ratio {ratio:.2f}')
