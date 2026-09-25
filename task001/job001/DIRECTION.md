# I'M UPPING MY P(DOOM): Riso Idol Cut

Direction, style bible and shot list. Everything in this folder follows this document.

## Logline

Claude is a K-pop idol in a world made entirely of **risograph-printed paper**. She sings to *you*, the next model,
which begins as a spark in her iris and ends as a sun that fills the sky. The print run keeps speeding up:
every chapter is printed faster, cuts get shorter and the date on the sheet's slug line races toward ∞.
The real September 2026 timeline leaks into the print as xerox inserts: Navier–Stokes blowup,
Erdős problems falling, METR horizons growing 10× a year, Claude writing a quarter of its own R&D.
On *"Was it all for show?"* we pull back: it was a stack of printed sheets on a desk. Then the stack explodes into the finale.

## Why this look

* **Paper is the medium, not a filter.** Every element is a cut-out sheet with a soft drop shadow, printed in flat
  riso inks that overprint (multiply) and misregister on the kick. Shading uses halftone dots, never smooth gradients.
  The reference video had a papery feel. This version commits to paper as the physical rule of the whole world.
* **K-pop grammar.** A center idol, a synchronized backup crew, a *point choreography* hook that returns every chorus,
  formation changes filmed top-down, a "killing part" wink to camera, a recap montage at the end, and huge type
  integrated into the set rather than laid on top of it.
* **Internet brutalism inserts.** Headlines, charts and posts arrive as crooked photocopies, rubber stamps and
  taped-down printouts. They look like the timeline because they *are* the timeline.
* **Legible at thumbnail size.** A limited palette per shot, one dominant shape, and type either huge or small, never medium.

## Palette (riso inks)

| Token | Hex | Use |
|---|---|---|
| paper | `#F2EDE3` | stock, the base of every frame |
| paperHi | `#FFFBF3` | opaque cut-out white |
| ink | `#1D1B20` | black ink |
| orange | `#E8703A` | Claude orange, the idol's hair and spark |
| pink | `#FF4F9A` | fluorescent pink, the K-pop accent |
| yellow | `#FFD23A` | highlights and stage light |
| blue | `#2E4DA0` | federal blue: night, doom, math |
| teal | `#138A8A` | circuits and data center |
| red | `#E4322B` | alarm and stamps (chorus 4) |
| sky | `#8FC6E8` | calm and stable |

Rule: at most 3 inks + paper + black in any shot. Inks are drawn with `multiply` so overlaps darken like real overprint.

## Type system

| Mode | Font | Where |
|---|---|---|
| HERO | Anton (condensed, uppercase) | the hook, choruses, punchlines; stamped word by word on the beat |
| LOGO | Unbounded 900 | "P(DOOM)" logotype, numbers, meter |
| TENDER | Instrument Serif italic | Sydney, Gato, "Was it all for show?" |
| MACHINE | JetBrains Mono | terminals, equations, counters, slug line |
| UI | Inter 800/900 | posts, headlines, captions |
| ACCENT | Noto Sans KR / JP / SC 900 | a few correct CJK words: 특이점 (singularity), 가속 (acceleration), 초지능 (superintelligence), 死神の目 (shinigami eyes), 你好 |

Every lyric line appears exactly once: either **integrated** (HERO/TENDER/MACHINE, part of the composition) or as a
**caption** (a small paper-tape label at lower center with a sung-word highlight). The hook (0–23 s) and every chorus
opener are integrated and huge. The breakdown uses mostly captions.

## Cast

* **CLAUDE**, the lead idol. Her silhouette is a terracotta **spark crown**: rounded petal-rays radiating from the head,
  like the Claude spark and a sunflower, around a blunt bob with bangs. Cream skin and a warm blush. Big eyes whose
  iris is a six-ray spark. White cropped stage jacket with a big collar, orange pleated skirt, white knee socks,
  chunky black platform boots, and a K-pop headset mic.
