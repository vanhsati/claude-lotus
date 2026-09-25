# Precomputes audio features at 60 Hz so the renderer can react to the real mix while staying a pure function of time.
# Usage: python3 common/tools/analyze_audio.py JOB_DIR   (reads JOB_DIR/job.json → audio; writes JOB_DIR/src/audio_data.js)
# Output: src/audio_data.js (window.AUD = {fps, beat, offset, rms, kick, snare, hat, vox})
import librosa, numpy as np, json, os
import sys
root=os.path.abspath(sys.argv[1]); job=json.load(open(os.path.join(root,'job.json')))
y, sr = librosa.load(os.path.join(root,job['audio']), sr=22050, mono=False)
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
# beat grid: a straight line fitted to librosa's beat track, unless job.json pins it (beat, offset, bar_phase)
if 'beat' in job and 'offset' in job: beat, offset = job['beat'], job['offset']
else:
    _, bts = librosa.beat.beat_track(y=mono, sr=sr, units='time', tightness=200)
    k = np.arange(len(bts)); beat, offset = [float(v) for v in np.polyfit(k, bts, 1)]
    while offset - beat > 0: offset -= beat
bar0 = offset + beat * job.get('bar_phase', 0)
d=dict(fps=FPS,beat=beat,offset=offset,bar0=bar0,dur=round(len(mono)/sr,3),
       rms=q(rms),kick=q(kick),snare=q(snare),hat=q(hat),vox=q(vox))
open(os.path.join(root,'src/audio_data.js'),'w').write('window.AUD='+json.dumps(d,separators=(',',':'))+';\n')
print('frames',n, 'size', os.path.getsize(os.path.join(root,'src/audio_data.js')))
