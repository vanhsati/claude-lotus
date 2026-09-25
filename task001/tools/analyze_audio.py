# Precomputes audio features at 60 Hz so the renderer can react to the real mix while staying a pure function of time.
# Output: src/audio_data.js (window.AUD = {fps, beat, offset, rms, kick, snare, hat, vox})
import librosa, numpy as np, json, os
here=os.path.dirname(os.path.abspath(__file__)); root=os.path.join(here,'..')
y, sr = librosa.load(os.path.join(root,'audio/pdoom.mp3'), sr=22050, mono=False)
mono=y.mean(0); side=(y[0]-y[1])/2
FPS=60; hop=sr//FPS
S=np.abs(librosa.stft(mono,n_fft=2048,hop_length=hop)); f=librosa.fft_frequencies(sr=sr,n_fft=2048)
def band(a,b): return S[(f>=a)&(f<b)].sum(0)
def onset(x):
    d=np.maximum(0,np.diff(np.log1p(x),prepend=np.log1p(x[0]))); return d
def norm(x,p=99): return np.clip(x/np.percentile(x,p),0,1)
def decay(x,k=0.82):
    o=np.zeros_like(x); v=0
    for i,a in enumerate(x): v=max(a,v*k); o[i]=v
    return o
rms=norm(librosa.feature.rms(y=mono,frame_length=2048,hop_length=hop)[0],99.5)
kick=decay(norm(onset(band(35,130)),99))
snare=decay(norm(onset(band(1800,5000)),99))
hat=decay(norm(onset(band(7000,11000)),99),.7)
# vocal proxy: harmonic mid band of the centre channel minus side leakage
H,_=librosa.decompose.hpss(S, margin=(2.0,1.0))
vb=H[(f>=300)&(f<3400)].sum(0)
Ss=np.abs(librosa.stft(side,n_fft=2048,hop_length=hop)); sb=Ss[(f>=300)&(f<3400)].sum(0)
vox=np.maximum(0,vb-0.6*sb[:len(vb)]); vox=norm(np.convolve(vox,np.ones(3)/3,'same'),98)
n=min(len(rms),len(kick),len(vox))
q=lambda a: [round(float(v),3) for v in a[:n]]
d=dict(fps=FPS,beat=0.45454440523533524,offset=0.7265692141817615,bar0=0.7265692141817615+0.45454440523533524,dur=156.65,
       rms=q(rms),kick=q(kick),snare=q(snare),hat=q(hat),vox=q(vox))
open(os.path.join(root,'src/audio_data.js'),'w').write('window.AUD='+json.dumps(d,separators=(',',':'))+';\n')
print('frames',n, 'size', os.path.getsize(os.path.join(root,'src/audio_data.js')))
