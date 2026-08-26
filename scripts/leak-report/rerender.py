#!/usr/bin/env python3
"""
Re-render report.md from a saved raw.json, without re-scanning.

Scanning a prospect costs their bandwidth and our patience, so when the ranking or the
wording changes, the reports get rebuilt from what was already measured rather than by
hitting 20 sites again.

    python3 rerender.py                 # every leads/*/raw.json under the cwd
    python3 rerender.py leads/acme-com  # just one
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import scan as S  # noqa: E402


def rerender(d: Path) -> str:
    raw = json.loads((d / "raw.json").read_text())
    res = raw["result"]
    # Re-DERIVE the findings, don't reuse the saved ones. build_findings() is a pure
    # function of the measurement, so a change to ranking or wording has to be replayed
    # through it — otherwise this rewrites the report around stale conclusions, which is
    # exactly what it happened to do the first time it was used.
    findings = S.build_findings(res)
    report = S.render(res.get("domain", d.name), res, findings)
    (d / "report.md").write_text(report)
    raw["findings"] = findings
    (d / "raw.json").write_text(json.dumps(raw, indent=2, default=str))
    strong = [f for f in findings if f["severity"] <= 2]
    return ("TIER A  " + strong[0]["subject"][:58]) if strong else \
           ("—       " + (f"{len(findings)} low-severity only" if findings else "no findings"))


def main() -> int:
    args = [Path(a) for a in sys.argv[1:]]
    dirs = args or sorted(p.parent for p in Path("leads").glob("*/raw.json"))
    if not dirs:
        print("no leads/*/raw.json found", file=sys.stderr)
        return 1
    for d in dirs:
        if not (d / "raw.json").exists():
            print(f"skip {d} (no raw.json)", file=sys.stderr)
            continue
        print(f"{d.name:<24} {rerender(d)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
