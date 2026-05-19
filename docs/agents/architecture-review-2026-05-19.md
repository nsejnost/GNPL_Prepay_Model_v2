# Architecture Review — 2026-05-19

Captured output of the `/improve-codebase-architecture` skill from a session
on 2026-05-19. Preserved for reference in future refactor PRDs.

I've mapped the whole codebase — the ETL (`main.py`), the trainer, the
reference Python scorer (`predict_python.py`), the Excel-workbook generator
(`build_excel.py`), the webapp data builder, and the `lifetime_engine`
package.

The `lifetime_engine` package is mostly well-factored: `survival.py`,
`amortization.py`, and `aggregator.py` are textbook-deep — small interfaces
over real math. The friction is concentrated elsewhere, and one theme runs
through most of it:

**The prepayment model's rules — knot vectors, clamp bounds, override
precedence, the refi-incentive formula, the FHA taxonomy, the log-odds-to-SMM
transform — are domain facts with no single home.** Each consumer (snapshot
scorer, forward-path builder, Excel formula emitter, webapp scorer, trainer)
re-states them in its own form. The deepening opportunities below are the
moves that fix that.

---

## 1. `predict_one()` is a shallow 200-line monolith behind a 40-key dict

**Files** — `model/predict_python.py` (`predict_one`, 105–311); consumed by `lifetime_engine/engine.py:76` and `lifetime_engine/driver_attribution.py`.

**Problem** — `predict_one` does five jobs in one body: feature derivation with override-vs-derive precedence (the same 4–8-line block repeated for age, vintage, SATO, PLC, penalty, refi incentive), FHA/pool/affordable dummy encoding, piecewise log-odds per component, the SMM/CPR sigmoid, and snapshot leave-one-out attribution. It returns a flat dict of ~40 string keys. The interface is nearly as wide as the implementation — the definition of a shallow module. Callers reach in by magic key (`r["total_logodds"]`, `r["intercept_logodds"]`, `r[f"{c}_logodds"]`, `r["predicted_SMM"]`). To test the log-odds math you must route a full loan Series through all five jobs.

**Solution** — split into deep modules behind small interfaces: a *derivation* step (raw loan + period → derived features) and a *scoring* step (features → per-component log-odds + SMM), with attribution a third. Each returns a typed result, not a string-keyed dict.

**Benefits** — *Locality*: the override-precedence rule and the log-odds formula each live in one place. *Leverage*: the lifetime engine consumes a typed scored result instead of fishing 40 keys. *Tests*: the scoring seam can be exercised with hand-built feature values; today every scoring test must also exercise derivation.

## 2. The Lifetime CPR engine derives per-month features twice — and one copy is dead

**Files** — `lifetime_engine/feature_path.py` (`build_forward_feature_path`, 46–118) and `model/predict_python.py` (`predict_one`); wired in `engine.py:74–105`.

**Problem** — `build_forward_feature_path` computes `in_lockout`, `in_prepay_penalty`, `months_post_lockout`, and `months_to_maturity` for every synthetic month (lines 78–103). The engine then calls `predict_one` on each row — and `predict_one` re-derives all four from the synthetic `period` and the static dates, ignoring `feature_path`'s versions. The forward grid is built from the `predict_one` outputs. Apply the deletion test: delete those four computations from `feature_path` and nothing downstream changes — they were never load-bearing. Worse, `test_feature_path.py` tests those exact columns thoroughly, so they *read* as covered, while the values that actually drive SMM are only checked at month 1 by the t=0 agreement test. The clamps (`m2m` 0..600, `mpl` 0..60, penalty step-down) appear verbatim in both modules; change one and it silently diverges.