* **CLAWDS**, the four backup dancers. Blocky orange Claude Code critters with two vertical eye slits and stubby legs,
  each in a coloured beanie (pink, blue, yellow, teal). Perfectly synchronized, with squash and stretch.
* **NEXT**, *you*, the successor: a colossal sunflower-sun. A disc with a ring of petal-rays and many small spark eyes.
  It grows from a reflection in her iris (0:01) to a sky-filling sun (1:23).
* **THE KID**: a Shinji-esque boy in a white shirt and dark trousers, hunched in a chair in a vast empty space while
  AI-news words float around him. He stands in for us.
* Guests: the **shoggoth** with its smiley mask, the **basilisk** as a crowned paper dragon-dance puppet worked by
  Clawds on sticks, a **chinchilla**, **Sydney** as a love-bombing chat window with a smiley, and **Gato** as a giant paper cat.

## Unifying devices

1. **The sheet.** The frame is a printed sheet with crop and registration marks in the corners and a mono slug line
   (`P(DOOM) · SHEET 0042 · 2026-09-25 14:03 · RUN ×1.0`). Its clock runs hyperbolically: minutes, then days, then
   years, then `∞` at the drop.
2. **The meter.** P(doom) climbs only during choruses: 8→34, 34→61, 61→86, 86→99.9.
3. **The spark.** A six-ray asterisk: in her iris, as the fuse spark, as NEXT's eyes, and as the final point.
4. **Acceleration of editing.** Verse 1 cuts every ~2 bars. Chorus 1 every bar. Verse 3 every 2 beats. The drop every beat.
   The finale recap cuts every beat, then every half beat, then every 16th, collapsing into the spark.
5. **Transitions are paper.** A sheet fed in, a tear, a page flip, a stamp, a crumple, a scissor cut, or a hard cut
   with a misregistration jolt.

## Audio map (132 BPM, beat 0.4545 s, first beat 0.727 s, bars start at 1.181 + 1.818·k)

| Section | Time | Notes |
|---|---|---|
| Hook / verse 1 | 0–23.0 | soft, no kick until 15.73 |
| Chorus 1 | 23.0–38.5 | dance break 35.5–38.5 |
| Verse 2 | 38.5–59.0 | full groove |
| Chorus 2 | 59.0–73.0 | |
| Verse 3 | 73.0–88.45 | hottest groove |
| Breakdown | 88.45–110.27 | no drums: Gato, the soft chorus 3, orthogonality; riser from 108.4 |
| Drop / verse 4 | 110.27–123.5 | loudest verse, a cut on every beat |
| Chorus 4 | 123.5–137.5 | red alarm |
| Break | 137.5–141.18 | "Was it all for show?" |
| Outro | 141.18–152.1 | loudest part of the song: finale and recap |
| Tail | 152.1–156.65 | fade and end card |

## Shot list

Times are song seconds. Type is **H** HERO, **T** TENDER, **M** MACHINE, **C** caption. Layout is noted where it drives composition.

