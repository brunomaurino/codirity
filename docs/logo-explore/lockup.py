"""Outlines the Codirity wordmark (Apfel Grotezk Mittel, -0.012em) and locks it
up with the Concept B mark. Outlined rather than <text> so the files carry no
font dependency."""
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.misc.transform import Transform
import uharfbuzz as hb
import pathlib, tempfile
import mark as M

# HarfBuzz will not open a woff2, so decompress the shipped face on demand.
# src/fonts/ is the single source for the outlines — never a re-downloaded copy.
WOFF2 = pathlib.Path(__file__).resolve().parents[2] / "src/fonts/ApfelGrotezk-Mittel.woff2"
TTF = str(pathlib.Path(tempfile.gettempdir()) / "codirity-apfel-mittel.ttf")
if not pathlib.Path(TTF).exists():
    _f = TTFont(str(WOFF2)); _f.flavor = None; _f.save(TTF)
FS    = 100.0          # nominal em
CAP   = 0.650 * FS
TRACK = -0.012 * FS    # the site's .display tracking

font = TTFont(TTF)
gs, order = font.getGlyphSet(), font.getGlyphOrder()
_hb = hb.Font(hb.Face(hb.Blob(open(TTF, "rb").read())))
_buf = hb.Buffer(); _buf.add_str("Codirity"); _buf.guess_segment_properties()
hb.shape(_hb, _buf, {"kern": True, "liga": True})
SHAPED = list(zip(_buf.glyph_infos, _buf.glyph_positions))

def wordmark(fs=FS):
    """(path d-strings, ink bbox) in y-DOWN units, baseline at y=0, pen at x=0."""
    k = fs / 1000.0
    ds, pen = [], 0.0
    bb = [1e9, 1e9, -1e9, -1e9]
    for i, (gi, gp) in enumerate(SHAPED):
        name = order[gi.codepoint]
        rec = RecordingPen(); gs[name].draw(rec)
        t = Transform(k, 0, 0, -k, pen + gp.x_offset * k, -gp.y_offset * k)
        sp = SVGPathPen(gs); rec.replay(TransformPen(sp, t))
        d = sp.getCommands()
        if d:
            ds.append(d)
            bp = BoundsPen(gs); rec.replay(TransformPen(bp, t))
            if bp.bounds:
                x0, y0, x1, y1 = bp.bounds
                bb = [min(bb[0], x0), min(bb[1], y0), max(bb[2], x1), max(bb[3], y1)]
        pen += gp.x_advance * k
        if i < len(SHAPED) - 1:
            pen += TRACK * (fs / FS)
    return ds, tuple(bb)

def lockup(ring="currentColor", dot="#6EE7A8", ratio=None, gap=None, stacked=False):
    # A stacked lockup reads with the mark as the dominant element; the
    # horizontal one reads as one line of type with a mark in front of it.
    if ratio is None:
        ratio = M.LOCKUP_RATIO_STACKED if stacked else M.LOCKUP_RATIO
    gap   = (M.LOCKUP_GAP if gap is None else gap) * CAP
    ds, (wx0, wy0, wx1, wy1) = wordmark()

    mx0, my0, mx1, my1 = M.ink_bbox()
    ink_h = my1 - my0
    s = ratio * CAP / ink_h
    mw, mh = (mx1 - mx0) * s, ink_h * s

    def mark_g(tx, ty):
        return (f'<g transform="translate({tx:.3f} {ty:.3f}) scale({s:.5f}) '
                f'translate({-mx0:.3f} {-my0:.3f})">{M.mark_body(ring, dot)}</g>')

    if stacked:
        wm_w = wx1 - wx0
        cx = max(mw, wm_w) / 2
        top = 0.0
        g1 = mark_g(cx - mw / 2, top)
        wy = top + mh + 0.42 * CAP + CAP          # baseline of the wordmark
        g2 = (f'<g transform="translate({cx - wm_w / 2 - wx0:.3f} {wy:.3f})" fill="{ring}">'
              + "".join(f'<path d="{d}"/>' for d in ds) + '</g>')
        x0, y0 = min(cx - mw / 2, cx - wm_w / 2), top
        x1, y1 = max(cx + mw / 2, cx + wm_w / 2), wy + wy1
        body = g1 + g2
    else:
        my_top = -CAP / 2.0 - mh / 2.0            # centred on the cap band
        g1 = mark_g(0.0, my_top)
        wdx = mw + gap - wx0
        g2 = (f'<g transform="translate({wdx:.3f} 0)" fill="{ring}">'
              + "".join(f'<path d="{d}"/>' for d in ds) + '</g>')
        x0, y0 = 0.0, min(my_top, wy0)
        x1, y1 = wdx + wx1, max(my_top + mh, wy1)
        body = g1 + g2

    w, h = x1 - x0, y1 - y0
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} {y0:.2f} {w:.2f} {h:.2f}" '
            f'width="{w:.2f}" height="{h:.2f}" fill="none" role="img" aria-label="Codirity">'
            f'<title>Codirity</title>{body}</svg>')
