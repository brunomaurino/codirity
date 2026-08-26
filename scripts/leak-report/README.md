# The Leak Report

Pre-sales site scanner for the 30-day campaign. Given a prospect's domain it finds concrete,
verifiable defects on their own site, so the first email carries a fact instead of a pitch.

```bash
python3 scan.py acme.com                      # writes leads/acme-com/report.md + raw.json
python3 scan.py acme.com --slow               # for sites that rate-limit (see below)
python3 scan.py acme.com --max-urls 500       # default 300
python3 scan.py acme.com --psi-key $KEY       # optional Core Web Vitals
```

Stdlib only. No install, nothing to keep up to date.

## What it checks

| # | Check | Why it leads |
|---|-------|--------------|
| 1 | sitemap vs live responses (404 / 5xx / redirect chains / redirect-to-home) | The eDairyMarket story: 27 of 273 pages 404ing in the sitemap Google crawls |
| 2 | SSR — does the HTML render without JavaScript | Codirity's own ThemeProvider mount-gate: a lead-gen site serving an empty body to crawlers |
| 3 | checkout — pricing CTAs that are `href="#"`, Stripe test mode, or broken | Finding a checkout that cannot take money is an instant meeting |
| 4 | metadata — title / description / OG / JSON-LD on sampled pages | Cheap to find, cheap to fix: a good first queue item |
| 5 | Core Web Vitals (optional) | A public number, comparable against their competition |

## The report

`report.md` opens with **the wedge**: the subject line and the opener for email 1, taken from the
highest-severity finding. Everything below it is the evidence, and the rest of the findings are the
day-3 follow-up. **Never send them all at once** — the follow-up needs its own ammunition.

If a domain produces **no findings**, do not send it a Tier A wedge. Drop it to Tier B or cut it.

## The three guards (this is the part that matters)

The whole campaign rests on the finding being true. A false accusation in a cold email is worse
than no email, so the scanner refuses to claim things it cannot stand behind:

1. **Soft-404 probe.** Before trusting any 404, it requests a URL that cannot exist. If the site
   answers 200, its 404s are soft, a 200 proves nothing, and the entire sitemap claim is suppressed
   with a warning rather than reported.
2. **Serial re-verification.** Every dead or 5xx URL is re-checked alone, 1.5s later. Only a repeat
   failure is reportable. A site wobbling under our own scan does not become a finding.
3. **Throttle detection.** If more than 10% of requests come back 429/503, the site is rate-limiting
   us and status findings are suppressed entirely. Re-run with `--slow`.

Guard 3 exists because edairymarket.com rate-limited this scanner at 80 URLs. At `--max-urls 40` it
threw 24 × 429 and the report correctly refused to say anything about broken pages; at
`--max-urls 25 --slow` it came back genuinely clean.

## Self-test

```bash
python3 selftest.py
```

22 assertions over three passes against a local server with deliberately injected defects: every
check watched firing on a known defect, then both suppression guards watched refusing to fire on a
soft-404 site, a flaky 500, and a throttling site. It found three real bugs on its first run
(redirects invisible because urlopen follows them silently, and `href="#"` CTAs matching no URL
pattern). A check that has never failed is not a check — run this after any edit to `scan.py`.
