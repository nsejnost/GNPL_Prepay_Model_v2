"""AmortizationSchedule: pure-math scheduled-balance path for a project loan.

Given the loan's note rate, current balance, remaining amortization term in
months, and an optional interest-only period, returns the scheduled
month-end balance for each month 1..remaining_term_months as a 1-D
ndarray. No prepayment, no default — purely the contractual amortization.
"""
from __future__ import annotations

import numpy as np


def scheduled_balances(
    rate_annual: float,
    balance: float,
    remaining_term_months: int,
    io_months: int = 0,
    amort_term_months: int | None = None,
) -> np.ndarray:
    r = rate_annual / 12.0
    n = remaining_term_months
    amort_n = (amort_term_months if amort_term_months is not None else n) - io_months
    pmt = balance * r / (1.0 - (1.0 + r) ** -amort_n)

    out = np.empty(n, dtype=float)
    b = balance
    for t in range(n):
        if t < io_months:
            out[t] = b
        else:
            b = b * (1.0 + r) - pmt
            out[t] = b
    return out
