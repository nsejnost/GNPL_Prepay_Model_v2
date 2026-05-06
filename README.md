# GNPL Prepayment Model v2

A transparent, Excel-portable voluntary prepayment model for Ginnie Mae
multifamily project loans (GNPL).  Loan-level predictions, per-feature
attribution, and deal-level aggregation all live in a single Excel
workbook so a user can paste in loans for any number of GNR REMICs and
compare projected prepayment speeds across deals along with the drivers
that produce the differences.

## What's in the repo

```
GNPL_Prepay_Model.xlsx                ← main deliverable (open this)
main.py                               ← raw GNMA-disclosure ETL
README.md                             ← this file
requirements.txt                      ← Python dependency list
.replit, replit.nix                   ← Replit project config
BAM_gnpl_model_flipbook_202205_final.pdf
Ginnie_Project_CMBS_Primer_Cantor.pdf
Project Loan Model Citi.pdf
BBG Agency CMBS Model.pdf

model/
  train_model.py                      ← logistic-regression training
  build_excel.py                      ← regenerates the .xlsx from coefficients
  predict_python.py                   ← reference Python implementation
  coefficients.csv                    ← model coefficients (the export format)
  feature_metadata.json               ← knots, intercept, perf metrics
  calibration.csv                     ← out-of-sample decile calibration
  segment_validation.csv              ← out-of-sample CPR by segment
  sample_loans.{csv,parquet}          ← 270-loan, 6-deal demo dataset
  python_predictions.csv              ← sample model output (deal-tagged)
  plc_rates_history.csv               ← GNMA PLC rate history (for refi inc)
  vintage_median_rates.csv            ← vintage-year median rates (for SATO)
```

## Quick start

1. Open `GNPL_Prepay_Model.xlsx`.
2. The README sheet inside the workbook documents the cell colour code
   and walks through usage.
3. The Loan_Input sheet ships with 270 demo loans across 6 synthetic
   GNR REMICs (`GNR_2024_NEW`, `GNR_2014_SEASONED`, `GNR_HC_2020`,
   `GNR_AFF_2018`, `GNR_DIVERSE`, `GNR_USDA_538`).  Replace the rows
   under the yellow-highlighted input columns with your own loans —
   every formula to the right (derived features, log-odds
   contributions, predicted SMM/CPR, per-component attribution)
   recomputes automatically.
4. The Deal_Summary sheet aggregates loans by `deal_id` with
   UPB-weighted averages of the model output and of the underlying
   features.  The Deal_Comparison sheet pulls two named deals
   side-by-side along with each component's CPR contribution so the
   driver of any speed difference is immediately visible.

## Model architecture

We fit a logistic regression on monthly Single Monthly Mortality (SMM)
of voluntary prepayments, with engineered piecewise-linear spline
features that map cleanly to Excel formulas.

```
log( SMM/(1−SMM) ) = β₀
                     + f_refi(refi_incentive_bps)         ← S-curve
                     + f_age (loan_age_months)            ← seasoning + burnout
                     + f_pen (prepay_penalty_points)      ← penalty curve
                     + f_sato(sato_bps)                   ← spread at orig.
                     + f_size(upb_$mn)                    ← loan-size effect
                     + f_m2m (months_to_maturity)         ← balloon refi pull
                     + f_mpl (months_post_lockout)        ← pent-up demand
                     + β_int·(refi_pos × penalty_clip)    ← refi×penalty interact.
                     + β_phase·in_prepay_penalty           ← restriction phase
                     + Σ β_fha·1[fha_category]            ← FHA program (vs 223f)
                     + β_nc·1[loan_purpose = NC]          ← purpose
                     + Σ β_aff·1[affordable_status]       ← affordable
                     + Σ β_pool·1[pool_type ∈ {LM,PN,LS,RX}]    ← pool-type effects
```

`f_x(·)` is a hinge basis: `f(x) = β_lin·x + Σ β_k·max(x − knot_k, 0)`,
which is the standard "linear spline" construction and reproduces in
Excel as `MAX(value − knot, 0)`.  Every β lives on the Parameters sheet
and can be tweaked for stress scenarios.

In-lockout loans are forced to 0% voluntary prepay (lockout indicator
gates the SMM calculation in the formula).  Construction-phase pools
are excluded from the model — see `main.py` for the reasoning.

## Training data

Built from 1,314,304 loan-month observations across 27,348 unique GNMA
multifamily project loans (Dec 2018 – Mar 2026 — every monthly
mfplmon3 disclosure file the GNMA bulk-download portal makes
available).  The trainer uses 932,014 prepay-eligible observations from
Dec 2018 – Jun 2024 (8,881 voluntary prepay events) and holds out
308,876 observations from Jul 2024 – Mar 2026 (749 voluntary prepay
events) for validation.

| Metric                    | Train                  | Test (out-of-sample)   |
|---------------------------|------------------------|------------------------|
| AUC                       | 0.770                  | 0.579                  |
| Predicted CPR (UPB-wtd)   | 10.85 %                | 4.22 %                 |
| Actual    CPR (UPB-wtd)   | 10.85 %                | 2.87 %                 |

