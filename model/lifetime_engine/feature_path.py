"""ForwardFeaturePath (Slice-1 stub).

Per the parent PRD, this module is responsible for the per-month feature
evolution rules (lockout flip, penalty step-down, MPL accumulation, M2M
countdown, refi incentive). Slice 1 ships the stub: features are frozen
at t=0 across the entire horizon. Slice 2 replaces this with real
evolution rules.

The stub still wires the rate scenario in: it overrides the loan's
`plc_rate_bps` with the scenario's refi rate and clears any
pre-computed `refi_incentive_bps` so the scorer re-derives the t=0
incentive from the user-supplied rate environment.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .rate_scenario import RateScenario


def build_forward_feature_path(
    loan: dict,
    scenario: RateScenario,
    horizon_months: int,
) -> pd.DataFrame:
    base = dict(loan)
    base["plc_rate_bps"] = scenario.refi_rate_bps()
    base["plc_rate_bps_input"] = scenario.refi_rate_bps()
    # Clear any pre-computed refi incentive so the scorer re-derives it
    # from the scenario's PLC override and the loan's note rate.
    base["refi_incentive_bps"] = float("nan")

    rows = [dict(base) for _ in range(horizon_months)]
    df = pd.DataFrame(rows)
    df["month_index"] = np.arange(1, horizon_months + 1)
    return df
