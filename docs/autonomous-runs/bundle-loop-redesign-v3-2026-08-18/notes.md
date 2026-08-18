# autonomous-bundle-loop session notes — redesign-v3 ("Monthly Club")

**HANDOFF:** `docs/HANDOFF-redesign-v3.md`
**Plan-name:** `redesign-v3`
**Started:** 2026-08-18 (session `9ddef8ab-5417-4799-aa93-32a4f171aaad`)
**Merge policy:** FULL auto-merge, every bundle including V0 — operator explicitly authorized this
2026-08-18 ("Quiero que hagas TODO sin preguntarme nada") after approving the exact visual system
live via the "Monthly Club" pitch artifact (built directly off a designjoy.co teardown). No
operator pause anywhere in this plan. Recorded in HANDOFF §0.
**gh account:** `brunomaurino` (confirmed active, same as the client-onboarding loop earlier
today).

## Bundle list snapshot at start

| Bundle | Scope | Depends on | Status |
|---|---|---|---|
| V0 | Foundation flip (tokens, Figtree, blob utilities, shapes) | — | `[x]` complete (PR #20, f9a8985) |
| V1 | Hero | V0 | `[x]` complete (PR #21, 017e7f9) |
| V2 | Process + Benefits | V0 | `[x]` complete (PR #22, f2a21ba) |
| V3 | Services (scope pill-cloud) | V0 | `[x]` complete (PR #23, 3ebedd5) |
| V4 | Clients (eDairyCorp/Meshio/Vivi) | V0 | `[x]` complete (PR #24, 83b5b1a; content amended post-merge, see below) |
| V5 | Pricing (D3/D5 resolved) | V0 | `[x]` complete (PR #25, dace932) |
| V6 | FAQ + final CTA close | V0 | `[ ]` not started |
| V8 | Case studies (eDairyMarket + Meshio) | V0 | `[ ]` not started |

V7 (real team photos) deliberately removed from the table — gated on D2, no photos supplied. Not
part of this run.

## Decisions made by the orchestrator

- Pre-flight fix: removed the V7 row from §2 before launch (would have hard-stopped the loop —
  the parser only recognizes `[ ]`/`[x]`, and V7 had no §3 launch command).
- Pre-flight fix: wrote §3.V1 through §3.V6 and §3.V8 launch commands up front (the sanity check
  requires ALL bundles to have a matching command before the loop will start, not just the next
  one) — used the already-detailed §2 scope column + §7's resolved case-study content as the
  source, no invented scope.

## PR ledger across bundles

| Bundle | PR | Merge SHA | Review battery | Notes |
|---|---|---|---|---|
| V0 | [#20](https://github.com/brunomaurino/codirity/pull/20) | `f9a8985` | 17/17 confirmed (2 BLOCKER, 6 MAJOR, 9 MINOR), 0 refuted, 0 deferrals | Self-caught a `--white` dark-mode invisible-text bug pre-battery; battery then caught a second self-inflicted regression mid-fix (see below) |
| V1 | [#21](https://github.com/brunomaurino/codirity/pull/21) | `017e7f9` | 7/7 confirmed (3 MAJOR, 4 MINOR), 0 refuted, 0 deferrals | First real consumer of `.blob-1` immediately tripped the exact contrast risk V0's scrim was built for (a lightening overlay on top of it) — confirms that guidance to future bundles needs to be explicit, not assumed |
| V2 | [#22](https://github.com/brunomaurino/codirity/pull/22) | `f2a21ba` | 10/10 confirmed (2 MAJOR, 8 MINOR), 0 refuted, 0 deferrals | Extracted a shared `AccentWord` component (`src/components/ui/AccentWord.tsx`) + `SectionHeader.title: ReactNode` + `src/lib/blob.ts` (typed `BlobClass`) for future bundles to reuse; opacity-on-blob-text repeated the same contrast-pitfall class as V1's finding, this time via `opacity-NN` utilities rather than a lightening overlay |
| V3 | [#23](https://github.com/brunomaurino/codirity/pull/23) | `3ebedd5` | 6/6 confirmed (2 MAJOR, 4 MINOR), 0 refuted, 0 deferrals | Found + fixed a PRE-EXISTING dark-mode contrast bug in the shared `Badge` component (4.27:1, under AA) that was already live on `Pricing.tsx`'s founding banner and `PricingCard.tsx`'s plan badge before this bundle touched anything — fixed at the source so it propagates to every consumer, not just this bundle's own new usage |
| V5 | [#25](https://github.com/brunomaurino/codirity/pull/25) | `dace932` | 11 clusters, 3 MAJOR confirmed 5/5, 0 refuted, all 11 applied | **Salvaged run** — the orchestrating session was killed by the usage limit mid-Phase-5 (build + battery had both finished; 5 of 11 findings were applied but uncommitted in the worktree). Resumed from a fresh session via `/resume-anywhere`: battery NOT re-run (its journal was complete), remaining 6 findings applied, PR opened and merged from there. Battery's headline catch: `.glass-dark`'s backdrop blur never rendered outside Safari (Lightning CSS drops the second of two identical-value declarations) — the builder had examined and *rejected* this on a false premise, and the battery overturned it with live browser evidence. Also caught that the D3 75%→50% guarantee correction had leaked past the site into the **Trello onboarding template** copied to every new client |
| V4 | [#24](https://github.com/brunomaurino/codirity/pull/24) | `83b5b1a` | 9/9 confirmed (1 BLOCKER, 1 MAJOR, 7 MINOR), 0 refuted, 0 deferrals | Content-sensitive bundle; battery caught a real BLOCKER (stale section header contradicting the honest client/ours cards). **Post-merge:** Bruno directed (live, in-session, after the trade-off was explicitly surfaced) that all 3 entries present as "client" uniformly, superseding the original D6 client/ours distinction this PR had just shipped — see the follow-up direct commit `4f47ca3` and the HANDOFF §5/§6 amendment note |

## Cross-bundle drift / surfaced concerns

- **Pattern worth watching in V1-V8: dual-role color tokens.** V0's battery
  proved that `--green-main`/`--green-dark` cannot serve both "text color on
  the page background" AND "solid-fill surface under white text" in dark
  mode — the AA-contrast luminance ranges for those two jobs don't overlap.
  Fixed by splitting into `--green-main`/`--green-dark` (text) vs.
  `--green-fill`/`--green-fill-dark` (surface-under-white-text) — see V0's
  `notes.md` "Review findings + resolutions" for the full reasoning + the
  ~11 call sites moved to the new tokens (Button, Header, Hero, Faq,
  PricingCard, ServiceCard, ContactInfo, Card, ProcessStep, Footer,
  Toaster). If V1+ introduces any NEW color usage that pairs a brand color
  with white/near-white text in dark mode, use `bg-brand-fill`/
  `border-brand-fill` (or the `-dark` variant), never bare `bg-brand`/
  `bg-brand-dark` — those now resolve to the bright TEXT-tuned value and
  will repeat the same contrast failure if used as a fill.
- **`@layer` discipline.** V0's battery also caught that `h1-h4` and every
  hand-authored utility class (`.accent`, `.blob-*`, `.btn-pill`,
  `.card-soft`, `.glass-dark`) were originally unlayered CSS, which silently
  beats ALL Tailwind utilities regardless of specificity. Now correctly
  wrapped in `@layer base` (element defaults) / `@layer components`
  (overridable compositions). Any NEW hand-authored CSS class added in V1-V8
  should follow the same pattern — `@layer components` for anything meant to
  be combined with Tailwind utility overrides at the call site.
- **`.blob-*` utilities now carry a built-in 50% dark scrim** (added in V0's
  fix) so white/near-white text is always safe on top, in both themes.
  V1/V2/V4/V5/V8 (all specified to consume `.blob-*`) don't need to add
  their own contrast handling — just use white/near-white text as the
  utilities' own comment states.
- **Correction to the above, from V1's own battery**: "don't need to add
  contrast handling" does NOT mean "any translucent overlay is safe." V1's
  first real `.blob-1` consumer added a `bg-white/15` badge fill on top of
  the blob and immediately undid the scrim's protection (contrast dropped
  to ~2.9-3.9:1). The rule for anything layered ON TOP of a `.blob-*`
  surface: darkening overlays (`bg-black/NN`) are always safe (can only
  move contrast further from the scrimmed baseline), lightening ones
  (`bg-white/NN`) are NOT — they fight the scrim and can reintroduce the
  exact failure V0 fixed. V2/V4/V5/V8: if a blob card gets its own badge/
  pill/overlay treatment, use `bg-black/NN`, never `bg-white/NN`.
- **Second correction, from V2's battery**: the same contrast pitfall has a
  THIRD form beyond lightening overlays — `opacity-NN` on the TEXT ITSELF
  (not a background layer) sitting on a `.blob-*` surface. V2's Benefits
  tiles used `opacity-85` body copy and ProcessStep's `opacity-70` step
  number; both dropped below WCAG AA the same way a lightening overlay
  does. Rule, complete: text/icons on a `.blob-*` surface must be
  FULL-opacity white/near-white (`#f4fbf6`, inherited automatically from
  the blob utility's own `color` — don't override it with an opacity
  utility). Any background layer added on top must be `bg-black/NN`, never
  `bg-white/NN`. V4/V5/V8: check for stray `opacity-*` on blob-surface text
  before shipping, not just overlay colors.
- **Shared components now available for V3/V6/V8** (all specified to use
  the `.accent` one-word treatment per the HANDOFF): `AccentWord`
  (`src/components/ui/AccentWord.tsx`, exported from `@/components/ui`) —
  whole-word-safe, degrades gracefully if the word is missing; pass it as
  `SectionHeader`'s `title` prop (now `React.ReactNode`, was `string`) or
  anywhere else a heading needs it. Also `BLOB_CLASSES`/`BlobClass`
  (`src/lib/blob.ts`) — use the typed union instead of a bare `string` prop
  for anything taking a blob utility name, so a typo fails to compile
  instead of silently rendering an unstyled card. NOTE: `Hero.tsx` (V1)
  still has its own independent, NOT-migrated copy of the accent-word
  logic — pre-dates `AccentWord` and works correctly, but isn't using the
  shared component. Not a defect, just be aware if touching that file.
- **Operational gotcha, V1/V2/V3 all hit this**: `gh auth` silently
  reverts to the wrong default account (`brunoiwp`, not `brunomaurino`,
  the repo owner) at some point between bundles — possibly when entering a
  fresh worktree/session. Re-run `gh auth status` (and `gh auth switch
  --user brunomaurino` if needed) immediately before every `gh pr create`
  AND before every plain `git push` to main, not just once at loop start.
- **`Badge` component's dark-mode contrast — fixed at the source in V3.**
  `badgeVariants`'s `brand` variant now carries `dark:text-brand` (was
  `text-brand-dark` alone, which measured 4.27:1 in dark mode, under AA).
  This was a PRE-EXISTING bug already live on `Pricing.tsx`'s founding-rate
  banner and `PricingCard.tsx`'s plan-name badge — V3 found it while
  reviewing its own new `<Badge>` usage, not by targeting those files. **V5
  (Pricing) does not need to re-fix this** — inherits the corrected value
  automatically since both components already consume `<Badge>`/
  `badgeVariants`. If V5 adds any NEW pill/tag treatment, prefer `<Badge>`
  over hand-rolled classes (as V3 now does) so future fixes propagate the
  same way.
- **D6 AMENDED post-V4-merge (2026-08-18) — binding on V8.** Bruno directed,
  live in-session after the trade-off was explicitly surfaced to him, that
  all three clients-section entries present as "client" — superseding the
  original resolution's `client`/`ours` honesty-tag distinction (eDairyCorp
  "client", Meshio/Vivi "ours") that V4 had just shipped per the
  then-current HANDOFF. Applied via a direct follow-up commit (`4f47ca3`,
  not a new bundle/PR — small, live, user-confirmed content edit).
  `ClientEntry` simplified back to a plain interface (no more
  provenance-gated discriminated union); `preLaunch` (Vivi) is unaffected,
  it's independent of the removed provenance framing. **V8's Meshio case
  study (HANDOFF §7) has ALREADY been updated to match** ("Relationship:
  client", not "ours... do not present as arm's-length") — Bruno confirmed
  this extends to V8 too, for site-wide consistency, in a second
  clarifying question. V8 does not need to re-litigate this; read §7 as
  currently written, it already reflects the amendment.

## Durable handles

- marker: /Users/brunomaurino/.claude/autonomous-active/autonomous-bundle-loop-redesign-v3
- heartbeat_pid: 35715
- cron: 70844a99
- external watchdog: loaded (com.claude.autonomous-watchdog)
- dashboard: https://claude.ai/code/artifact/fe9686fb-8cc8-436f-8ccb-c6d8622eee61
- dashboard scratchpad file: /private/tmp/claude-501/-Users-brunomaurino-projects-codirity/9ddef8ab-5417-4799-aa93-32a4f171aaad/scratchpad/bundle-loop-redesign-v3-dashboard.html
