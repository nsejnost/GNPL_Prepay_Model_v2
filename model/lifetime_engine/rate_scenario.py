"""RateScenario: a thin dataclass for the user-supplied flat rate scenario.

Constant over the v1 forward horizon. Bps throughout for unit consistency
with the rest of the trained model (incentive, SATO).
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RateScenario:
    treasury_bps: float
    spread_bps: float
    parallel_shock_bps: float = 0.0

    def refi_rate_bps(self) -> float:
        return self.treasury_bps + self.spread_bps + self.parallel_shock_bps
