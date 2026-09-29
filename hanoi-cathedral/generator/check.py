import design as d, collections
m = d.m
print(len(m.parts), 'parts', len(m.errors), 'errors')
for e in m.errors[:10]: print(e)
roots = [p.idx for p in d.base]
floating, adj = m.connectivity(roots)
print('not connected to base:', len(floating))
cnt = collections.Counter((p.section, p.note) for p in floating)
for k, v in cnt.most_common(40): print('  ', v, k)
