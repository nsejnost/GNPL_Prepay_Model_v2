"""Input validation for the Lifetime CPR engine.

Catches obvious data-entry errors loudly rather than letting them
silently produce nonsense. The acceptance criteria call for a clear
error on a missing note rate; we check the other essentials too.
"""
from __future__ import annotations

import pandas as pd


# Lockout and prepay-end dates can be legitimately missing for loans past
# all restrictions, and the scorer handles that case (blank → flag = 0).
# Only the fields whose absence would produce nonsense are required here.
_REQUIRED = (
    ("period", "current period"),
    ("loan_rate", "note rate"),
    ("upb", "unpaid principal balance"),
    ("loan_maturity_date", "loan maturity date"),
    ("fha_program_code", "FHA program code"),
)


def _missing(value) -> bool:
    if value is None:
        return True
    try:
        if pd.isna(value):
            return True
    except (TypeError, ValueError):
        pass
    if isinstance(value, str) and value.strip() == "":
        return True
    return False


def validate_loan_inputs(loan: dict) -> None:
    for key, label in _REQUIRED:
        if key not in loan or _missing(loan[key]):
            raise ValueError(f"missing required loan input: {label} ({key!r})")

    rate = loan["loan_rate"]
    try:
        rate_f = float(rate)
    except (TypeError, ValueError) as e:
        raise ValueError(f"loan_rate must be numeric, got {rate!r}") from e
    if not (0 < rate_f < 25):
        raise ValueError(
            f"loan_rate {rate_f!r} is implausible: expected an annual rate in percent (e.g. 5.5 for 5.5%)"
        )

    upb = float(loan["upb"])
    if upb <= 0:
        raise ValueError(f"upb must be positive, got {upb!r}")
