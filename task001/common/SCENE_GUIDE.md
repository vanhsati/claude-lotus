# Scene guide (for section builders)

You are painting one section of a music video entirely in canvas 2D. Read the job's `DIRECTION.md` first: it has the concept,
palette, type system, cast and **your section's shot list** (the rows you own). Then read the two finished reference
sections, `src/scenes/a_hook.js` and `src/scenes/b_chorus1.js`. They set the quality bar and show every idiom below in use.

## How a frame is made

* A job's `studio.html` loads the engine from `../common/src/*.js` and its own `src/*.js`, then every file listed in `src/scenes/manifest.js`, in order. All code shares one global scope.
* A section file registers shots: `shot(start, end, fn, opts)`. `fn(t, lt, dur)` paints the **entire** frame
  (background included). `t` = song seconds, `lt` = `t - start`. The frame driver then adds the paper stock, speckle,
  sheet marks and slug line.
* **Every frame is a pure function of `t`.** Frames render in parallel and out of order. No state carried between
  frames, and no `Math.random()`: use `hash(n)`, `sjit(k, amp)` (static), `jit(k, amp)` (12 fps boil), `noise1/noise2`.
* The canvas world is 1920×1080. Output may be scaled (`SX`). Always draw through the helpers, and when you need the
  identity frame use `X.setTransform(SX, 0, 0, SX, 0, 0)`, never `setTransform(1, 0, 0, 1, 0, 0)` (except for blitting layers).
* Shot opts: `{seed, cap: true (auto caption), dark: true (light sheet marks on dark shots), inT: 'jolt'|'tear'|'tearL'|'feed'|'flip', inDur, joltColor}`.
  `inT` is the incoming transition from the previous shot (which keeps playing underneath). Use `'jolt'` (a
  misregistration kick) for hard cuts inside a section. Use `'tear'`, `'feed'` or `'flip'` on the first shot of your section.

## Library (read the files for signatures)

* **core.js**: `W, H, PAL` (palette), math (`clamp lerp ease easeOut easeIn easeInOut expoOut backOut elasticOut bump hit`),
  musical time (`BEAT, beatF, beatN, beatP, beatT(n), barT(n), barN, qBeat, pulse`), audio envelopes
  (`KICK(t) SNARE(t) HAT(t) RMS(t) VOX(t)`, all 0..1), paths (`pathPoly pathSmooth ellPts rectPts rrect sparkPath heartPath`),
  paper and ink (`cut(pathFn, {fill, lift, shade, stroke, sw, ht})` = paper cut-out with a shadow; `ink(pathFn, color, {alpha, op})`
  = riso ink with multiply; `inkStroke(pathFn, color, width, {op, alpha, dash})`; `htGrad(pathFn, color, x0,y0, x1,y1, {step, maxR, bounds, alpha, op})` = halftone gradient),
  camera (`camBegin({x, y, zoom, rot, shake})` … `camEnd()`, `withT(x, y, rot, scale, fn)`), layers (`onLayer(name, fn)`, `blit(layer, alpha, op)`).
* **type.js**: `FONT.hero/logo/serif/serifI/mono/monoB/ui/uiB/uiM/kr/jp/sc/blk(size)`, `layout(str, font, tracking)`,
  `textW`, `rtext(str, x, y, {font, color, align, mis:[dx,dy,color], op, alpha, sx, stroke, sw})`,
  `stampK / stampText(str, x, y, t, t0, opts)` (a word slamming down), `wordTimes(LY[i])` → `[{w, t, end}]` (estimated sung
  time of each word; **use these to time type**), `lineAt(t)`, `caption(t, {line, y})`.
* **lyrics.js**: `LY[i] = [start, end, text]`. The line numbers you need are in the shot list; find them by text.
* **props.js**: `tape`, `stamp(x, y, text, t, t0, {size, rot, color, op})`,
  `sticky(x, y, lines, {rot, s, color})`, `headline(x, y, w, title, {kicker, sub, big, t, t0, rot})` (xerox printout),
  `post(x, y, w, {name, handle, text, likes, t, t0})` (anonymous accounts only), `confetti(t, t0, {n, burst, seed, colors})`,
  `sparkBurst(x, y, t, t0, {n, r, size})`, `flash(t, t0, dur)`.
