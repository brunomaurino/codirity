# Logo — concept B, "the aperture"

The four directions Bruno chose from are the canvas in `codirity-logo-directions.html`
(published as an Artifact). B was picked; this directory is the source that cuts it.

The seeded canvas (`codirity-logo-directions.html`, ~2.5 MB of editor bundle) is
gitignored — it is generated. Re-seed it from the artboards with the `/design`
skill's helper, or read the published copy back with the skill's `--extract`.

## Regenerate

Needs `fonttools`, `uharfbuzz`, `pillow` in a venv — the wordmark is OUTLINED from
`src/fonts/ApfelGrotezk-Mittel.woff2`, shaped through HarfBuzz so the kerning is the
font's own, with the site's `-0.012em` tracking applied between glyphs.

```bash
python -m venv .venv && .venv/bin/pip install "fonttools[woff]" uharfbuzz pillow
.venv/bin/python build_assets.py   # public/logo-*.svg + src/app/icon.svg
.venv/bin/python raster.py         # src/app/favicon.ico + src/app/apple-icon.png
```

## The numbers, and why they are those numbers

`mark.py` holds the whole geometry. Two of its constants are solved, not chosen:

- **`SW = 11`** (stroke, in the 120-unit box). Apfel Grotezk Mittel's round-letter
  stroke measures **114/1000 em** (sampled off the `o` at half cap height; the
  straight stem is 105). At the lockup's 1.45 ratio that is the stroke weight which
  makes the mark and the wordmark read as one drawing. Change the ratio and this
  has to be re-solved, or the mark starts looking bolted on.
- **`LOCKUP_RATIO = 1.45`** (mark ink height / cap height). Below ~1.3 the mark's C
  and the wordmark's C read as a stutter; above ~1.6 the mark takes over.
- **`LOCKUP_GAP = 0.55`** cap heights. The aperture opens toward the wordmark, so a
  tighter gap makes the live dot read as punctuation before the "C".

- **`DOT_R = 8`** — the live dot, ~45% wider than the stroke. It started at 6.5
  (dot diameter = stroke width, the tidy arithmetic answer) and lost too much of
  the live signal the header used to carry as a standalone 10px dot; 8 lands it
  at ~4px against the header's 24px type. It is the one number here set by eye
  rather than solved, so it is the one to move if the signal reads wrong.

`SMALL_SW` / `SMALL_DOT_R` are the optical small cut used by the favicon and
`apple-icon`: below ~24px the hairline and the dot both fall under a device pixel
on 1x, so that cut carries more ink at the same proportions (the dot keeps the
same ~0.73 dot-to-stroke ratio as the full-size drawing).

## Colour

Each file is cut for ONE ground — `currentColor` is not used, because an external
SVG loaded through `<img>` does not inherit the page's colour and resolves it to
black. `*.svg` is chalk + mint for the dark ground; `*-ink.svg` is one-colour ink
for paper and print (mint measures ~1.35:1 on `--paper`, so the live dot goes to
ink there). The one place `currentColor` is correct is `src/components/ui/Logo.tsx`,
which inlines the mark and so tracks the header's ground.
