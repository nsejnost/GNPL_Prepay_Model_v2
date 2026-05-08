"""End-to-end Engine smoke tests.

These tests exercise the full wiring: AmortizationSchedule + (stub)
ForwardFeaturePath + the existing single-loan scorer + SurvivalSimulator
+ LifetimeCPRAggregator. They use a real sample loan from
`model/sample_loans.csv` and assert top-level invariants only — the
underlying-component math is covered in the dedicated unit tests.
"""
import os

import numpy as np
import pandas as pd
import pytest

from model.lifetime_engine.engine import Engine, LifetimeCPRResult
from model.lifetime_engine.rate_scenario import RateScenario

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAMPLE_PATH = os.path.join(ROOT, "model", "sample_loans.csv")


def _sample_loan() -> dict:
    """Pick a representative non-locked-out loan (in_prepay_penalty=1 is fine,
    in_lockout=0 ensures non-zero hazard contributions)."""
    df = pd.read_csv(SAMPLE_PATH)
    return df.iloc[0].to_dict()


def test_engine_returns_result_with_forward_grid_matching_remaining_term():
    loan = _sample_loan()
    scenario = RateScenario(treasury_bps=400, spread_bps=100, parallel_shock_bps=0)

    result = Engine().run(loan, scenario)

    assert isinstance(result, LifetimeCPRResult)
    # Remaining term in months: from period 202603 to maturity 20610101 = 418
    expected_horizon = 418
    assert len(result.forward_grid) == expected_horizon
    assert result.forward_grid["month_index"].tolist() == list(range(1, expected_horizon + 1))


def test_engine_summary_fields_are_populated_and_finite():
    loan = _sample_loan()
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    result = Engine().run(loan, scenario)

    s = result.summary
    for field in ("lifetime_smm", "lifetime_cpr_pct", "peak_smm",
                  "expected_total_prepay"):
        v = getattr(s, field)
        assert np.isfinite(v), f"{field} = {v} is not finite"
        assert v >= 0
    assert 1 <= s.peak_smm_month <= len(result.forward_grid)
    assert s.lifetime_cpr_pct < 100  # sanity ceiling


def test_engine_forward_grid_columns_include_per_month_smm_and_balances():
    loan = _sample_loan()
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    result = Engine().run(loan, scenario)

    grid = result.forward_grid
    for col in ("month_index", "smm", "scheduled_balance",
                "expected_balance", "expected_prepay_dollars"):
        assert col in grid.columns, f"missing column: {col}"
    # Scheduled balance starts below initial UPB (one month of amort
    # has happened) and ends at ~0 for this fully-amortizing loan.
    assert grid["scheduled_balance"].iloc[0] < float(loan["upb"])
    assert grid["scheduled_balance"].iloc[-1] == pytest.approx(0.0, abs=1e-3)


def test_optional_cpr_scalar_scales_smm_path_proportionally():
    """A `cpr_scalar` of 0.5 must halve the per-month SMM at every
    point in the grid relative to a `cpr_scalar` of 1.0."""
    loan = _sample_loan()
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    base = Engine().run(loan, scenario, cpr_scalar=1.0)
    halved = Engine().run(loan, scenario, cpr_scalar=0.5)

    np.testing.assert_allclose(
        halved.forward_grid["smm"].to_numpy(),
        0.5 * base.forward_grid["smm"].to_numpy(),
        rtol=1e-12,
    )


def test_engine_rejects_missing_note_rate_with_explicit_error():
    loan = _sample_loan()
    loan["loan_rate"] = None
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    with pytest.raises(ValueError, match=r"note rate"):
        Engine().run(loan, scenario)
