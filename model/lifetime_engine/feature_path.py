"""ForwardFeaturePath: per-month feature evolution for the Lifetime CPR engine.

Convention: `month_index=1` represents the loan's current period
(`synthetic_period = base_period`). Time advances by one calendar month
per row, so `month_index=t` carries `synthetic_period = base_period + (t-1)`.
This convention makes the t=0 agreement test trivially expressible: the
forward grid's month-1 SMM must equal the snapshot scorer's SMM (modulo
the rate-scenario PLC override) since both rows describe the same
calendar period with the same feature values.

Per-month rules:

  - `period` advances monthly in YYYYMM arithmetic
  - `loan_age_months` increments by 1 each month from the t=0 value
  - `in_lockout` flips from 1 to 0 once the synthetic period reaches
    `lockout_end_date`
  - `in_prepay_penalty` flips at `prepay_end_date`
  - `prepay_penalty_points` steps down via the months-remaining / 12
    rule from the existing scorer (clamped 0..10)
  - `months_post_lockout` is 0 while in lockout, increments monthly
    after lockout end, capped at 60
  - `months_to_maturity` counts down monotonically, hitting 0 at
    `loan_maturity_date`
  - `refi_incentive_bps = note_rate*100 - (refi_rate_bps + (1+pen)*12.5)`,
    with `refi_rate_bps` from the scenario (replacing the PLC lookup)
  - static features (FHA, pool type, affordable, SATO, vintage) carry
    through unchanged
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from model.predict_python import _yyyymm, months_diff

from .rate_scenario import RateScenario


def _add_months_yyyymm(yyyymm: int, k: int) -> int:
    """YYYYMM arithmetic: add k months. Returns int YYYYMM."""
    y, m = divmod(int(yyyymm), 100)
    total = y * 12 + (m - 1) + k
    return (total // 12) * 100 + (total % 12) + 1


def build_forward_feature_path(
    loan: dict,
    scenario: RateScenario,
    horizon_months: int,
) -> pd.DataFrame:
    base_period = int(_yyyymm(loan["period"]))
    lockout_end_raw = _yyyymm(loan.get("lockout_end_date"))
    lockout_end = int(lockout_end_raw) if lockout_end_raw else None
    prepay_end_raw = _yyyymm(loan.get("prepay_end_date"))
    prepay_end = int(prepay_end_raw) if prepay_end_raw else None
    maturity_raw = _yyyymm(loan.get("loan_maturity_date"))
    maturity = int(maturity_raw) if maturity_raw else None

    base_age = loan.get("loan_age_months")
    try:
        base_age = float(base_age) if base_age is not None and not pd.isna(base_age) else None
    except (TypeError, ValueError):
        base_age = None
    if base_age is None:
        orig = _yyyymm(loan.get("origination_date"))
        d = months_diff(str(base_period), orig) if orig else None
        base_age = float(max(0, d)) if d is not None else 0.0

    rows = []
    for t in range(1, horizon_months + 1):
        row = dict(loan)
        synthetic_period = _add_months_yyyymm(base_period, t - 1)
        row["period"] = synthetic_period
        row["loan_age_months"] = base_age + (t - 1)
        # Clear the override path so the per-row derivation wins.
        row["loan_age_months_input"] = float("nan")

        in_lockout = 1 if (lockout_end is not None and synthetic_period < lockout_end) else 0
        in_penalty = 1 if (prepay_end is not None and synthetic_period < prepay_end) else 0
        row["in_lockout"] = in_lockout
        row["in_prepay_penalty"] = in_penalty

        if in_penalty:
            mr = months_diff(str(prepay_end), str(synthetic_period))
            pen = max(0.0, min(10.0, mr / 12.0)) if mr is not None else 0.0
        else:
            pen = 0.0
        row["prepay_penalty_points"] = pen
        # Clear any t=0 override so the row's own derivation wins.
        row["prepay_penalty_points_input"] = float("nan")

        if in_lockout or lockout_end is None:
            mpl = 0
        else:
            mpl_raw = months_diff(str(synthetic_period), str(lockout_end))
            mpl = max(0, min(60, mpl_raw)) if mpl_raw is not None else 0
        row["months_post_lockout"] = mpl

        if maturity is not None:
            m2m_raw = months_diff(str(maturity), str(synthetic_period))
            row["months_to_maturity"] = max(0, min(600, m2m_raw)) if m2m_raw is not None else 120
        else:
            row["months_to_maturity"] = 120

        # Refi incentive: scenario refi rate replaces the per-period PLC
        # lookup in the existing scorer. The (1+pen)*12.5 markup is
        # carried over verbatim.
        refi_rate_bps = scenario.refi_rate_bps()
        row["plc_rate_bps"] = refi_rate_bps
        row["plc_rate_bps_input"] = refi_rate_bps
        row["refi_incentive_bps"] = (
            float(loan["loan_rate"]) * 100.0 - (refi_rate_bps + (1.0 + pen) * 12.5)
        )

        rows.append(row)
    df = pd.DataFrame(rows)
    df["month_index"] = np.arange(1, horizon_months + 1)
    return df