**Solution** — choose one seam for per-month feature derivation. Either `feature_path` owns derivation and `predict_one` consumes already-derived features (the natural pairing with #1), or `feature_path` only advances the period and one derivation module serves both the snapshot and forward paths. This also collapses `_add_months_yyyymm` — a third YYYYMM-arithmetic routine — into one period primitive alongside `months_diff`.

**Benefits** — *Locality*: one definition of how a feature evolves month to month. *Tests*: `test_feature_path.py` would exercise the values that actually reach the SMM, not a parallel dead copy.

## 3. FHA program classification is stated three times

**Files** — `model/predict_python.py` (`fha_classify`, 74–93); `main.py` (`classify_fha_category` 1037, `classify_fha_dummies` 1018, `classify_loan_purpose` 1065); `model/build_excel.py` (`write_fha_lookup` 385–415 + Excel `SEARCH/INDEX/MATCH` formulas).

**Problem** — the FHA program taxonomy — the priority-ordered substring rules (538 > 232, with 223(f)/223(a) overriding 232 to RP, …) mapping a program code to a category and a loan purpose — is one domain fact written out independently in three places, in three forms (one Python function, three Python functions, an Excel lookup table). Changing the taxonomy means three coordinated edits with nothing enforcing agreement.

**Solution** — one module owning the taxonomy as data: the ordered rule table. The Python classifier matches against it; `build_excel`'s lookup-sheet writer emits the same table as Excel rows. Two adapters over one rule table — a real seam.

**Benefits** — *Locality*: the precedence rule lives once. *Leverage*: the Excel sheet and the Python scorer can't drift. *Tests*: the rule table is tiny and directly table-testable.

## 4. The trained-model artifacts are loaded ad-hoc in four modules

**Files** — `model/predict_python.py:37–50`, `model/build_excel.py:32–40`, `webapp/build_data.py:28–37`, and `lifetime_engine/engine.py` transitively via the `predict_python` import.

**Problem** — intercept, coefficients, knot vectors, PLC-rate history, and vintage-median rates are the trained model's artifacts. Each consumer re-resolves `MODEL_DIR`, re-reads the four CSV/JSON files, and re-builds the same lookup dicts (`COEFS`, `PLC_BY_PERIOD`, `VINTAGE_MEDIAN`). `predict_python` does this at *module import time* as globals — so importing the lifetime engine reads four files off disk, and no test can score against a different coefficient set without monkeypatching module globals. "Needs these four files on disk" is an unwritten part of every scorer's interface.

**Solution** — one module representing the trained model: load the artifacts once, expose intercept / coefficient / knots / PLC rate / vintage median behind a small interface. Scorers take it as an argument instead of importing globals.

**Benefits** — *Locality*: artifact loading and path resolution in one place. *Leverage*: one load serves every scorer. *Tests*: a fake trained model makes the scorer and the whole lifetime engine testable with no files on disk, and lets a stress-coefficient set be passed in directly.

## 5. The hazard transform and leave-one-out attribution are each implemented two-to-three times

**Files** — `model/predict_python.py` (`predict_one` — SMM gate 268–271, snapshot attribution 274–282), `lifetime_engine/engine.py:77–80`, `lifetime_engine/driver_attribution.py` (`_sigmoid` 48, gate 75, leave-one-out loop 81–85).

**Problem** — "total log-odds → SMM, forced to zero in lockout, scaled by `OPTIONAL_CPR_SCALAR`" appears three times: `predict_one` gates but doesn't scale, `engine.py` scales after the fact, `driver_attribution` rebuilds the gated-and-scaled hazard from scratch because it must recompute SMM with one log-odds component zeroed. Leave-one-out CPR attribution is written once at the snapshot level inside `predict_one` and again at the lifetime level in `driver_attribution`. The shared primitive has no home.

**Solution** — one hazard function (log-odds → gated, scaled SMM) and one leave-one-out primitive, used by both the snapshot scorer and the lifetime attribution.

*This touches `driver_attribution.py`, the subject of ADR-0001, but does not reopen it* — ADR-0001's decision to normalize the deltas so they recompose stays exactly as is; only the shared hazard/leave-one-out primitive moves behind one interface.

**Benefits** — *Locality*: the lockout gate and CPR-scalar rule stop being spread across three files. *Tests*: the hazard transform becomes directly testable; today it's only reachable through a full scorer or engine run.

---

These are related — #1 and #2 are the same derivation-has-no-home problem
seen from the snapshot and forward angles; #4 is the artifact half of it;
#3 and #5 are specific rules that leaked. A natural sequence is #4 → #1 → #2,
but each stands alone.
