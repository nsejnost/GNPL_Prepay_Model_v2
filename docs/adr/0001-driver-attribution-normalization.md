# ADR-0001: Normalize driver-attribution deltas so they exactly recompose

Date: 2026-05-08
Status: Accepted

## Context

Issue #13 (Slice 4 of the Lifetime CPR engine) requires per-component
CPR-equivalent attribution for the headline lifetime CPR, with thirteen
component families: REFI, AGE, PEN, SATO, SIZE, M2M, MPL, INTERACT,
PHASE, FHA, PURPOSE, AFF, POOL.

The issue specifies the attribution scheme as leave-one-out: for each
component C, zero out C's log-odds contribution at every month, recompute
the lifetime CPR, and take the difference

    raw_C = headline_lifetime_cpr - lifetime_cpr_without_C

It also specifies an acceptance criterion:

> sum of per-component deltas, when applied to the baseline-only CPR,
> recovers the headline lifetime CPR within 50 bps absolute tolerance

Pure leave-one-out attribution does **not** satisfy this criterion in
general, because the SMM is produced by a sigmoid and the lifetime CPR
is produced by survival accumulation followed by a CPR conversion — both
nonlinear. In the steep region of the sigmoid (operating points well
above the intercept), each leave-one-out delta overstates the marginal
contribution of its component, so the deltas tend to overshoot. For the
sample loan in `model/sample_loans.csv` (row 0) under
`treasury=400 spread=100 shock=0`:

    headline = 11.80
    baseline =  1.65   # intercept-only path, lockout-gated
    sum(raw) = 12.27
    overshoot vs (headline - baseline) = 12.27 - 10.15 = 2.12   # ~210 bps

210 bps far exceeds the 50 bps acceptance tolerance.

## Decision

After computing the raw leave-one-out deltas, apply a single
multiplicative normalization factor so the deltas sum exactly to
`headline - baseline`:

    target  = headline - baseline
    raw_sum = sum(raw_C for C in COMPONENTS)
    delta_C = raw_C * (target / raw_sum)

By construction, `baseline + sum(delta_C) == headline` (modulo floating
point). The lockout-gated, intercept-only baseline lifetime CPR is
exposed alongside the attribution dict on `LifetimeCPRResult` so the user
can see the recomposition explicitly.

When `raw_sum` is degenerately small (e.g., a fully-locked-out loan
where every raw delta is zero), the deltas are returned unscaled — they
are already zero, and the recomposition holds trivially.

## Consequences

- **Recomposition holds exactly.** The 50 bps acceptance criterion is
  satisfied with zero error, not 50 bps of slack.
- **Sign convention preserved.** Positive deltas still indicate
  components that push CPR up; negative deltas, components that push it
  down.
- **Ranking by absolute magnitude preserved.** A uniform scaling factor
  doesn't reorder components, so the Excel "Lifetime CPR drivers" table
  (issue #12 follow-up) ranks the same loans the same way before and
  after normalization.
- **Magnitudes are scaled, not strictly marginal.** Each `delta_C` is
  no longer "the CPR drop you would observe if you removed component C
  in isolation." Users reading individual deltas as marginal effects
  would be slightly off — by the scaling factor, which is typically
  0.7–0.9 for in-the-money loans. This is the cost of additivity. The
  module docstring documents this clearly.
- **Single scaling factor is uniform across components.** No component
  is privileged or penalized by the renormalization.

## Alternatives considered

1. **Loosen the acceptance criterion.** Keep pure leave-one-out and
   relax the recomposition tolerance from 50 bps to whatever the
   nonlinear overshoot actually is (200+ bps for typical in-the-money
   loans). Rejected: the issue's 50 bps is explicit, and a multi-percent
   recomposition gap would be confusing in the Summary tab.

2. **Shapley value attribution.** Replace leave-one-out with the average
   over all `13!` orderings of marginal contributions. Mathematically
   exact additivity by construction, no normalization needed. Rejected
   for v1: 13! ≈ 6.2 billion orderings is intractable; even a Monte
   Carlo Shapley estimator would add meaningful compute and code
   complexity for a slice meant to ship in parallel with #11 and #12.
   Worth revisiting if the user finds the normalized magnitudes
   misleading in practice.

3. **Per-component proportional attribution in log-odds space.** At
   each month, attribute the SMM-above-baseline proportionally to each
   component's log-odds share, then aggregate. Additive at the per-month
   SMM level, but the lifetime CPR conversion (`(1 - (1 - SMM)^12) *
   100`) is nonlinear, so additivity at the CPR level is not preserved
   either. Doesn't avoid the normalization step, and loses the direct
   "leave-one-out" interpretation that matches the issue's stated
   attribution scheme. Rejected.
