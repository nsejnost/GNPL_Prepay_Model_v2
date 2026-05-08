"""Tests for SurvivalSimulator.

Convention: indexes are end-of-month, t=0 is the first simulated month.
  survival[t]      = product over tau<t of (1 - smm[tau])         # S_0 = 1
  expected_balance[t] = survival[t] * scheduled_balance[t]
  expected_prepay[t]  = expected_balance[t] * smm[t]
"""
import numpy as np
import pytest

from model.lifetime_engine.survival import simulate_survival


def test_constant_smm_produces_geometric_decay_in_expected_balance():
    n = 12
    c = 0.05
    smm = np.full(n, c)
    sched = np.full(n, 1_000_000.0)  # constant scheduled balance isolates decay

    survival, expected_balance, expected_prepay = simulate_survival(smm, sched)

    expected_survival = (1 - c) ** np.arange(n)
    np.testing.assert_allclose(survival, expected_survival, rtol=1e-12)
    np.testing.assert_allclose(expected_balance, sched * expected_survival, rtol=1e-12)
    np.testing.assert_allclose(expected_prepay, sched * expected_survival * c, rtol=1e-12)


def test_zero_smm_yields_identity_balance_and_zero_prepay():
    """Zero hazard everywhere: expected_balance == scheduled_balance,
    survival == 1 throughout, and no expected prepayments."""
    n = 24
    smm = np.zeros(n)
    sched = np.linspace(1_000_000.0, 800_000.0, n)  # arbitrary amortization

    survival, expected_balance, expected_prepay = simulate_survival(smm, sched)

    np.testing.assert_allclose(survival, np.ones(n), rtol=1e-12)
    np.testing.assert_allclose(expected_balance, sched, rtol=1e-12)
    np.testing.assert_allclose(expected_prepay, np.zeros(n), atol=1e-12)


def test_smm_one_in_first_month_zeros_subsequent_balances():
    """If SMM is 1.0 in month 0, the loan is fully prepaid by end of
    month 0. From month 1 onward, expected_balance must be 0."""
    n = 6
    smm = np.array([1.0, 0.05, 0.05, 0.05, 0.05, 0.05])
    sched = np.full(n, 1_000_000.0)

    _survival, expected_balance, expected_prepay = simulate_survival(smm, sched)

    assert expected_balance[0] == pytest.approx(1_000_000.0)
    np.testing.assert_allclose(expected_balance[1:], np.zeros(n - 1), atol=1e-12)
    # The full prepay happens in month 0
    assert expected_prepay[0] == pytest.approx(1_000_000.0)
    np.testing.assert_allclose(expected_prepay[1:], np.zeros(n - 1), atol=1e-12)


def test_total_prepay_plus_post_terminal_balance_equals_initial_for_constant_balance():
    """With a constant scheduled balance (no amortization decay), the
    sum of expected dollar prepayments plus the post-terminal-month
    surviving balance must equal the initial balance, exactly."""
    n = 24
    c = 0.02
    initial = 1_000_000.0
    smm = np.full(n, c)
    sched = np.full(n, initial)

    _, expected_balance, expected_prepay = simulate_survival(smm, sched)

    # post-terminal balance = expected_balance[-1] minus the prepay that
    # occurs in the terminal month, equivalent to S_N * scheduled[N-1].
    post_terminal = expected_balance[-1] - expected_prepay[-1]
    assert expected_prepay.sum() + post_terminal == pytest.approx(initial, rel=1e-12)
