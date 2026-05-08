"""SurvivalSimulator: pure-math survival accumulation for the forward grid.

Given a per-month SMM hazard path and a per-month scheduled balance path
(both length N, both end-of-month), returns three length-N arrays:

  survival[t]         = product over tau<t of (1 - smm[tau])  (S_0 = 1)
  expected_balance[t] = survival[t] * scheduled_balance[t]
  expected_prepay[t]  = expected_balance[t] * smm[t]
"""
from __future__ import annotations

import numpy as np


def simulate_survival(
    smm_path: np.ndarray,
    scheduled_balance_path: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    smm = np.asarray(smm_path, dtype=float)
    sched = np.asarray(scheduled_balance_path, dtype=float)

    one_minus = 1.0 - smm
    survival = np.empty_like(smm)
    survival[0] = 1.0
    if len(smm) > 1:
        survival[1:] = np.cumprod(one_minus[:-1])
    expected_balance = survival * sched
    expected_prepay = expected_balance * smm
    return survival, expected_balance, expected_prepay