The held-out period is a steeply out-of-the-money rate environment
(rates back-up of 2024-2026) where observed prepay activity is
unusually low.  The model ranks correctly but over-predicts level — a
known property of project-loan models acknowledged in the BAM 2022 and
Citi 2017 papers (both in the repo).  The Parameters sheet exposes an
`OPTIONAL_CPR_SCALAR` cell (default 1.0) that level-shifts predicted
SMM if a calibration adjustment is desired.

## Reproducing the workbook

The pipeline has five stages. The easiest way to invoke any subset is
the orchestrator at the repo root:

```bash
python3 run.py             # interactive menu — pick stages by number
python3 run.py --retrain   # stages 2-5 (re-fit + refresh deliverables)
python3 run.py --all       # every stage (needs gnma_mf_data/ for stage 1)
python3 run.py 4           # rebuild only the Excel workbook
python3 run.py train excel # by stage key instead of number
```

### Stages and dependency graph

```
 1. main.py              ──►  gnma_mf_raw_data.parquet
 2. model/train_model.py ──►  model/coefficients.csv  +  feature_metadata.json
                          │   model/calibration.csv   +  segment_validation.csv
                          │
              ┌───────────┼───────────┐
              ▼                       ▼
 3. model/predict_python.py    4. model/build_excel.py
        │                            │
        ▼                            ▼
 model/python_predictions.csv   GNPL_Prepay_Model.xlsx
        │
        ▼
 5. webapp/build_data.py  ──►  webapp/PrepayExplorer.jsx
                                (in-place MODEL_DATA refresh)
```

Stages 3 and 4 are siblings — both consume stage 2's artefacts but
neither depends on the other. Stage 5 needs stage 3's
`python_predictions.csv` for its self-test fixture.

### Running stages manually

If you'd rather skip the orchestrator:

```bash
python3 main.py --skip-download             # 1. ETL    (rebuilds parquet)
python3 model/train_model.py                # 2. train  (re-fit model)
python3 model/predict_python.py             # 3. predict (score sample_loans.csv)
python3 model/build_excel.py                # 4. excel  (rebuild .xlsx)
python3 webapp/build_data.py                # 5. webapp (refresh JSX)
```

To score a different portfolio:

```bash
python3 model/predict_python.py --input mydata.csv --output mypreds.csv
```

### When to re-run `main.py`

Stages 2-5 read the parquet but never modify it, so once it exists you
can iterate freely on the model layer without rebuilding. You only need
to re-run `main.py` when **(a)** new monthly GNMA disclosure files have
been added to `gnma_mf_data/`, or **(b)** the panel-build / ETL logic
itself has changed (parsing, filters, feature engineering inside
`main.py`). In day-to-day model iteration, `python3 run.py --retrain`
is the right loop.

The PLC-rate history and vintage-median-rate files
(`model/plc_rates_history.csv`, `model/vintage_median_rates.csv`) are
pre-computed from the parquet and used by both the Excel formulas and
the Python reference scorer.

## Running on Replit

Import the GitHub repo into a fresh Replit project. The `.replit` file
wires the Run button to `python3 run.py`, so clicking Run drops you
straight into the interactive pipeline menu described above.

```bash
pip install -r requirements.txt   # one-time dep install (Replit auto-runs this)
python3 run.py                    # then click Run, or invoke from the shell
```

Two important notes:

1. **The 1.3 M-row parquet is gitignored** (it would exceed GitHub's
   100 MB hard limit). After importing, either drag-and-drop
   `gnma_mf_raw_data.parquet` into the repo root via the Replit file
   tree, or download it from this repo's GitHub release assets. None
   of the model scripts will work until that file is in place.

2. **Memory**: training touches the full panel and peaks around 2 GB.
   Replit's free tier won't survive `train_model.py`; a Boost / Pro
   account is required. The Excel build (`build_excel.py`) and the
   reference scorer (`predict_python.py`) are well under 1 GB.

To enable live GNMA Disclosure downloads from Replit (instead of using
the prebuilt parquet), uncomment `playwright>=1.40` in
`requirements.txt` and uncomment the browser system packages in
`replit.nix`.

## Known limitations

* Voluntary prepay only.  Involuntary buyouts (default-driven
  repurchase) are sparse — ~0.02 % per month — and require a separate
  credit model that has not been built here.
* Property-price-appreciation (PPA) cashout is not modelled
  explicitly; GNMA disclosure data has no PPA proxy.  Some of the
  cashout signal is captured implicitly via SATO and vintage effects.
* The simple step-down rule used to derive penalty points from
  `prepay_premium_period_yrs` is an approximation; loans with
  irregular schedules ("0 hardlock then 10/9/…/0", "5,5,5,5", etc.)
  should be entered with an explicit `prepay_penalty_points_input`
  override.
* Test-period level miscalibration in steep-rate-up regimes is real.
  Use the optional CPR scalar on the Parameters sheet for
  level-adjustment, or switch coefficients for a stress case.
