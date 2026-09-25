# Downloads the Google Fonts used by the video into fonts/ and writes fonts/fonts.css with local URLs.
import re, urllib.request, os, sys
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
FAMS=["Anton","Unbounded:wght@400;900","Instrument+Serif:ital@0;1","JetBrains+Mono:wght@400;800","Inter:wght@500;800;900","Archivo+Black"]
KR_TEXT="피둠특이점가속종말우리는끝났어돌아왔다초지능예언의눈사랑해"  # Korean glyphs used in the video
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':UA})).read()
here=os.path.dirname(os.path.abspath(__file__)); out=os.path.join(here,'..','fonts'); os.makedirs(out,exist_ok=True)
css_out=[]
def process(css, keep_all=False):
    for block in re.findall(r'(/\* [^*]+ \*/\s*@font-face \{[^}]+\}|@font-face \{[^}]+\})', css):
        sub=re.match(r'/\* ([^*]+) \*/', block)
        if not keep_all and (not sub or sub.group(1).strip() not in ('latin','latin-ext')): continue
        fam=re.search(r"font-family: '([^']+)'",block).group(1); w=re.search(r'font-weight: (\d+)',block).group(1)
        st=re.search(r'font-style: (\w+)',block).group(1); url=re.search(r'url\((https[^)]+)\)',block).group(1)
        tag=(sub.group(1).strip() if sub else 'text').replace(' ','')
        fn=f"{fam.replace(' ','')}-{w}{'i' if st=='italic' else ''}-{tag}.woff2"
        p=os.path.join(out,fn)
        if not os.path.exists(p): open(p,'wb').write(get(url))
        css_out.append(re.sub(r'url\(https[^)]+\)',f"url({fn})",block))
for f in FAMS: process(get(f"https://fonts.googleapis.com/css2?family={f}&display=block").decode())
import urllib.parse
for fam,txt in (("Noto+Sans+KR",KR_TEXT),("Noto+Sans+JP","死神の目"),("Noto+Sans+SC","你好中文房间规则书")):
    process(get(f"https://fonts.googleapis.com/css2?family={fam}:wght@900&display=block&text="+urllib.parse.quote(txt)).decode(), keep_all=True)
open(os.path.join(out,'fonts.css'),'w').write('\n'.join(css_out))
print(len(css_out),'faces')
