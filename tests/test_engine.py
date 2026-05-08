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


def test_t0_agreement_forward_grid_month1_smm_matches_single_loan_scorer():
    """The primary correctness guard: month 1 of the forward grid must
    match the existing single-loan scorer's predicted_SMM exactly,
    when the scorer is called with the rate scenario's refi rate
    substituted for the per-period PLC lookup. If month 1 disagrees,
    the entire downstream simulation is suspect."""
    from model.predict_python import predict_one

    loan = _sample_loan()
    scenario = RateScenario(treasury_bps=400, spread_bps=100, parallel_shock_bps=0)

    # Build the t=0 reference row exactly as the engine does: substitute
    # the scenario refi rate for the PLC lookup, clear any pre-computed
    # refi incentive override so the scorer derives from the override
    # plc_rate_bps and the loan's note_rate.
    ref_row = pd.Series({
        **loan,
        "plc_rate_bps": scenario.refi_rate_bps(),
        "plc_rate_bps_input": scenario.refi_rate_bps(),
        "refi_incentive_bps": float("nan"),
        "prepay_penalty_points": float("nan"),    # let the scorer derive from prepay_end
        "prepay_penalty_points_input": float("nan"),
    })
    snapshot = predict_one(ref_row)

    result = Engine().run(loan, scenario)
    forward_month1_smm = float(result.forward_grid["smm"].iloc[0])

    assert forward_month1_smm == pytest.approx(
        snapshot["predicted_SMM"], rel=1e-12, abs=1e-15
    )


def test_in_lockout_loan_has_lower_lifetime_cpr_than_unlocked_otherwise_identical():
    """Lifetime CPR for a loan with lockout_end_date 12 months in the
    future must be mechanically lower than the same loan with lockout
    already past, because in-lockout months are hard-gated to zero
    hazard. The drop should be on the order of 12 months of foregone
    prepay opportunity."""
    base = _sample_loan()
    # Past-lockout copy: lockout_end_date one period before t=0 so
    # in_lockout=0 from month 1.
    past = dict(base)
    past["lockout_end_date"] = 202602  # before period 202603
    # In-lockout copy: lockout_end_date 12 months out under Convention B,
    # so months 1..12 are hard-gated.
    locked = dict(base)
    locked["lockout_end_date"] = 202703  # period 202603 + 12 = 202703

    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    past_result = Engine().run(past, scenario)
    locked_result = Engine().run(locked, scenario)

    # The locked loan must have a strictly lower lifetime CPR.
    assert locked_result.summary.lifetime_cpr_pct < past_result.summary.lifetime_cpr_pct
    # The first 12 months of the locked grid must show zero hazard;
    # the past-lockout grid must show non-zero hazard at month 1.
    np.testing.assert_array_equal(
        locked_result.forward_grid["smm"].iloc[:12].to_numpy(),
        np.zeros(12),
    )
    assert past_result.forward_grid["smm"].iloc[0] > 0
