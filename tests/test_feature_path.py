"""Tests for ForwardFeaturePath.

Per the parent PRD's interface, ForwardFeaturePath produces a DataFrame
indexed by month containing all the feature columns the existing
single-loan scorer expects, with per-month evolution rules:

  - synthetic period drives lockout / penalty flag derivation
  - loan_age_months increments monthly
  - in_lockout flips at lockout_end_date
  - in_prepay_penalty flips at prepay_end_date
  - prepay_penalty_points step down via months-remaining/12 rule
  - months_post_lockout accumulates from 0 once lockout ends, capped at 60
  - months_to_maturity counts down monotonically to 0 at maturity
  - refi_incentive_bps uses the scenario's refi rate (replacing PLC lookup)
  - static features (FHA, pool, affordable, NC, SATO) carry through unchanged
"""
import numpy as np
import pandas as pd
import pytest

from model.lifetime_engine.feature_path import build_forward_feature_path
from model.lifetime_engine.rate_scenario import RateScenario


def _base_loan(**overrides) -> dict:
    """Default test loan: period 202601, FHA 223(F), $10M UPB, 5.5% rate.
    Lockout ends 202707 (18 months out), prepay penalty ends 203101
    (60 months out, with a 10-year prepay_premium_period_yrs window
    starting at origination), maturity 204601 (240 months out).
    """
    loan = {
        "period": 202601,
        "loan_rate": 5.5,
        "upb": 10_000_000.0,
        "origination_date": 202601,
        "loan_maturity_date": 204601,
        "lockout_end_date": 202707,    # 18 months out
        "prepay_end_date": 203101,     # 60 months out
        "prepay_premium_period_yrs": 10,
        "fha_program_code": "223(F)",
        "affordable_status": "MKT",
        "pool_type": "PN",
        "loan_age_months": 0,
        "vintage_year": 2026,
        "sato_bps": -10.0,
    }
    loan.update(overrides)
    return loan


def test_synthetic_period_advances_one_month_per_row():
    """The forward feature path's synthetic period at row 0 (month_index 1)
    equals the loan's current period; subsequent rows advance one
    month each in YYYYMM arithmetic (so December rolls to the
    following January). This convention makes the t=0 agreement test
    trivially expressible — month 1 of the grid is the t=0 snapshot."""
    loan = _base_loan(period=202611)  # November 2026
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    df = build_forward_feature_path(loan, scenario, horizon_months=4)

    assert df["period"].tolist() == [202611, 202612, 202701, 202702]


def test_lockout_flips_off_at_lockout_end_date():
    """A loan whose synthetic period reaches lockout_end_date at month
    18 of the grid must show in_lockout=1 for months 1-17 and =0 from
    month 18 onward. Month-1 has period=base_period (Convention B), so
    setting lockout_end = base_period + 17 puts the flip at month 18.
    """
    loan = _base_loan(period=202601, lockout_end_date=202706)
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    df = build_forward_feature_path(loan, scenario, horizon_months=24)

    locked = df.iloc[:17]["in_lockout"].tolist()
    unlocked = df.iloc[17:]["in_lockout"].tolist()
    assert locked == [1] * 17
    assert unlocked == [0] * (24 - 17)


def test_penalty_steps_down_monotonically_and_hits_zero_at_prepay_end():
    """Through the penalty window, prepay_penalty_points must decrease
    monotonically (the months-remaining/12 rule from the existing
    scorer) and reach 0 by `prepay_end_date`. Month-1 has period=
    base_period (Convention B); setting prepay_end = base_period + 59
    puts the flip at month 60."""
    # period 202601, prepay_end 203012: window flip at month 60.
    loan = _base_loan(period=202601, prepay_end_date=203012)
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    df = build_forward_feature_path(loan, scenario, horizon_months=72)

    pen = df["prepay_penalty_points"].to_numpy()
    in_pen = df["in_prepay_penalty"].to_numpy()
    diffs = np.diff(pen[:60])
    assert (diffs <= 0).all(), f"penalty must be non-increasing in window, diffs={diffs}"
    # At the synthetic period equal to prepay_end_date, the loan is out
    # of penalty and pen = 0.
    assert in_pen[59] == 0
    assert pen[59] == pytest.approx(0.0)
    # Inside the window, in_prepay_penalty must be 1.
    assert (in_pen[:59] == 1).all()
    # First month of the window: 59 months remaining → 59/12 ≈ 4.917
    assert pen[0] == pytest.approx(59 / 12.0, rel=1e-9)


