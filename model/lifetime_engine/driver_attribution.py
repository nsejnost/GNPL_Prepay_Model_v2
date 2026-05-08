"""Driver attribution: per-component CPR-equivalent decomposition of the
headline lifetime CPR.

For each component family C in (REFI, AGE, PEN, SATO, SIZE, M2M, MPL,
INTERACT, PHASE, FHA, PURPOSE, AFF, POOL), the raw leave-one-out
attribution is

    raw_C = headline_lifetime_cpr - lifetime_cpr_without_C

where `lifetime_cpr_without_C` recomputes the SMM path with C's log-odds
contribution zeroed out at every month (others untouched), then runs
survival accumulation and lifetime aggregation. Lockout months remain
hard-gated to zero hazard, and the OPTIONAL_CPR_SCALAR multiplier carries
through.

Under the sigmoid + survival nonlinearities, the raw leave-one-out deltas
do NOT additively recompose to (headline - baseline) — they tend to
overshoot in the steep region of the sigmoid. We rescale so they exactly
do, preserving sign and relative magnitude:

    delta_C = raw_C * (headline - baseline) / sum(raw_C)

so that

    baseline_lifetime_cpr + sum(delta_C) == headline_lifetime_cpr

(exact, modulo floating point). Positive delta_C => C pushes CPR up;
negative => pushes CPR down.

The "baseline-only" lifetime CPR is the intercept-only path (every
component held at zero), still hard-gated by lockout and scaled by
OPTIONAL_CPR_SCALAR.
"""
from __future__ import annotations

import numpy as np

from .aggregator import aggregate_lifetime_cpr
from .survival import simulate_survival


COMPONENTS: tuple[str, ...] = (
    "REFI", "AGE", "PEN", "SATO", "SIZE", "M2M", "MPL",
    "INTERACT", "PHASE", "FHA", "PURPOSE", "AFF", "POOL",
)


def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def _lifetime_cpr_pct(
    smm: np.ndarray,
    scheduled_balance_path: np.ndarray,
) -> float:
    _, expected_balance, _ = simulate_survival(smm, scheduled_balance_path)
    return aggregate_lifetime_cpr(smm, expected_balance).lifetime_cpr_pct


def compute_driver_attribution(
    scored_rows: list[dict],
    scheduled_balance_path: np.ndarray,
    cpr_scalar: float,
    headline_lifetime_cpr_pct: float,
) -> tuple[dict[str, float], float]:
    """Returns (deltas, baseline_lifetime_cpr_pct).

    `scored_rows` is a list of `predict_one` outputs, one per simulated
    month; each must expose `in_lockout`, `total_logodds`,
    `intercept_logodds`, and `{COMPONENT}_logodds` for every component.
    """
    in_lockout = np.array([r["in_lockout"] for r in scored_rows], dtype=float)
    total_lo = np.array([r["total_logodds"] for r in scored_rows], dtype=float)
    intercept_lo = float(scored_rows[0]["intercept_logodds"])
    gate = (1.0 - in_lockout) * float(cpr_scalar)

    baseline_smm = gate * _sigmoid(np.full_like(total_lo, intercept_lo))
    baseline_cpr_pct = _lifetime_cpr_pct(baseline_smm, scheduled_balance_path)

    raw: dict[str, float] = {}
    for c in COMPONENTS:
        c_lo = np.array([r[f"{c}_logodds"] for r in scored_rows], dtype=float)
        modified_smm = gate * _sigmoid(total_lo - c_lo)
        cpr_without_c = _lifetime_cpr_pct(modified_smm, scheduled_balance_path)
        raw[c] = headline_lifetime_cpr_pct - cpr_without_c

    target = headline_lifetime_cpr_pct - baseline_cpr_pct
    raw_sum = sum(raw.values())
    if abs(raw_sum) > 1e-12:
        scale = target / raw_sum
        deltas = {c: scale * v for c, v in raw.items()}
    else:
        deltas = dict(raw)

    return deltas, baseline_cpr_pct
