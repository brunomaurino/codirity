# The Leak Report

Pre-sales site scanner for the 30-day campaign. Given a prospect's domain it finds concrete,
verifiable defects on their own site, so the first email carries a fact instead of a pitch.

```bash
python3 scan.py acme.com                      # writes leads/acme-com/report.md + raw.json
python3 scan.py acme.com --slow               # for sites that rate-limit (see below)
python3 scan.py acme.com --max-urls 500       # default 300
python3 scan.py acme.com --recheck-cap 800    # default 200 — raise it on a very broken site
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

## The guards (this is the part that matters)

The whole campaign rests on the finding being true **and** being about what we say it is about. A
false accusation in a cold email is worse than no email, so the scanner refuses to claim what it
cannot stand behind. Every one of these was added after watching it get something wrong:

**Is the claim true?**

1. **Soft-404 probe.** Before trusting any 404, it requests a URL that cannot exist. If the site
   answers 200, its 404s are soft, a 200 proves nothing, and the entire sitemap claim is suppressed.
2. **Serial re-verification.** Every dead or 5xx URL is re-checked alone, 1.5s later. Only a repeat
   failure is reportable. A site wobbling under our own scan does not become a finding.
3. **Throttle detection.** More than 10% 429/503 means the site is rate-limiting us; status findings
   are suppressed. Re-run with `--slow`. *(edairymarket.com threw 24 × 429 at `--max-urls 40`.)*

**Did we measure enough to say it?**

4. **Coverage floor.** Under 25% coverage on a site with 100+ URLs, the report returns
   *inconclusive* instead of a verdict. "No findings" at 0.5% coverage is not a clean bill of health.
5. **No silent cap.** Serial re-verification stops at `--recheck-cap` (200). Whatever it does not
   reach is carried as *unverified* and extrapolated from at the rate the re-checked sample actually
   confirmed at — never dropped, and the headline says "at least". *(A bare `[:40]` used to delete
   the remainder: trytrata.com, 795 dead of 800, and trychannel3.com, 414, both reported "40 of
   800" on 2026-08-27. Two unrelated domains printing the identical number is the only reason it
   was caught.)*
6. **Random sampling.** The head of a sitemap is the homepage and top nav — the best-maintained URLs
   a site has. Sampling them first made the scanner near-blind: the first live batch covered 0.50%
   of 107,717 URLs and reported 1 Tier A account. Random sampling at 800 found 5.

**Is the claim about the right thing?**

7. **Newsletter and social links are not checkouts.** A `href="#"` newsletter button matched on the
   word "subscribe" and produced "your pricing CTA does not reach a checkout" — false, about a form
   that works fine.
8. **410 Gone is not 404.** A 410 is a deliberate takedown. Reporting it as a broken page accuses a
   founder of a bug they made on purpose; the real defect is the sitemap still listing it.

## Self-test

```bash
python3 selftest.py
```

38 assertions over five passes against a local server with deliberately injected defects: every
check watched firing on a known defect, then every suppression guard watched refusing to fire — on
a soft-404 site, a flaky 500, a throttling site, a thin sample, and a metadata-only account.

It found three real bugs on its first run: redirects were invisible because `urlopen` follows them
silently, and `href="#"` CTAs matched no URL pattern because they are not URLs. Guards 4-7 came
later, from the first live batch — each one from a claim that was about to be wrong in an email.

A check that has never failed is not a check. Run this after any edit to `scan.py`.

`rerender.py` replays saved measurements through the current ranking, so changing the rules does not
cost 20 prospects another scan.
