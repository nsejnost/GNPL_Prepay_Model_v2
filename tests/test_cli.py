"""CLI smoke tests.

Per the acceptance criteria, the CLI must run against a sample loan
row, exit 0, and emit valid JSON containing both the per-month forward
grid and the aggregate summary fields.
"""
import json
import os
import subprocess
import sys

import pytest

from model.lifetime_engine.cli import main

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAMPLE_PATH = os.path.join(ROOT, "model", "sample_loans.csv")


def test_cli_main_exits_zero_and_prints_valid_json(capsys):
    rc = main([
        "--input", SAMPLE_PATH,
        "--row", "0",
        "--treasury-bps", "400",
        "--spread-bps", "100",
        "--shock-bps", "0",
    ])
    assert rc == 0

    captured = capsys.readouterr()
    payload = json.loads(captured.out)
    assert "summary" in payload
    assert "forward_grid" in payload
    assert "scenario" in payload
    for f in ("lifetime_smm", "lifetime_cpr_pct", "peak_smm",
              "peak_smm_month", "expected_total_prepay"):
        assert f in payload["summary"]
    # Forward grid is a list of records, one per month
    assert isinstance(payload["forward_grid"], list)
    assert len(payload["forward_grid"]) > 0
    assert payload["forward_grid"][0]["month_index"] == 1


def test_cli_json_includes_driver_attribution_and_baseline(capsys):
    """Issue #13: CLI JSON output includes driver_attribution (one entry
    per component family) and baseline_lifetime_cpr_pct."""
    rc = main([
        "--input", SAMPLE_PATH,
        "--row", "0",
        "--treasury-bps", "400",
        "--spread-bps", "100",
    ])
    assert rc == 0

    payload = json.loads(capsys.readouterr().out)
    assert "driver_attribution" in payload
    assert "baseline_lifetime_cpr_pct" in payload

    expected_components = {"REFI", "AGE", "PEN", "SATO", "SIZE", "M2M", "MPL",
                           "INTERACT", "PHASE", "FHA", "PURPOSE", "AFF", "POOL"}
    assert set(payload["driver_attribution"].keys()) == expected_components
    assert isinstance(payload["baseline_lifetime_cpr_pct"], float)


def test_cli_runs_as_module_and_returns_zero():
    """End-to-end: invoke as `python3 -m model.lifetime_engine.cli`
    so that the entry-point wiring is exercised, not just the main()
    function. Confirms exit code 0 and valid JSON on stdout."""
    result = subprocess.run(
        [
            sys.executable, "-m", "model.lifetime_engine.cli",
            "--input", SAMPLE_PATH,
            "--row", "0",
            "--treasury-bps", "400",
            "--spread-bps", "100",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, f"stderr was: {result.stderr}"
    payload = json.loads(result.stdout)
    assert payload["summary"]["lifetime_cpr_pct"] >= 0
