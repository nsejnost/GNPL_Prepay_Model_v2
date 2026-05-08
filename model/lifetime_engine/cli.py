"""CLI entry point for the Lifetime CPR engine.

Reads one row from a loan CSV, applies a flat rate scenario, and prints
the engine's result as JSON on stdout. Exits 0 on success.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import asdict
from typing import Sequence

import pandas as pd

from .engine import Engine, LifetimeCPRResult
from .rate_scenario import RateScenario


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="model.lifetime_engine.cli",
        description="Score a single loan's Lifetime CPR under a rate scenario",
    )
    p.add_argument("--input", required=True, help="Loan CSV (or parquet) file")
    p.add_argument("--row", type=int, default=0, help="0-indexed row to score")
    p.add_argument("--treasury-bps", type=float, required=True)
    p.add_argument("--spread-bps", type=float, required=True)
    p.add_argument("--shock-bps", type=float, default=0.0)
    p.add_argument("--cpr-scalar", type=float, default=1.0,
                   help="OPTIONAL_CPR_SCALAR multiplier applied to the SMM path")
    p.add_argument("--io-months", type=int, default=0)
    return p


def _load_loan(path: str, row: int) -> dict:
    if path.endswith(".parquet"):
        df = pd.read_parquet(path)
    else:
        df = pd.read_csv(path)
    return df.iloc[row].to_dict()


def _result_to_payload(result: LifetimeCPRResult) -> dict:
    grid = result.forward_grid.replace({float("nan"): None}).to_dict(orient="records")
    summary = asdict(result.summary)
    return {
        "scenario": asdict(result.scenario),
        "summary": _scrub(summary),
        "forward_grid": [_scrub(r) for r in grid],
    }


def _scrub(obj):
    """Recursively replace non-JSON-serializable floats (NaN, inf) with
    None so json.dumps doesn't choke."""
    if isinstance(obj, dict):
        return {k: _scrub(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_scrub(v) for v in obj]
    if isinstance(obj, float) and not math.isfinite(obj):
        return None
    return obj


def main(argv: Sequence[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    loan = _load_loan(args.input, args.row)
    scenario = RateScenario(
        treasury_bps=args.treasury_bps,
        spread_bps=args.spread_bps,
        parallel_shock_bps=args.shock_bps,
    )
    result = Engine().run(
        loan,
        scenario,
        cpr_scalar=args.cpr_scalar,
        io_months=args.io_months,
    )
    print(json.dumps(_result_to_payload(result)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