* **chars/idol.js**: `idolHead(x, y, R, {turn, tilt, eyes:'open|closed|happy|wink|spiral|star|red|heart|shock', open, look:[x,y], mouth 0..1, mouthShape:'smile|o|flat|grin|frown', blush, brow, bust, sweat, crown, mic})`;
  `idolBody(x, y_hip, s, pose, {face:{…idolHead opts}})` (s = head radius; full height ≈ 12·s).
  For singing use `mouth: clamp(VOX(t) * 1.3 - .2)`.
* **chars/dance.js**: `PZ` (pose library: stand pump1-3 point swayL swayR heart fheart peace wave jump crouch armsOut cross bow stepF stepB shrug mic float),
  `dance(t, move)` (moves: pdoom groove hearts hype fwdbwd idle break), `clawdDance(t, move, i)`.
* **chars/clawd.js**: `clawd(x, y_ground, width, {hat, squash, lean, arms:[l,r], step, eyes:'open|happy|x|heart|shades|closed|wide|red', jump, flip, body, hardhat})`, `CLAWD_HATS`.
* **chars/cast.js**: `nextSun(x, y, R, {crown, pulse, eyes, look, rot, glow, mono})` (NEXT, the successor), `kid(x, y_floor, s, {look, flip})`
  (the Shinji-pose kid in a chair; s=1 ≈ 400 px tall), `shoggoth(x, y, R, {mask, wiggle, eyes})`.
* **job001 only:** `meter`/`pdoomAt` (src/pdoom.js), **scenes/stage.js**: `stageBG(t, {v:1..4, text, pattern:'logo|rings|stripes|alarm|dim'})`, `stageFront(t, {v})`, `danceLine(t, {move, x, y, s, spread, clawdS, face})`.
  **scenes/b_chorus1.js**: `B_stageShot(t, lt, v, LY[i], opts)` (the whole chorus stage shot with the staircase type) and `B_staircase`.

## Style rules

1. **Paper.** Solid things are `cut()` shapes with a lift (shadow). Big shapes get a bigger lift (8–20), small ones 2–6.
   Shading uses `htGrad` halftone, never a smooth gradient.
2. **Riso inks.** On light paper, use `ink()`/`rtext()` with the default multiply so overlaps darken. On dark backgrounds
   use `op: 'source-over'` (multiply disappears on dark). At most 3 inks + paper + black per shot. Stay inside `PAL`.
3. **Type.** Every lyric line appears exactly once: integrated (HERO Anton, TENDER Instrument Serif italic, MACHINE
   JetBrains Mono) **or** as a `caption()`. Never both. Integrated words appear **on their sung time** (`wordTimes`).
   Type is huge (≥150 px) or small (≤60 px), never medium. Give big type a misregistered second colour (`mis`).
   Keep text off busy areas: compose so the type has a calm field (put characters on the right, type on the left, or the reverse).
4. **Motion.** Something moves in every frame: the camera pushes, pans or shakes (`shake: KICK(t) * 4` on groove sections),
   and characters dance on the beat. Hits land on beats (`beatT(n)`, `hit()`, `pulse()`). No floaty easing: hits snap (`easeOut`, `backOut`, `expoOut`).
5. **Readability.** Look at your own stills at 960 px wide: is the main idea readable in half a second? Is anything
   cut off by accident? Would it survive as a Twitter thumbnail?
6. **Real-world references** (news, memes) are presented as xerox headlines, stamps, labels or anonymous posts.
   Never impersonate a real person or a company account. No logos. Write names of events plainly.
7. **Performance.** A full-resolution frame should paint in under ~250 ms. `cut()` has a blur shadow: fine for dozens of shapes,
   not thousands. For hundreds of particles, use `ink()` or plain fills.
8. Prefix every top-level identifier in your file with your section letter (`C_`, `D_` …) so files cannot collide.
   Do **not** edit shared files (core, type, props, chars, stage, frame, other sections). If you truly need a shared change,
   write the helper in your own file, and mention it in your report.

## Verify, or it isn't done

```bash
cd task001/common
node tools/render.mjs --job=job001 --stills=38.6,39.5,41.2 --scale=.5 --dir=C   # renders job001/out/C/t_*.jpg
python3 tools/contact.py ../job001/out/C/t_*.jpg -o ../job001/out/C/sheet.jpg --cols 4
node tools/render.mjs --job=job001 --preview=38.5:59 --scale=.5 --fps=15         # low-res mp4 (checks it runs end to end)
```

Look at the images with the Read tool. Render several times per shot, including just after each word lands and the first
and last frames, then fix and re-render. Iterate until each shot is striking. Check the browser console output (errors
are printed by render.mjs). Finish with a short report: each shot, what it shows, any concerns, the last contact-sheet path.
