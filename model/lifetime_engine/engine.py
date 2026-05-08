"""Engine: orchestrator that wires the pieces of the Lifetime CPR model.

Pipeline:
  1. Validate the loan inputs.
  2. Compute remaining-term-in-months and amortization term (defaults
     to the remaining-term-in-months for fully-amortizing FHA project
     loans; pass `amort_term_months` explicitly for balloon loans).
  3. Build the scheduled balance path (AmortizationSchedule).
  4. Build the forward feature path (Slice-1 stub: frozen at t=0).
  5. Score every synthetic month with the existing single-loan scorer.
  6. Apply OPTIONAL_CPR_SCALAR multiplicatively on the SMM path.
  7. Accumulate survival (SurvivalSimulator).
  8. Aggregate the headline summary (LifetimeCPRAggregator).
  9. Assemble the forward-grid DataFrame and return.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from model.predict_python import _yyyymm, months_diff, predict_one

from .aggregator import LifetimeCPRSummary, aggregate_lifetime_cpr
from .amortization import scheduled_balances
from .feature_path import build_forward_feature_path
from .rate_scenario import RateScenario
from .survival import simulate_survival
from .validation import validate_loan_inputs


@dataclass(frozen=True)
class LifetimeCPRResult:
    forward_grid: pd.DataFrame
    summary: LifetimeCPRSummary
    scenario: RateScenario
    loan_inputs: dict


class Engine:
    def run(
        self,
        loan: dict,
        scenario: RateScenario,
        cpr_scalar: float = 1.0,
        io_months: int = 0,
        amort_term_months: int | None = None,
    ) -> LifetimeCPRResult:
        validate_loan_inputs(loan)

        period = _yyyymm(loan["period"])
        maturity = _yyyymm(loan["loan_maturity_date"])
        remaining_term_months = months_diff(maturity, period)
        if remaining_term_months is None or remaining_term_months <= 0:
            raise ValueError(
                f"loan_maturity_date ({maturity!r}) must be after period ({period!r})"
            )

        rate_annual = float(loan["loan_rate"]) / 100.0
        balance = float(loan["upb"])

        sched = scheduled_balances(
            rate_annual=rate_annual,
            balance=balance,
            remaining_term_months=remaining_term_months,
            io_months=io_months,
            amort_term_months=amort_term_months,
        )

        feature_path = build_forward_feature_path(loan, scenario, remaining_term_months)

        scored_rows = [predict_one(row) for _, row in feature_path.iterrows()]
        smm_base = np.array([r["predicted_SMM"] for r in scored_rows], dtype=float)
        smm = smm_base * float(cpr_scalar)

        survival, expected_balance, expected_prepay = simulate_survival(smm, sched)
        summary = aggregate_lifetime_cpr(smm, expected_balance)

        grid = pd.DataFrame({
            "month_index": np.arange(1, remaining_term_months + 1),
            "synthetic_period": feature_path["period"].to_numpy(),
            "loan_age_months": [r["loan_age_months"] for r in scored_rows],
            "in_lockout": [r["in_lockout"] for r in scored_rows],
            "in_prepay_penalty": [r["in_prepay_penalty"] for r in scored_rows],
            "prepay_penalty_points": [r["prepay_penalty_points"] for r in scored_rows],
            "months_post_lockout": [r["months_post_lockout"] for r in scored_rows],
            "months_to_maturity": [r["months_to_maturity"] for r in scored_rows],
            "refi_incentive_bps": [r["refi_incentive_bps"] for r in scored_rows],
            "scheduled_balance": sched,
            "expected_balance": expected_balance,
            "smm": smm,
            "smm_log_odds_total": [r["total_logodds"] for r in scored_rows],
            "expected_prepay_dollars": expected_prepay,
            "survival": survival,
        })

        return LifetimeCPRResult(
            forward_grid=grid,
            summary=summary,
            scenario=scenario,
            loan_inputs=dict(loan),
        )
