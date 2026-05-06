#!/usr/bin/env python3
"""
GNPL Prepay Model — pipeline orchestrator
==========================================

Wired to Replit's Run button via .replit. Lists the five pipeline
stages, accepts a selection (numbers, ranges, or preset names), and
shells out to each underlying script in dependency order.

Usage:
  python3 run.py             # interactive menu (Replit Run target)
  python3 run.py 2 3 4 5     # by stage number
  python3 run.py train excel # by stage key
  python3 run.py 2-5         # by range
  python3 run.py --all       # every stage
  python3 run.py --retrain   # stages 2-5 (most common iteration)
"""

import argparse
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))

# (key, label, command-args, prereq-path-relative-to-ROOT, producer-hint)
STAGES = [
    ("etl",     "Build raw panel from GNMA disclosure files",
                ["main.py", "--skip-download"],
                "gnma_mf_data",
                "upload mfplmon3 zip files to gnma_mf_data/"),
    ("train",   "Re-train the logistic regression model",
                ["model/train_model.py"],
                "gnma_mf_raw_data.parquet",
                "stage 1 (etl), or upload the parquet from the GitHub release"),
    ("predict", "Score sample_loans.csv (or any CSV via --input)",
                ["model/predict_python.py"],
                "model/coefficients.csv",
                "stage 2 (train)"),
    ("excel",   "Rebuild GNPL_Prepay_Model.xlsx",
                ["model/build_excel.py"],
                "model/coefficients.csv",
                "stage 2 (train)"),
    ("webapp",  "Refresh the JSX explorer's MODEL_DATA literal",
                ["webapp/build_data.py"],
                "model/python_predictions.csv",
                "stage 3 (predict)"),
]
KEY_TO_IDX = {s[0]: i for i, s in enumerate(STAGES)}


def parse_selection(raw):
    raw = raw.strip().lower().replace(" ", "")
    if raw in ("", "q", "quit", "exit"):
        return []
    if raw in ("a", "all"):
        return list(range(len(STAGES)))
    if raw in ("r", "retrain"):
        return list(range(1, len(STAGES)))   # stages 2-5
    selected = []
    for tok in raw.split(","):
        if not tok:
            continue
        if "-" in tok:
            try:
                a, b = (int(x) - 1 for x in tok.split("-", 1))
                selected.extend(range(a, b + 1))
            except ValueError:
                print(f"  ! could not parse range: {tok}")
        elif tok.isdigit():
            selected.append(int(tok) - 1)
        elif tok in KEY_TO_IDX:
            selected.append(KEY_TO_IDX[tok])
        else:
            print(f"  ! unknown stage: {tok}")
    return sorted({s for s in selected if 0 <= s < len(STAGES)})


def show_menu():
    print()
    print("GNPL Prepay Model — pipeline runner")
    print("─" * 52)
    for i, (key, label, _, _, _) in enumerate(STAGES, 1):
        print(f"  {i}. [{key:<7}] {label}")
    print()
    print("  Presets: 'retrain' (stages 2-5)   'all' (1-5)   'q' to quit")
    print("  Examples: '2'   '2,4'   '2-5'   'train'")
    print()
    return parse_selection(input("Stages to run: "))


def has_prereq(stage_idx):
    return os.path.exists(os.path.join(ROOT, STAGES[stage_idx][3]))


def run_stage(stage_idx):
    key, label, cmd, _, _ = STAGES[stage_idx]
    print(f"\n{'─' * 52}\n[{key}] {label}\n{'─' * 52}")
    return subprocess.run([sys.executable, *cmd], cwd=ROOT).returncode == 0


def main():
    ap = argparse.ArgumentParser(
        description="GNPL Prepay Model pipeline runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    keys = "/".join(s[0] for s in STAGES)
    ap.add_argument("stages", nargs="*",
                    help=f"Stage numbers (1-{len(STAGES)}) or keys ({keys}). "
                         "Omit for an interactive menu.")
    ap.add_argument("--all",     action="store_true",
                    help="Run every stage")
    ap.add_argument("--retrain", action="store_true",
                    help="Run stages 2-5 (re-fit + refresh deliverables)")
    args = ap.parse_args()

    if args.all:
        selected = list(range(len(STAGES)))
    elif args.retrain:
        selected = list(range(1, len(STAGES)))
    elif args.stages:
        selected = parse_selection(",".join(args.stages))
        if not selected:
            sys.exit(2)
    else:
        selected = show_menu()

    if not selected:
        print("nothing to run.")
        return

    print(f"\n  running stages: {[STAGES[s][0] for s in selected]}")

    # Per-stage prereq check happens just before each run, so an earlier
    # selected stage that produces a downstream prereq doesn't trip up
    # the pre-flight when the artefact doesn't exist on disk yet.
    for s in selected:
        if not has_prereq(s):
            key, _, _, need, hint = STAGES[s]
            print(f"\n  ! [{key}] requires '{need}' which doesn't exist.")
            print(f"    produced by: {hint}")
            sys.exit(1)
        if not run_stage(s):
            print("\n  ! aborting remaining stages.")
            sys.exit(1)

    print("\nok done.")


if __name__ == "__main__":
    main()
