"""Cuts the production assets for concept B.

Colour, deliberately NOT currentColor: these files are consumed as
`<img src="/logo-*.svg">`, and an external SVG does not inherit the embedding
page's colour — currentColor resolves to the SVG's own initial value (black) and
the mark disappears on the dark ground. So each file is cut for ONE ground:

  *.svg      chalk ring + mint dot  — the dark ground (#0A1712 / #10241B)
  *-ink.svg  ink throughout         — paper (#EDEDE6) and print

On paper the live dot goes to ink rather than mint: mint on paper measures
~1.35:1, and the system forbids a dark-ground token on a light ground.

The one place currentColor is right is `src/components/ui/Logo.tsx`, which
inlines the mark into the page and so does inherit the header's tone.
"""
import pathlib, lockup as L, mark as M

PUB = pathlib.Path("/Users/brunomaurino/projects/codirity/public")
APP = pathlib.Path("/Users/brunomaurino/projects/codirity/src/app")

CHALK, MINT, INK, GROUND2 = "#F4F7F2", "#6EE7A8", "#0A1712", "#10241B"

HEAD = ('<!-- Codirity — concept B, "the aperture". {ground}\n'
        '     Generated from docs/logo-explore/{src} — edit the source, not this file. -->\n')

def write(path, svg, src, ground):
    path.write_text(HEAD.format(src=src, ground=ground) + svg + "\n")
    print(f"  {path.parent.name}/{path.name:28s} {len(svg):>5d}B  {ground}")

DARK  = "For the DARK ground: chalk ring, mint live dot."
PAPER = "For PAPER and print: one colour, ink throughout."

for name, kw, ground in (
    ("logo-mark",             dict(),                        DARK),
    ("logo-mark-ink",         dict(ring=INK, dot=INK),       PAPER),
):
    write(PUB / f"{name}.svg", M.mark_svg(**({"ring": CHALK} | kw)), "mark.py", ground)

for name, kw, ground in (
    ("logo-lockup",              dict(),                                    DARK),
    ("logo-lockup-ink",          dict(ring=INK, dot=INK),                   PAPER),
    ("logo-lockup-stacked",      dict(stacked=True),                        DARK),
    ("logo-lockup-stacked-ink",  dict(stacked=True, ring=INK, dot=INK),     PAPER),
):
    write(PUB / f"{name}.svg", L.lockup(**({"ring": CHALK} | kw)), "lockup.py", ground)

# --- favicon ---------------------------------------------------------------
# Next.js App Router serves this as <link rel="icon"> on every route. It carries
# its own tile because a browser tab strip is neither dark nor light: the bare
# mark would vanish on half of them.
x0, y0, x1, y1 = M.small_ink_bbox()
ink = max(x1 - x0, y1 - y0)
box = ink / 0.62
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
vx, vy = cx - box / 2, cy - box / 2
icon = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx:.2f} {vy:.2f} {box:.2f} {box:.2f}" '
        f'width="{box:.2f}" height="{box:.2f}" role="img" aria-label="Codirity">'
        f'<title>Codirity</title>'
        f'<rect x="{vx:.2f}" y="{vy:.2f}" width="{box:.2f}" height="{box:.2f}" '
        f'rx="{box * 0.22:.2f}" fill="{GROUND2}"/>'
        f'{M.small_body(CHALK, MINT)}</svg>')
write(APP / "icon.svg", icon, "build_assets.py", "Tab tile, ground-2.")
