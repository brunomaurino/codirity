"""Rasterises the favicon tile straight from the mark's parameters.

Not an SVG rasteriser: the mark is an arc, a dot and a rounded tile, so Pillow
draws it directly from the same numbers `mark.py` feeds the SVG. 8x supersample,
Lanczos down — the shapes are large and round, and this keeps the 16px cut from
turning to mush.
"""
from PIL import Image, ImageDraw
import mark as M

GROUND, CHALK, MINT = (0x10, 0x24, 0x1B, 255), (0xF4, 0xF7, 0xF2, 255), (0x6E, 0xE7, 0xA8, 255)
SS = 8

def tile(size):
    x0, y0, x1, y1 = M.small_ink_bbox()
    ink = max(x1 - x0, y1 - y0)
    box = ink / 0.62                                   # ink fills 62% of the tile
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    ox, oy = cx - box / 2, cy - box / 2                # viewBox origin
    k = size * SS / box                                # mark units -> device px
    def P(x, y): return ((x - ox) * k, (y - oy) * k)

    im = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, size * SS - 1, size * SS - 1],
                        radius=box * 0.22 * k, fill=GROUND)

    r, sw = M.R_MARK, M.SMALL_SW
    bx0, by0 = P(M.CX - r, M.CY - r); bx1, by1 = P(M.CX + r, M.CY + r)
    # Pillow: degrees clockwise from 3 o'clock, y down. The aperture opens right,
    # so the stroke runs from +50 deg round through the left side to -50 (=310).
    d.arc([bx0, by0, bx1, by1], M.APERTURE, 360 - M.APERTURE,
          fill=CHALK, width=max(1, round(sw * k)))
    # arc() has butt ends; the mark's terminals are pills, so cap them by hand.
    import math
    for sign in (1, -1):
        a = math.radians(M.APERTURE) * sign
        ex, ey = P(M.CX + r * math.cos(a), M.CY + r * math.sin(a))
        rr = sw * k / 2
        d.ellipse([ex - rr, ey - rr, ex + rr, ey + rr], fill=CHALK)

    dx, dy = P(M.DOT_CX, M.CY); dr = M.SMALL_DOT_R * k
    d.ellipse([dx - dr, dy - dr, dx + dr, dy + dr], fill=MINT)
    return im.resize((size, size), Image.LANCZOS)

if __name__ == "__main__":
    sizes = [16, 32, 48]
    imgs = [tile(s) for s in sizes]
    imgs[1].save("/Users/brunomaurino/projects/codirity/src/app/favicon.ico",
                 format="ICO", sizes=[(s, s) for s in sizes],
                 append_images=[imgs[0], imgs[2]])
    tile(180).save("/Users/brunomaurino/projects/codirity/src/app/apple-icon.png")
    print("favicon.ico", sizes, "+ apple-icon.png 180")
