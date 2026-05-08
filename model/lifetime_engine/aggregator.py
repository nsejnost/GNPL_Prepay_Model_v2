"""LifetimeCPRAggregator: rolls a forward grid into the headline summary.

  lifetime_smm     = SUMPRODUCT(smm_t, B_t) / SUM(B_t)
  lifetime_cpr_pct = (1 - (1 - lifetime_smm) ** 12) * 100
  peak_smm         = max(smm_t)
  peak_smm_month   = 1-indexed month at which the peak occurs (ties: earliest)
  expected_total_prepay = SUM(B_t * smm_t)
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class LifetimeCPRSummary:
    lifetime_smm: float
    lifetime_cpr_pct: float
    peak_smm: float
    peak_smm_month: int
    expected_total_prepay: float


def aggregate_lifetime_cpr(
    smm_path: np.ndarray,
    expected_balance_path: np.ndarray,
) -> LifetimeCPRSummary:
    smm = np.asarray(smm_path, dtype=float)
    bal = np.asarray(expected_balance_path, dtype=float)

    total_balance = bal.sum()
    expected_total_prepay = float((smm * bal).sum())
    lifetime_smm = float(expected_total_prepay / total_balance) if total_balance > 0 else 0.0
    lifetime_cpr_pct = float((1.0 - (1.0 - lifetime_smm) ** 12) * 100)
    peak_idx = int(np.argmax(smm))
    return LifetimeCPRSummary(
        lifetime_smm=lifetime_smm,
        lifetime_cpr_pct=lifetime_cpr_pct,
        peak_smm=float(smm[peak_idx]),
        peak_smm_month=peak_idx + 1,  # 1-indexed
        expected_total_prepay=expected_total_prepay,
    )
