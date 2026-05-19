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
main.py                               ← raw GNMA-disclosure ETL (unchanged)
README.md                             ← this file
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
                     + Σ β_pool·1[pool_type]                ← pool-type (LM/PN/LS/RX)
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

```bash
# 1. Run the GNMA ETL (or download the prebuilt parquet from the
#    GitHub release).
python3 main.py --skip-download   # if you already have data

# 2. Re-train the model.
python3 model/train_model.py

# 3. Rebuild the Excel workbook from the latest coefficients.
python3 model/build_excel.py

# 4. (Optional) Score loans in Python without opening Excel.
python3 model/predict_python.py --input mydata.csv --output mypreds.csv
```

The PLC-rate history and vintage-median-rate files are pre-computed
from the parquet (`model/plc_rates_history.csv`,
`model/vintage_median_rates.csv`) and used both by the Excel formulas
and the Python reference scorer.

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
