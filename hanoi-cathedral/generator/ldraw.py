"""Minimal LDraw library helpers: file lookup, geometry bounding boxes, MPD packing."""
import os, functools
import numpy as np

LIB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ldraw')
SEARCH = ['parts', 'p', 'parts/s', 'p/48', 'p/8', 'models', '']


def find(name):
    name = name.replace('\\', '/').lower()
    for d in SEARCH:
        p = os.path.join(LIB, d, name)
        if os.path.exists(p):
            return p
    # case-insensitive fallback
    for d in SEARCH:
        base = os.path.join(LIB, d)
        dn, fn = os.path.split(os.path.join(base, name))
        if os.path.isdir(dn):
            for f in os.listdir(dn):
                if f.lower() == fn:
                    return os.path.join(dn, f)
    raise FileNotFoundError(name)


def read_lines(name):
    with open(find(name), encoding='utf-8', errors='replace') as f:
        return f.read().splitlines()


def description(name):
    for l in read_lines(name):
        l = l.strip()
        if l.startswith('0 '):
            return l[2:].strip()
    return name


@functools.lru_cache(maxsize=None)
def points(name):
    """All polygon vertices of a file (recursively), as Nx3 array in file coords."""
    pts = []
    for l in read_lines(name):
        t = l.split()
        if not t:
            continue
        if t[0] == '1' and len(t) >= 15:
            v = list(map(float, t[2:14]))
            pos = np.array(v[0:3]); m = np.array(v[3:12]).reshape(3, 3)
            try:
                sub = points(' '.join(t[14:]))
            except FileNotFoundError:
                continue
            if len(sub):
                pts.append(sub @ m.T + pos)
        elif t[0] in ('3', '4'):
            n = int(t[0])
            pts.append(np.array(list(map(float, t[2:2 + 3 * n]))).reshape(n, 3))
    if not pts:
        return np.zeros((0, 3))
    a = np.vstack(pts)
    # thin out to keep recursion cheap: keep only bbox-relevant hull-ish points
    if len(a) > 4000:
        a = np.unique(np.round(a, 1), axis=0)
    return a


def bbox(name):
    p = points(name)
    return p.min(axis=0), p.max(axis=0)


def deps(name, seen=None):
    """Return ordered list of all files referenced by name (recursively), excluding name."""
    if seen is None:
        seen = {}
    for l in read_lines(name):
        t = l.split()
        if t and t[0] == '1' and len(t) >= 15:
            sub = ' '.join(t[14:]).replace('\\', '/').lower()
            if sub not in seen:
                try:
                    find(sub)
                except FileNotFoundError:
                    continue
                seen[sub] = True
                deps(sub, seen)
    return seen


def pack(main_name, main_text, part_names, extra_files=None):
    """Build a self-contained MPD: main model text + every dependency as 0 FILE sections."""
    out = [f'0 FILE {main_name}', main_text.rstrip('\n')]
    for n, txt in (extra_files or {}).items():
        out += ['', f'0 FILE {n}', txt.rstrip('\n')]
    allf = {}
    for p in part_names:
        p = p.lower()
        allf[p] = True
        deps(p, allf)
    for f in allf:
        out += ['', f'0 FILE {f}']
        out += read_lines(f)
    return '\n'.join(out) + '\n'
