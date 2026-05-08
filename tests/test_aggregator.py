"""Tests for LifetimeCPRAggregator.

Aggregates a forward grid into the headline summary statistics:
  lifetime_smm = SUMPRODUCT(smm_t, B_t) / SUM(B_t)
  lifetime_cpr_pct = (1 - (1 - lifetime_smm) ** 12) * 100
  peak_smm = max(smm_t)
  peak_smm_month = 1-indexed month at which peak occurs
  expected_total_prepay = SUM(B_t * smm_t)
"""
import numpy as np
import pytest

from model.lifetime_engine.aggregator import aggregate_lifetime_cpr


def test_lifetime_cpr_relates_to_lifetime_smm_via_one_minus_pow_twelve():
    """A known SMM/balance path: lifetime_smm should be the
    UPB-weighted average SMM, and lifetime_cpr_pct should equal
    100 * (1 - (1 - lifetime_smm) ** 12)."""
    smm = np.array([0.10, 0.05])
    balance = np.array([200.0, 100.0])
    # Weighted average: (0.10*200 + 0.05*100) / 300 = 25/300 = 0.0833333...
    expected_lifetime_smm = (0.10 * 200 + 0.05 * 100) / 300
    expected_lifetime_cpr_pct = 100 * (1 - (1 - expected_lifetime_smm) ** 12)
    expected_peak_smm = 0.10
    expected_peak_month = 1  # 1-indexed; the peak is the first month
    expected_total_prepay = 0.10 * 200 + 0.05 * 100  # = 25

    result = aggregate_lifetime_cpr(smm, balance)

    assert result.lifetime_smm == pytest.approx(expected_lifetime_smm, rel=1e-12)
    assert result.lifetime_cpr_pct == pytest.approx(expected_lifetime_cpr_pct, rel=1e-12)
    assert result.peak_smm == pytest.approx(expected_peak_smm)
    assert result.peak_smm_month == expected_peak_month
    assert result.expected_total_prepay == pytest.approx(expected_total_prepay, rel=1e-12)
