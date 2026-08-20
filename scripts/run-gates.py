#!/usr/bin/env python3
"""Run every mechanical gate the redesign built, in one command.

`npm test` — the thing this repo did not have.

redesign-v4 shipped seventeen gate scripts across six bundles and NOTHING ran
them: each was invoked by hand, once, by whoever wrote it. The cost of that is
on the record — W4 shipped its flagship deliverable dead (an `animation:` whose
`@keyframes` were never ported, so the wipe silently never ran) and only an
adversarial review caught it. The gate that would have caught it already
existed.

Three of these need a rendered page, so this builds and serves the site itself
rather than asking the caller to remember. Pass --skip-build to reuse an
existing .next and a server you already have up on $PORT.

Exit code is the number of failing gates, so CI fails loudly and a human can
see how much is broken at a glance.
"""
from __future__ import annotations

import argparse
import http.client
import os
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get("PORT", "3111"))
PAGE = ROOT / ".next" / "gate-page.html"

# (label, argv). `{page}` is substituted with the rendered document's path.
GATES: list[tuple[str, list[str]]] = [
    ("w2  terms band — copy vs mockup, both directions", ["python3", "scripts/w2-copy-gate.py", "{page}"]),
    ("w2  terms band — copy gate SELF-TEST", ["python3", "scripts/w2-copy-gate-selftest.py", "{page}"]),
    ("w2  terms band — compiled CSS contracts", ["python3", "scripts/w2-css-gate.py"]),
    ("w3  queue scene — copy vs mockup", ["python3", "scripts/w3-copy-gate.py", "{page}"]),
    ("w3  queue scene — motion contracts", ["python3", "scripts/w3-motion-gate.py"]),
    ("w3  queue scene — motion gate SELF-TEST", ["python3", "scripts/w3-motion-gate-selftest.py", "{page}"]),
    ("w3  queue quantizer — steps 0→3", ["npx", "tsx", "scripts/w3-quantizer-test.ts"]),
    ("w4  case studies — fact provenance, both directions", ["python3", "scripts/w4-facts-gate.py", "{page}"]),
    ("w4  case studies — facts gate SELF-TEST", ["python3", "scripts/w4-facts-gate-selftest.py", "{page}"]),
    ("w4  case studies — compiled CSS + orphaned animations", ["python3", "scripts/w4-css-gate.py"]),
    ("w5  paper run — services literal + FAQ/JSON-LD parity", ["python3", "scripts/w5-copy-gate.py", "{page}"]),
    ("w5  paper run — strike + hover contracts", ["python3", "scripts/w5-css-gate.py"]),
    ("w5  paper run — gate SELF-TEST", ["python3", "scripts/w5-gate-selftest.py", "{page}"]),
    ("w6  close — headline rejoin + funnel intact", ["python3", "scripts/w6-close-gate.py", "{page}"]),
    ("w6  retirement sweep — source AND shipped bytes", ["python3", "scripts/w6-sweep-gate.py"]),
]


def sh(argv: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(argv, cwd=ROOT, **kw)


def wait_for_server(port: int, timeout: float = 60.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            conn = http.client.HTTPConnection("127.0.0.1", port, timeout=2)
            conn.request("GET", "/")
            if conn.getresponse().status == 200:
                return True
        except OSError:
            time.sleep(0.5)
    return False


def fetch(port: int, path: str, dest: Path) -> bool:
    try:
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=15)
        conn.request("GET", path)
        r = conn.getresponse()
        if r.status != 200:
            return False
        dest.write_bytes(r.read())
        return True
    except OSError:
        return False


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-build", action="store_true",
                    help="reuse an existing .next and a server already on $PORT")
    args = ap.parse_args()

    server = None
    try:
        if not args.skip_build:
            print("· building…", flush=True)
            if sh(["npm", "run", "build"], stdout=subprocess.DEVNULL).returncode != 0:
                print("BUILD FAILED — gates need a build to check the shipped bytes")
                return 1
            print(f"· serving on :{PORT}…", flush=True)
            server = subprocess.Popen(
                ["npm", "run", "start", "--", "-p", str(PORT)],
                cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
        if not wait_for_server(PORT):
            print(f"no server answering on :{PORT}")
            return 1
        PAGE.parent.mkdir(parents=True, exist_ok=True)
        if not fetch(PORT, "/", PAGE):
            print("could not fetch the rendered page")
            return 1

        failed: list[str] = []
        for label, argv in GATES:
            cmd = [a.replace("{page}", str(PAGE)) for a in argv]
            r = sh(cmd, capture_output=True, text=True)
            ok = r.returncode == 0
            print(f"  {'PASS' if ok else 'FAIL'}  {label}")
            if not ok:
                failed.append(label)
                tail = (r.stdout + r.stderr).strip().splitlines()[-12:]
                for line in tail:
                    print(f"          {line}")

        print()
        if failed:
            print(f"{len(failed)} of {len(GATES)} gates FAILED:")
            for f in failed:
                print(f"  - {f}")
            return len(failed)
        print(f"all {len(GATES)} gates pass.")
        return 0
    finally:
        if server is not None:
            os.killpg(os.getpgid(server.pid), signal.SIGTERM)
        if PAGE.exists():
            PAGE.unlink()
        shutil.rmtree(ROOT / ".next" / "gate-tmp", ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