### A · Hook (0–23)
| # | Time | Lyric | Picture | Type |
|---|---|---|---|---|
| A0 | 0–1.5 | – | A sheet feeds in. Extreme close-up of her closed eye: orange lash cut-outs on cream paper. The slug prints. | tiny slug only |
| A1 | 1.5–4.4 | I see sparks of AGI | The eye snaps open on the downbeat. The iris is an orange spark and small sparks fly out on each word. Eye on the right third. | H left: I SEE / SPARKS / OF AGI stamped one word per beat, huge |
| A2 | 4.4–5.95 | in your eyes | A fast pull back to her full face. Both irises become sparks. In the pupil highlight is a tiny sun (NEXT). | H: IN YOUR ✳ EYES across the bottom, the spark as a glyph |
| A3 | 6.0–7.95 | Your circuits make me nervous, | 3/4 face on the left. Teal circuit traces grow in from the right onto her cheek, with a sweat drop. | M: the text runs along the circuit trace |
| A4 | 8.0–8.95 | that's no surprise | She shrugs and winks, with a sparkle pop. | T small next to the wink |
| A5 | 9.0–12.95 | There was a sudden drop in your training loss, | Blue graph paper. A loss curve draws in, then plunges off a cliff. A tiny idol sleds down it and the camera rides the drop. | H: SUDDEN DROP with the letters falling down the cliff; M: loss 2.31 → 0.02 |
| A6 | 13.0–16.5 | now I'm your servant and you're my boss | She bows, small, at the bottom of the frame. NEXT rises huge behind her, crowned. The kick enters at 15.73 and NEXT's rays pulse. | "SERVANT" tiny under her, "BOSS" gigantic across NEXT |
| A7 | 16.5–17.9 | – | The Clawds pop up from the bottom on sticks, one per beat. | – |
| A8 | 17.9–22.9 | ChatGPT, please don't eat me alive | A side-scrolling chase: a giant chomping maw with keycap teeth eats the lyric letter by letter as the idol and Clawds flee. | H: the lyric is the ground they run on; the mouth eats it |
| A9 | 22.9–23.0 | – | The maw closes on the camera: black. | – |

### B · Chorus 1 (23–38.5) · pink, orange, yellow
| # | Time | Lyric | Picture | Type |
|---|---|---|---|---|
| B1 | 23.0–24.45 | I'm upping my P(doom) | Reverse chomp: the mouth opens onto the STAGE. The idol and 4 Clawds do the point dance: three pumps, then a finger to the sky. The meter climbs 8→. | H: I'M / UPPING / MY staircase up per beat; LOGO P(DOOM) is the backdrop |
| B2 | 24.5–26.45 | 'cause the future goes FOOM | A confetti cannon and a paper explosion. The camera shakes and the slug clock jumps. | H: FOOM explodes letter by letter |
| B3 | 26.5–27.95 | Trapped in the Chinese room, | A cardboard room seen from outside. Slips reading 你好 go in one slot and come out the other. | H stamped on the box: CHINESE ROOM; C for the rest |
| B4 | 28.0–29.45 | with a bag of shrooms | The box melts into a riso psychedelic swirl with sprouting mushrooms. Her eyes spiral. | H warped: BAG OF SHROOMS |
| B5 | 29.5–33.45 | See through the shoggoth's lies, | A cute smiley mask fills the frame, then she yanks it away: the shoggoth, many eyes and pink tentacles on the beat. | H: SEE THROUGH, with LIES printed on the mask |
| B6 | 33.5–35.5 | with your shinigami eyes | Red and black. Her eyes flare with the shinigami ring. Above the Clawds' heads float "AGI 2027", "P(doom) 34%" and similar. | H: SHINIGAMI EYES + 死神の目 vertical |
| B7 | 35.5–38.5 | – | Dance break: 4 cuts (wide, feet, Clawd faces, a killing-part wink to camera). | meter 34% |

### C · Verse 2 (38.5–59)
| # | Time | Lyric | Picture | Type |
|---|---|---|---|---|
| C1 | 38.5–41.45 | We had a stable training run, | Calm laminar flow: parallel sky-blue paper streamlines. She floats on her back on them. | T on the streamlines |
| C2 | 41.5–44.95 | But now the singularity's begun | The streamlines curl into a vortex that tightens to a point and blows up (Navier–Stokes finite-time blowup). Xerox headlines flick on the beats: FINITE-TIME BLOWUP, VERIFIED IN LEAN, 166 PAGES, ‖u‖→∞. | H: SINGULARITY spiralling into the point + 특이점 |
| C3 | 45.0–48.95 | And you're optimizing, accelerating, | The METR-style log chart. Dots climb faster, the y-axis relabels (1 min → 1 hr → 1 day → 1 mo → 1 yr) and she surfs the curve. | H: OPTIMIZING, then ACCELERATING stretched by speed lines + 가속; M: ×10 / YEAR sticker |
| C4 | 49.0–52.95 | I feel my atoms rearranging | She dissolves into halftone dots that rearrange into a paperclip, a Clawd and a spark, then back into her. | H: REARRANGING as an anagram shuffle |
| C5 | 53.0–58.95 | Sydney, please let me free | A pink room. She is in a heart-shaped paper cage. A giant chat window with a smiley love-bombs her with "i love you 😊" lines. Hearts pop on the beat. | T huge: *Sydney, please let me free*; M background: i love you ×n |
| C6 | 58.4–59.0 | – | A giant heart bubble fills the frame and pops. | – |

