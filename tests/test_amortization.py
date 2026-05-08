"""Tests for AmortizationSchedule.

Exercises the public interface: given a loan rate, balance, and remaining
term (with optional IO period), the schedule returns a 1-D ndarray of
scheduled balances at month-end for months 1..remaining_term_months.
"""
import numpy as np
import pytest

from model.lifetime_engine.amortization import scheduled_balances


def test_standard_pi_amortization_matches_textbook_balance():
    """A 6%/yr, $1M, 360-month fully-amortizing loan: balance at month 1
    after one P&I payment must equal the closed-form remaining balance,
    and the final scheduled balance after month 360 is ~0.

    Closed form: B_1 = B_0 * (1 + r) - P, where
       P = B_0 * r / (1 - (1 + r) ** -n)
       r = monthly rate = 0.06 / 12
       n = 360
    """
    rate_annual = 0.06
    balance = 1_000_000.0
    n = 360
    r = rate_annual / 12
    pmt = balance * r / (1 - (1 + r) ** -n)
    expected_b1 = balance * (1 + r) - pmt

    sched = scheduled_balances(rate_annual, balance, n)

    assert isinstance(sched, np.ndarray)
    assert sched.shape == (n,)
    assert sched[0] == pytest.approx(expected_b1, rel=1e-9)
    assert sched[-1] == pytest.approx(0.0, abs=1e-6)


def test_zero_balance_produces_all_zero_schedule():
    """A loan whose current balance is zero (or numerically negligible)
    must produce an all-zero schedule of the requested length, without
    raising on division-by-zero."""
    sched = scheduled_balances(0.06, 0.0, 12)

    assert sched.shape == (12,)
    assert np.allclose(sched, 0.0)


def test_single_month_remaining_term_returns_length_one_zero_terminating():
    """A loan with one month remaining is paid off in that month: the
    schedule is length 1 and ends at ~0."""
    sched = scheduled_balances(0.06, 100_000.0, 1)

    assert sched.shape == (1,)
    assert sched[0] == pytest.approx(0.0, abs=1e-6)


def test_balloon_at_maturity_terminates_with_nonzero_balance():
    """A loan whose amortization term outruns its maturity has a balloon
    payment. Concretely: a 6%, $1M loan with 360 months of amortization
    remaining but only 120 months to maturity terminates with the
    closed-form remaining balance after 120 P&I payments.

    Closed form: B_t = B_0 * (1 + r) ** t - P * ((1 + r) ** t - 1) / r
    """
    rate_annual = 0.06
    balance = 1_000_000.0
    amort_n = 360
    maturity_n = 120
    r = rate_annual / 12
    pmt = balance * r / (1.0 - (1.0 + r) ** -amort_n)
    expected_balloon = balance * (1 + r) ** maturity_n - pmt * ((1 + r) ** maturity_n - 1) / r

    sched = scheduled_balances(
        rate_annual, balance, maturity_n, amort_term_months=amort_n
    )

    assert sched.shape == (maturity_n,)
    assert sched[-1] == pytest.approx(expected_balloon, rel=1e-9)
    assert sched[-1] > 0  # must be a non-trivial balloon


def test_io_period_holds_balance_then_amortizes():
    """A loan with `io_months=24` holds the balance flat for 24 months
    (interest-only), then re-amortizes the remaining principal over
    the remaining term. After the 24th IO month, balance == initial
    balance; after the 25th month, the balance has dropped by exactly
    the first amortizing P&I principal portion.
    """
    rate_annual = 0.06
    balance = 1_000_000.0
    n = 360
    io = 24
    r = rate_annual / 12

    sched = scheduled_balances(rate_annual, balance, n, io_months=io)

    assert sched.shape == (n,)
    # During the IO window the balance is held flat at the original.
    assert sched[io - 1] == pytest.approx(balance, rel=1e-12)
    # After IO, principal amortizes over the remaining (n - io) months.
    pmt = balance * r / (1.0 - (1.0 + r) ** -(n - io))
    expected_first_amort_balance = balance * (1.0 + r) - pmt
    assert sched[io] == pytest.approx(expected_first_amort_balance, rel=1e-9)
    # And the loan still terminates at ~0 by month n.
    assert sched[-1] == pytest.approx(0.0, abs=1e-6)