def test_months_post_lockout_accumulates_after_lockout_end_capped_at_60():
    """months_post_lockout is 0 while in lockout, increments by 1 each
    month after lockout_end_date, and caps at 60 thereafter.
    Convention B: setting lockout_end = base_period + 17 puts the flip
    at month 18, so MPL=0 for months 1..18 (17 in lockout + first post-
    lockout month) and increments thereafter."""
    loan = _base_loan(period=202601, lockout_end_date=202706, loan_maturity_date=210101)
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    df = build_forward_feature_path(loan, scenario, horizon_months=84)

    mpl = df["months_post_lockout"].to_numpy()
    # Months 1..17: in lockout → 0
    assert (mpl[:17] == 0).all()
    # Month 18 (synthetic period == lockout_end): out of lockout, MPL = 0
    assert mpl[17] == 0
    # Each subsequent month, MPL increments by 1
    assert mpl[18] == 1
    assert mpl[19] == 2
    # MPL caps at 60: months 1..17 lockout + 1 post-lockout zero + 60 post
    # = month 78 onward at 60
    assert mpl[77] == 60
    assert mpl[83] == 60


def test_months_to_maturity_decreases_monotonically_to_zero_at_maturity():
    """months_to_maturity counts down by 1 each month and hits exactly 0
    at `loan_maturity_date`. Convention B: month-1 has period=base_period,
    so setting maturity = base_period + 11 makes M2M=11 at month 1 and
    M2M=0 at month 12."""
    loan = _base_loan(period=202601, loan_maturity_date=202612)
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    df = build_forward_feature_path(loan, scenario, horizon_months=12)

    m2m = df["months_to_maturity"].to_numpy()
    assert m2m[0] == 11   # synthetic period 202601, maturity 202612 → 11
    assert m2m[-1] == 0   # synthetic period 202612 == maturity → 0
    assert (np.diff(m2m) == -1).all()


def test_refi_incentive_uses_scenario_rate_and_varies_only_with_penalty_stepdown():
    """For a 5.5% loan under scenario treasury=400, spread=100, shock=0
    (refi_rate=500 bps), the per-month refi incentive must equal
    `550 - (500 + (1+pen)*12.5)`, varying only with the penalty
    step-down."""
    loan = _base_loan(
        period=202601,
        loan_rate=5.5,
        prepay_end_date=203101,
        lockout_end_date=202602,    # essentially out of lockout immediately
        loan_maturity_date=210101,
    )
    scenario = RateScenario(treasury_bps=400, spread_bps=100, parallel_shock_bps=0)

    df = build_forward_feature_path(loan, scenario, horizon_months=72)

    refi = df["refi_incentive_bps"].to_numpy()
    pen = df["prepay_penalty_points"].to_numpy()
    expected = 550.0 - (500.0 + (1.0 + pen) * 12.5)
    np.testing.assert_allclose(refi, expected, rtol=1e-12)


def test_loan_age_increments_monthly_from_initial():
    """loan_age_months increments by 1 each row from the t=0 value.
    Convention B: month-1 carries the t=0 age, month-2 is age+1, etc."""
    loan = _base_loan(period=202601, loan_age_months=3, loan_maturity_date=204601)
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    df = build_forward_feature_path(loan, scenario, horizon_months=24)

    age = df["loan_age_months"].to_numpy()
    np.testing.assert_array_equal(age, np.arange(3, 27))


def test_static_features_carry_through_unchanged_across_horizon():
    """FHA program code, pool type, affordable status, SATO, and vintage
    all carry through unchanged from t=0 across the entire horizon."""
    loan = _base_loan(
        period=202601,
        loan_maturity_date=204601,
        fha_program_code="221(D)4",
        pool_type="LM",
        affordable_status="AFF",
        sato_bps=42.0,
        vintage_year=2026,
    )
    scenario = RateScenario(treasury_bps=400, spread_bps=100)

    df = build_forward_feature_path(loan, scenario, horizon_months=240)

    for col, val in [
        ("fha_program_code", "221(D)4"),
        ("pool_type", "LM"),
        ("affordable_status", "AFF"),
        ("sato_bps", 42.0),
        ("vintage_year", 2026),
    ]:
        assert (df[col] == val).all(), f"{col} drifted across horizon"
