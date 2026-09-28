"""Synthesises the 45 s soundtrack (audio/music.wav): no samples, all additive synthesis + a convolution reverb.
Cues follow the shot list in src/index.html."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt, fftconvolve
SR, DUR = 44100, 45.0
N = int(SR * DUR); t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(3)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def env(n, a, r, sustain=True):
    e = np.ones(n); ai = max(1, int(a * SR)); e[:ai] = np.linspace(0, 1, ai)
    ri = max(1, int(r * SR)); e[-ri:] *= np.linspace(1, 0, ri) if sustain else 1
    return e
def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig)); sig = sig[: j - i] * gain
    L[i:j] += sig * np.sqrt(0.5 * (1 - pan)); R[i:j] += sig * np.sqrt(0.5 * (1 + pan))
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)

def pad(notes, start, dur, gain=0.08, cutoff=1400):
    n = int(dur * SR); tt = np.arange(n) / SR; s = np.zeros(n)
    for m in notes:
        for d in (-0.08, 0.0, 0.08):                       # detuned saw stack
            f = hz(m) * 2 ** (d / 12); s += 2 * ((tt * f + rng.random()) % 1) - 1
    s = lp(s, cutoff) * env(n, 1.2, 1.6); add(s, start, gain / len(notes), rng.uniform(-.3, .3))
def pluck(m, start, gain=0.12, dec=0.9, pan=0.0):
    n = int(2.5 * SR); tt = np.arange(n) / SR; f = hz(m)
    s = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt / dec)
    s *= env(n, 0.004, 0.05); add(s, start, gain, pan)
def bell(m, start, gain=0.1, pan=0.0):
    n = int(4 * SR); tt = np.arange(n) / SR; f = hz(m)
    s = sum(a * np.sin(2 * np.pi * f * k * tt) * np.exp(-tt / (2.2 / k)) for k, a in [(1, 1), (2.76, .4), (5.4, .2), (8.9, .08)])
    add(s * env(n, 0.002, 0.2), start, gain, pan)
def kick(start, gain=0.5):
    n = int(0.5 * SR); tt = np.arange(n) / SR; f = 45 + 90 * np.exp(-tt * 30)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7), start, gain)
def tick(start, gain=0.12):
    n = int(0.12 * SR); add(hp(rng.standard_normal(n), 5000) * np.exp(-np.arange(n) / SR * 40), start, gain, rng.uniform(-.5, .5))
def riser(start, dur, gain=0.18):
    n = int(dur * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n)
    x = sosfilt(butter(2, [400, 6000], 'band', fs=SR, output='sos'), x) * (tt / dur) ** 2
    add(x, start, gain)
def boom(start, gain=0.9):
    n = int(3 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (38 + 40 * np.exp(-tt * 6)) * tt) * np.exp(-tt * 1.6) + 0.3 * lp(rng.standard_normal(n), 300) * np.exp(-tt * 3)
    add(s, start, gain)
def drone(start, dur, m, gain=0.07):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * tt) + 0.5 * np.sin(2 * np.pi * hz(m + 12) * tt + np.sin(tt * 0.7))
    add(s * env(n, 2.0, 1.5), start, gain)

BEAT = 0.75                                      # 80 BPM
AM, F, C, G, Em = [57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62], [52, 55, 59]
# 0–6.2: the pour — drone, shimmer, riser into the switch-on
drone(0, 6.8, 33, 0.09)
for i, m in enumerate([81, 84, 88, 86, 84, 81, 79, 84]): bell(m, 0.6 + i * 0.62, 0.035, pan=(-.6 if i % 2 else .6))
riser(4.4, 1.8)
# 6.2: the lamp lights
boom(6.2); bell(76, 6.2, 0.09); bell(83, 6.25, 0.05, .4)
prog = [AM, F, C, G, AM, F, C, Em, F, C, G, AM, F, G, AM]
start = 6.2
for i, ch in enumerate(prog):
    at = start + i * 2.6
    if at > 43: break
    pad(ch, at, 3.2, 0.10 if at < 24 else 0.13, 1200 if at < 24 else 2200)
    bass = ch[0] - 24; pluck(bass, at, 0.18, 1.6)
# 11.2–24: the making — pulsing arpeggio and a tick on every step
for k in range(int((24 - 11.2) / (BEAT / 2))):
    at = 11.2 + k * BEAT / 2; ch = prog[int((at - start) / 2.6) % len(prog)]
    pluck(ch[k % 3] + 12, at, 0.06, 0.35, pan=(-.4 if k % 2 else .4))
for s_ in (11.2, 14.4, 17.6, 20.8): tick(s_, 0.2); bell(88, s_ + 0.05, 0.03)
for k in range(int((24 - 12) / BEAT)): kick(12 + k * BEAT, 0.22)
# 24–35: the collection — fuller groove
for k in range(int((35 - 24) / (BEAT / 2))):
    at = 24 + k * BEAT / 2; ch = prog[int((at - start) / 2.6) % len(prog)]
    pluck(ch[(k * 2) % 3] + 12, at, 0.07, 0.4, pan=(-.5 if k % 2 else .5))
    if k % 2 == 0: kick(at, 0.3)
    else: tick(at, 0.08)
for s_ in (24.0, 26.2, 28.4, 30.6, 32.8): bell(84, s_, 0.04, .3)
# 35–40.4: Hà Nội — calm pentatonic melody
for i, m in enumerate([69, 72, 74, 76, 74, 72, 69, 67]): pluck(m, 35.2 + i * 0.6, 0.09, 1.2, pan=-.2)
# 40.4–45: end card
boom(40.4, 0.5); pad([57, 64, 69, 72], 40.4, 4.6, 0.14, 1800)
for i, m in enumerate([81, 76, 84, 88]): bell(m, 40.5 + i * 0.35, 0.05, pan=(i - 1.5) / 2)

# reverb and master
ir_n = int(2.6 * SR); ir = rng.standard_normal((2, ir_n)) * np.exp(-np.arange(ir_n) / SR * 2.2)
ir[:, :200] *= np.linspace(0, 1, 200)
wetL = fftconvolve(L, ir[0])[:N]; wetR = fftconvolve(R, ir[1])[:N]
mixL = L + 0.03 * wetL; mixR = R + 0.03 * wetR
fade = np.ones(N); fn = int(1.2 * SR); fade[-fn:] = np.linspace(1, 0, fn); fade[:int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR))
mix = np.stack([mixL, mixR], 1) * fade[:, None]
mix = np.tanh(mix / (np.abs(mix).max() * 0.55)) * 0.89       # gentle saturation, peak normalise
os.makedirs(os.path.join(os.path.dirname(__file__), '..', 'audio'), exist_ok=True)
with wave.open(os.path.join(os.path.dirname(__file__), '..', 'audio', 'music.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('audio/music.wav', DUR, 's')
