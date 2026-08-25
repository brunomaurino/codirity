"""Concept B — the aperture. One parametric source for every asset.

The mark is drawn in a 120x120 box: a monoline C (r=40) with pill terminals and
the live dot in the aperture. Stroke weight is NOT arbitrary — it is solved so
that, at the lockup ratio below, the mark's stroke lands on the same optical
weight as Apfel Grotezk Mittel's round-letter stroke (114/1000 em, measured off
the 'o' at half cap height). Cap height is 650/1000.
"""
import math

R_MARK   = 40.0    # arc radius in mark units
SW       = 11.0    # stroke weight (solved: see LOCKUP_RATIO)
DOT_R    = 8.0     # live dot — deliberately ~45% wider than the stroke so it
                   # reads as the live signal and not as a terminal — Bruno's call
                   # after seeing it at header scale (24px type -> ~4px dot)
APERTURE = 50.0    # half-angle of the opening, in degrees
CX = CY  = 60.0

LOCKUP_RATIO = 1.45   # mark ink height / wordmark cap height
LOCKUP_RATIO_STACKED = 2.30  # the stacked cut leads with the mark
LOCKUP_GAP   = 0.55   # gap / cap height — wide enough that the dot reads as
                      # part of the mark and not as punctuation before the "C"

def _arc():
    a = math.radians(APERTURE)
    x = CX + R_MARK * math.cos(a)
    y0 = CY - R_MARK * math.sin(a)
    y1 = CY + R_MARK * math.sin(a)
    return f"M{x:.2f} {y0:.2f}A{R_MARK:.0f} {R_MARK:.0f} 0 1 0 {x:.2f} {y1:.2f}"

ARC = _arc()
DOT_CX = CX + R_MARK

def ink_bbox():
    x0 = CX - R_MARK - SW / 2
    x1 = max(CX + R_MARK + SW / 2, DOT_CX + DOT_R)
    y0 = CY - R_MARK - SW / 2
    y1 = CY + R_MARK + SW / 2
    return x0, y0, x1, y1

def mark_body(ring, dot):
    return (f'<path d="{ARC}" fill="none" stroke="{ring}" stroke-width="{SW:.0f}" stroke-linecap="round"/>'
            f'<circle cx="{DOT_CX:.0f}" cy="{CY:.0f}" r="{DOT_R}" fill="{dot}"/>')

def mark_svg(ring="currentColor", dot="#6EE7A8", pad=0.0, box=None):
    """Standalone mark, trimmed to its ink (plus optional padding)."""
    x0, y0, x1, y1 = ink_bbox()
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad
    w, h = x1 - x0, y1 - y0
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} {y0:.2f} {w:.2f} {h:.2f}" '
            f'width="{box or w:.2f}" height="{box or h:.2f}" fill="none" '
            f'role="img" aria-label="Codirity">'
            f'<title>Codirity</title>{mark_body(ring, dot)}</svg>')

# --- optical small variant -------------------------------------------------
# Below ~24px the hairline stroke and the live dot both fall under a device
# pixel on 1x displays. The favicon/avatar cut thickens both rather than
# shrinking the full-size drawing: same construction, same proportions, more ink.
SMALL_SW    = 13.0
SMALL_DOT_R = 9.5

def small_body(ring, dot):
    return (f'<path d="{ARC}" fill="none" stroke="{ring}" stroke-width="{SMALL_SW:.0f}" stroke-linecap="round"/>'
            f'<circle cx="{DOT_CX:.0f}" cy="{CY:.0f}" r="{SMALL_DOT_R}" fill="{dot}"/>')

def small_ink_bbox():
    x0 = CX - R_MARK - SMALL_SW / 2
    x1 = max(CX + R_MARK + SMALL_SW / 2, DOT_CX + SMALL_DOT_R)
    y0 = CY - R_MARK - SMALL_SW / 2
    y1 = CY + R_MARK + SMALL_SW / 2
    return x0, y0, x1, y1
