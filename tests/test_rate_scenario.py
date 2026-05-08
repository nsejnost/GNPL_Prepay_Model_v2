"""Tests for RateScenario."""
from model.lifetime_engine.rate_scenario import RateScenario


def test_refi_rate_bps_sums_treasury_spread_and_shock():
    """RateScenario(treasury, spread, shock).refi_rate_bps()
    returns treasury + spread + shock as a plain bps integer-or-float."""
    scenario = RateScenario(treasury_bps=400, spread_bps=100, parallel_shock_bps=-50)
    assert scenario.refi_rate_bps() == 450


def test_default_parallel_shock_is_zero():
    """parallel_shock_bps is optional and defaults to 0 so the common
    `base scenario` case can be expressed without the shock argument."""
    scenario = RateScenario(treasury_bps=400, spread_bps=100)
    assert scenario.refi_rate_bps() == 500