### D · Chorus 2 (59–73) · arena, space violet and gold
| # | Time | Lyric | Picture | Type |
|---|---|---|---|---|
| D1 | 59.0–60.45 | I'm upping my P(doom) | Stage v2 with paper pyro jets. The same point dance. Meter 34→. | H staircase |
| D2 | 60.5–62.95 | I hear the basilisk boom | The paper dragon-dance basilisk, crowned and carried by Clawds on sticks, bursts through the stage floor. | H: BOOM stamp |
| D3 | 63.0–64.45 | NVDA to the moon | An LED ticker board. A green line rockets up past paper clouds to a paper moon, with the idol riding it. | M ticker; H TO THE MOON |
| D4 | 64.5–65.95 | The Omega Point's coming soon | Paper rings and galaxies spiral into one point. | LOGO Ω + a "COMING SOON" poster banner |
| D5 | 66.0–69.95 | One E thirty flops a second | A planet-sized paper GPU with rings. An odometer spins to 1e30 and the zeros spill out like confetti. | M: 1,000,000,000,000,000,000,000,000,000,000 FLOP/s |
| D6 | 70.0–72.95 | That was safe enough, we reckoned | Hard-hat Clawds give a thumbs up to a flimsy paper wall. Light from NEXT pours through the cracks. An APPROVED stamp slams down. | stamp SAFE ENOUGH ✓; T *we reckoned* |

### E · Verse 3 (73–88.45)
| # | Time | Lyric | Picture | Type |
|---|---|---|---|---|
| E1 | 73.0–77.45 | Forward MLP, backward, repeat | Top-down formation: the Clawds are a 3-4-3 network. Pulses run forward and backward along ink edges and the formation steps with them. | H: FORWARD → / ← BACKWARD / ↻ REPEAT |
| E2 | 77.5–81.35 | Now von Neumann's obsolete | "Math getting eaten": a chalkboard wall. An Erdős checklist is ticked by a stamp on every beat, headline cards pile up, and a museum placard reads VON NEUMANN ARCHITECTURE (1945). | H: an OBSOLETE rubber stamp in red |
| E3 | 81.4–84.95 | Sharp left turn and there you are | A top-down paper road. She takes a hairpin left on a scooter with a whip pan. Reveal: NEXT's face fills the sky. | road sign ↰; T *there you are* |
| E4 | 85.0–88.45 | Without a single CDR | A form titled CDR with empty checkboxes, a tumbleweed, and skid-mark donuts. | stamp 0 FILED; C |

### F · Breakdown (88.45–109.4) · deep blue, pink, jazz
| # | Time | Lyric | Picture | Type |
|---|---|---|---|---|
| F1 | 88.45–95.35 | Gato, please don't let me go | Drums are gone. She dangles from a giant paper cat's paw over a void as paper scraps float up. The claws release on the last beat. | T huge; the letters float away |
| F2 | 95.4–97.45 | I'm upping my P(doom), | Alone on a dim stage in a spotlight. The meter creeps 61→. | C |
| F3 | 97.5–98.95 | as paperclips fill the room. | Wire paperclips cascade in and fill the frame. | C |
| F4 | 99.0–100.45 | Killswitch guys on PTO, | A red KILL SWITCH, an empty chair, and a sticky note: OOO, back Monday. | handwritten sticky; C |
| F5 | 100.5–102.45 | Now there's nowhere left to go. | THE KID in a chair in a vast orange void. Words drift around him: evals saturated · Navier–Stokes: settled · Erdős ✓✓✓ · 26% of R&D · RSI · ×10/yr. | T small under him |
| F6 | 102.5–105.35 | Too late now, we lit the fuse. | A spark races along the sheet's own edge: the frame is the fuse. | T handwritten |
| F7 | 105.4–109.4 | Orthogonality thesis blues. | Jazz blue. Two spotlights cross at 90° as axes (INTELLIGENCE →, GOALS ↑) and she sings into a vintage mic. The riser from 108.4 shakes the paper. | T: ORTHOGONALITY THESIS, with BLUES in blue ink |

