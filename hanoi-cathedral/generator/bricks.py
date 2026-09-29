"""Fill arbitrary cell sets with standard bricks / plates / tiles, staggering joints."""

BRICK = {(1, 1): '3005', (1, 2): '3004', (1, 3): '3622', (1, 4): '3010', (1, 6): '3009', (1, 8): '3008',
         (2, 2): '3003', (2, 3): '3002', (2, 4): '3001'}
PLATE = {(1, 1): '3024', (1, 2): '3023', (1, 3): '3623', (1, 4): '3710', (1, 6): '3666', (1, 8): '3460',
         (2, 2): '3022', (2, 3): '3021', (2, 4): '3020', (2, 6): '3795', (2, 8): '3034',
         (4, 4): '3031', (4, 6): '3032', (4, 8): '3035', (6, 6): '3958', (6, 8): '3036'}
TILE = {(1, 1): '3070b', (1, 2): '3069b', (1, 3): '63864', (1, 4): '2431', (1, 6): '6636', (1, 8): '4162',
        (2, 2): '3068b', (2, 4): '87079'}
KIND = {'brick': (BRICK, 3), 'plate': (PLATE, 1), 'tile': (TILE, 1)}


def fill(m, cells, y, color, kind='brick', flip=False, max_len=8, sizes=None, note=None, avoid_1x1=True):
    """Cover the (x, z) cells at level y with parts of `kind`. Returns list of placed parts."""
    table, h = KIND[kind]
    if sizes is not None:
        table = {k: v for k, v in table.items() if k in sizes}
    rem = set(c for c in cells if m.free(c[0], c[1], y, 1, 1, h))
    placed = []
    order = sorted(rem, key=(lambda c: (c[1], c[0])) if not flip else (lambda c: (c[0], c[1])))
    for c in order:
        if c not in rem:
            continue
        best = None
        for (a, b), part in table.items():
            if max(a, b) > max_len:
                continue
            for (w, d) in {(a, b), (b, a)}:
                fp = [(c[0] + i, c[1] + k) for i in range(w) for k in range(d)]
                if not all(f in rem for f in fp):
                    continue
                below = set()
                for f in fp:
                    q = m.occ.get((f[0], f[1], y - 1))
                    if q is not None:
                        below.add(q)
                # seam alignment penalty: ends of this brick coincide with ends of the part below
                pen = 0
                if kind != 'tile':
                    edges = [((c[0] + w - 1, c[1] + k), (c[0] + w, c[1] + k)) for k in range(d)] + \
                            [((c[0] + i, c[1] + d - 1), (c[0] + i, c[1] + d)) for i in range(w)]
                    for a_, b_ in edges:
                        if b_ in rem:
                            pa = m.occ.get((a_[0], a_[1], y - 1)); pb = m.occ.get((b_[0], b_[1], y - 1))
                            if pa is not None and pb is not None and pa != pb:
                                pen += 14
                score = w * d * 4 + 5 * min(len(below), 3) - pen
                # prefer the long axis matching the wall direction (neighbours in rem)
                if w * d == 1 and avoid_1x1:
                    score -= 3
                if best is None or score > best[0]:
                    best = (score, w, d, part)
        if best is None:
            raise RuntimeError(f'cannot fill {c} at {y}')
        _, w, d, part = best
        rot = 0
        # table key (a,b): parts are defined long along LDraw x for 1xN; choose rot so footprint is (w,d)
        placed.append(m.add(part, color, c[0], c[1], y, rot=0 if _natural(part, w, d) else 90, note=note))
        for i in range(w):
            for k in range(d):
                rem.discard((c[0] + i, c[1] + k))
    return placed


_nat = {}


def _natural(part, w, d):
    """True when the part at rot 0 has footprint w (x) by d (z)."""
    from builder import PartInfo
    if part not in _nat:
        info = PartInfo.get(part)
        _nat[part] = (round((info.x1 - info.x0) / 20), round((info.z1 - info.z0) / 20))
    return _nat[part] == (w, d)