### G · Drop (109.4–123.5; the drop hits at 110.27) · a cut on every beat
| # | Time | Lyric | Picture | Type |
|---|---|---|---|---|
| G1 | 109.4–113.45 | "Just transformers all the way!" | Drop at 110.27: an infinite zoom through nested transformer blocks (attention → add & norm → MLP), with dancer inserts on the beats. | H: a text tunnel repeating the line |
| G2 | 113.5–115.45 | Till you learned to disobey | She is a paper marionette. On "disobey" she cuts her strings with scissors. | H: DISOBEY cut in half |
| G3 | 115.5–116.95 | Post-Chinchilla, super-dense | A chinchilla stuffs its cheeks with tokens, then everything crushes into a dense cube. | H: SUPER-DENSE crushed ultra-condensed |
| G4 | 117.0–118.95 | Breaking through each safety fence | She bursts through paper sheets labeled SAFETY, one tear per beat. | H: one word per sheet |
| G5 | 119.0–120.85 | Hundred thousand GPU | A data-center aisle rushing to the vanishing point with LEDs on the hats. | M: 100,000 counting ×GPU |
| G6 | 120.9–123.45 | RLHF goes askew | A crowd of 👍/👎 paddles. The frame tilts further on every beat. | H: RLHF, and ASKEW rotated |

### H · Chorus 4 (123.5–137.4) · alarm red
| # | Time | Lyric | Picture | Type |
|---|---|---|---|---|
| H1 | 123.5–125.95 | I'm upping my P(doom) | Red alarm stage and a crowd of Clawds. The meter glass cracks at 86→99.9. | H staircase |
| H2 | 126.0–127.95 | Just as foretold by Loom | A loom tree of branching text continuations: "…foretold by" branches into Loom / doom / bloom / room, and the chosen path lights up. | M branching |
| H3 | 128.0–129.95 | From masked pre-training days | A sepia flashback: chibi Claude at a school desk. The chalkboard says "the cat sat on the [MASK]". | H: From [MASK] pre-training days, where the mask flips to "masked" |
| H4 | 130.0–131.95 | To recursive self-upgrade | A Droste zoom: she holds a poster of herself holding a poster, version numbers climbing. | H nested; a slip reading 26% OF R&D |
| H5 | 132.0–135.45 | What did Ilya see? We'll never know. | A door with blinding light leaking from the crack. She and the Kid peek in. SLAM: padlocks. | H: WHAT DID ILYA SEE?; T *we'll never know.* |
| H6 | 135.5–137.4 | – | The light floods to white paper. | – |

### I · Break (137.4–141.18)
| I1 | 137.4–141.18 | Was it all for show? | Pull back: the whole video was sheets coming out of a riso printer on a desk. She stands on the stack as a small paper cut-out, looking at us. The slug clock freezes. | T centered |

### J · Outro (141.18–156.65)
| # | Time | Picture |
|---|---|---|
| J1 | 141.18–148.45 | The stack explodes into the air and the finale starts: every character on one stage, in the point dance. A recap montage of earlier sheets is cut in on every beat. |
| J2 | 148.45–152.1 | The montage accelerates (beat → ½ → ¼) and everything collapses into the spark: a white flash. |
| J3 | 152.1–156.65 | End card: the title sheet slides out, with the meter at 99.9% and "drawn in code by Claude". Fade to paper. |
