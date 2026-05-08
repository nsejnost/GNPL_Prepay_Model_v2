"""
GNMA Project Loan Prepayment Model — Training Script
======================================================

Builds a transparent, Excel-portable monthly SMM (Single Monthly Mortality)
voluntary prepayment model for Ginnie Mae multifamily project loans.

Architecture
------------
The model predicts logit(SMM_monthly) as an additive sum of feature
contributions. Each contribution maps to a multiplicative effect on
predicted CPR, which gives clean component attribution that can be
reproduced in Excel cell-for-cell.

    log( p / (1-p) ) = beta_0
                       + f_refi(refi_incentive_bps)
                       + f_age (loan_age_months)
                       + f_pen (prepay_penalty_points)
                       + f_sato(sato_bps)
                       + sector_offsets (FHA category)
                       + purpose_offsets (NC vs RP vs 538 vs Other)
                       + affordable_offsets
                       + size_offset
                       + restriction_phase_offset (in_penalty vs open)

Each f_x is a piecewise-linear basis (the standard "knots" approach) so
the resulting Excel formula is just a chain of MAX/MIN expressions and
SUMPRODUCTs rather than a black-box S-curve approximation.

Targets
-------
prepaid_voluntary at the loan-month level. Construction-phase and
in-lockout rows are excluded by `prepay_eligible == 1`. UPB-weighting
is used to reflect the cashflow-relevance of each loan-month.

Train/test split
----------------
By observation period (2018-12 .. 2024-06 train / 2024-07 .. 2026-03 test).
This matches the deployment use case: forecasting forward from the
latest snapshot.

Outputs
-------
  model/coefficients.csv        — full coefficient table for Excel
  model/feature_metadata.json   — knots, dummies, intercept, scaling
  model/calibration.csv         — predicted vs actual CPR by deciles
  model/segment_validation.csv  — predicted vs actual CPR by key segments
"""

from __future__ import annotations

import json
import os
import sys
import warnings

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, log_loss

warnings.filterwarnings("ignore")

ROOT       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARQUET    = os.path.join(ROOT, "gnma_mf_raw_data.parquet")
OUT_DIR    = os.path.join(ROOT, "model")
os.makedirs(OUT_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────
# 1.  FEATURE ENGINEERING (Excel-portable piecewise-linear bases)
# ─────────────────────────────────────────────────────────────────────

# Refi incentive S-curve knots (bps). Picked from the empirical CPR
# curve so each segment captures a roughly linear regime in logit space.
REFI_KNOTS = [-150, -50, 0, 50, 100, 150, 250]

# Age ramp knots (months). Captures the seasoning ramp and burnout tail.
AGE_KNOTS  = [12, 36, 60, 84, 120, 180]

# Penalty points knots (% of par). 0 = past penalty, 10 = max yield-maint.
PEN_KNOTS  = [0, 2, 5, 8]

# SATO knots (bps).
SATO_KNOTS = [-100, -25, 25, 100]

# Loan size knots (millions of UPB).
SIZE_KNOTS = [2, 10, 25]


def piecewise_linear_basis(x: pd.Series, knots: list[float],
                           prefix: str) -> pd.DataFrame:
    """Hinge-function basis: x_k = max(x - knot_k, 0).

    The regression's coefficient on x_k is the additional slope that
    activates beyond `knot_k`. This is the same construction as a linear
    spline and reproduces in Excel as ``MAX(x-knot,0)``.
    """
    x_clean = pd.to_numeric(x, errors="coerce").fillna(0.0)
    cols = {f"{prefix}_lin": x_clean}
    for k in knots:
        cols[f"{prefix}_k{int(k)}"] = (x_clean - k).clip(lower=0)
    return pd.DataFrame(cols, index=x.index)


def months_to_maturity(df: pd.DataFrame) -> pd.Series:
    """Compute months from observation period to loan maturity.

    GNMA balloon-driven refis spike in the last 6-12 months before
    maturity as borrowers refinance into a new long-bond rather than
    pay off in full. Capped at 360 months to keep the spline tame; the
    feature only matters for the under-24-months tail.
    """
    def _yyyymm(s):
        s = (s or "").strip()
        return s[:6] if len(s) >= 6 else ""

    out = []
    for mat, p in zip(df["loan_maturity_date"].fillna("").astype(str),
                      df["period"].astype(str)):
        m = _yyyymm(mat)
        if not m or len(p) < 6:
            out.append(np.nan)
            continue
        try:
            my, mm = int(m[:4]), int(m[4:6])
            py, pm = int(p[:4]), int(p[4:6])
            out.append((my - py) * 12 + (mm - pm))
        except ValueError:
            out.append(np.nan)
    return pd.Series(out, index=df.index, dtype=float)


def months_post_lockout(df: pd.DataFrame) -> pd.Series:
    """Months elapsed since lockout_end_date.

    Citi notes that prepayment speeds spike immediately after lockout
    expiry (pent-up demand) even when penalty is still high. Negative
    values mean the loan is still in lockout — clamped to 0 because
    those rows are excluded from training anyway via prepay_eligible.
    Capped at 60 months because the pent-up effect decays well before
    that.
    """
    def _yyyymm(s):
        s = (s or "").strip()
        return s[:6] if len(s) >= 6 else ""

    out = []
    for lo, p in zip(df["lockout_end_date"].fillna("").astype(str),
                     df["period"].astype(str)):
        l = _yyyymm(lo)
        if not l or len(p) < 6:
            out.append(0.0)
            continue
        try:
            ly, lm = int(l[:4]), int(l[4:6])
            py, pm = int(p[:4]), int(p[4:6])
            d = (py - ly) * 12 + (pm - lm)
            out.append(max(0.0, min(60.0, d)))
        except ValueError:
            out.append(0.0)
    return pd.Series(out, index=df.index, dtype=float)


# Months-to-maturity knots — most of the action is in the final ~24 months.
M2M_KNOTS = [12, 24, 60]
# Months-post-lockout knots — pent-up demand decays inside ~24 months.
MPL_KNOTS = [6, 12, 24]


def build_features(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    """Return the design matrix X and the ordered feature name list."""
    parts = []

    parts.append(piecewise_linear_basis(df["refi_incentive_bps"],
                                        REFI_KNOTS, "refi"))
    parts.append(piecewise_linear_basis(df["loan_age_months"],
                                        AGE_KNOTS,  "age"))
    parts.append(piecewise_linear_basis(df["prepay_penalty_points"],
                                        PEN_KNOTS,  "pen"))
    parts.append(piecewise_linear_basis(df["sato_bps"],
                                        SATO_KNOTS, "sato"))

    # Loan size in $ millions (UPB / 1e6, capped to keep the linear
    # spline well-behaved against the small number of jumbo loans).
    upb_m = pd.to_numeric(df["upb"], errors="coerce").fillna(0.0) / 1e6
    upb_m = upb_m.clip(upper=100.0)
    parts.append(piecewise_linear_basis(upb_m, SIZE_KNOTS, "size"))

    # Months-to-maturity spline (balloon-driven refi pull).
    m2m = months_to_maturity(df).clip(lower=0, upper=600).fillna(120.0)
    parts.append(piecewise_linear_basis(m2m, M2M_KNOTS, "m2m"))

    # Months-post-lockout (pent-up demand spike).
    mpl = months_post_lockout(df)
    parts.append(piecewise_linear_basis(mpl, MPL_KNOTS, "mpl"))

    # Refi × penalty interaction — the data shows the penalty effect is
    # much stronger when the loan is in-the-money. We use a single
    # pairwise product term; the coefficient captures whether high
    # penalty multiplicatively dampens (or amplifies) the refi response.
    refi_pos = pd.to_numeric(df["refi_incentive_bps"],
                             errors="coerce").fillna(0).clip(lower=0)
    pen_clip = pd.to_numeric(df["prepay_penalty_points"],
                             errors="coerce").fillna(0).clip(0, 10)
    extras = pd.DataFrame(index=df.index)
    extras["refi_x_pen"] = (refi_pos * pen_clip) / 100.0  # rescaled

    # Restriction phase: in_penalty=1 vs open-window=0.  In-lockout rows
    # are dropped via prepay_eligible upstream so this is a clean binary.
    extras["in_penalty"]    = df["in_prepay_penalty"].astype(int)

    # FHA category dummies. 223f is the reference (largest single
    # category) so its effect is absorbed in the intercept.
    extras["fha_221d4"] = (df["fha_category"] == "221d4").astype(int)
    extras["fha_223a7"] = (df["fha_category"] == "223a7").astype(int)
    extras["fha_232"]   = (df["fha_category"] == "232").astype(int)
    extras["fha_538"]   = (df["fha_category"] == "538").astype(int)
    extras["fha_241"]   = (df["fha_category"] == "241").astype(int)
    extras["fha_220"]   = (df["fha_category"] == "220").astype(int)
    extras["fha_other"] = (df["fha_category"] == "OTHER").astype(int)

    # Loan purpose: NC vs RP (RP is reference).
    extras["is_nc"]   = (df["loan_purpose"] == "NC").astype(int)

    # Affordable status. Empty / missing maps to is_market_unknown=1.
    aff = df["affordable_status"].fillna("").str.upper().str.strip()
    extras["aff_aff"]  = (aff == "AFF").astype(int)
    extras["aff_baf"]  = (aff == "BAF").astype(int)
    extras["aff_mkt"]  = (aff == "MKT").astype(int)

    # Pool-type-derived flags. The legacy modified_ind/non_level_ind/
    # mature_loan_flag columns are 0 in 100% of the modern panel; the
    # live signal lives in pool_type. LM (Mature/Modified) pools are
    # the destination of HUD's IRR re-securitisation refis (see SanCap
    # primer), so an LM-pool loan has already been refinanced once.
    pool_type = df["pool_type"].fillna("").astype(str).str.strip()
    extras["is_lm_pool"] = (pool_type == "LM").astype(int)
    extras["is_pn_pool"] = (pool_type == "PN").astype(int)
    extras["is_ls_pool"] = (pool_type == "LS").astype(int)
    extras["is_rx_pool"] = (pool_type == "RX").astype(int)

    parts.append(extras)
    X = pd.concat(parts, axis=1)
    feature_names = list(X.columns)
    return X, feature_names


# ─────────────────────────────────────────────────────────────────────
# 2.  TRAIN / TEST SPLIT
# ─────────────────────────────────────────────────────────────────────

CUTOFF_PERIOD = "202407"   # train through 2024-06; test 2024-07+

def time_split(df: pd.DataFrame):
    train_mask = df["period"] <  CUTOFF_PERIOD
    test_mask  = df["period"] >= CUTOFF_PERIOD
    return train_mask, test_mask


# ─────────────────────────────────────────────────────────────────────
# 3.  TRAIN
# ─────────────────────────────────────────────────────────────────────

def smm_to_cpr(smm: float | np.ndarray) -> float | np.ndarray:
    return 1.0 - (1.0 - smm) ** 12


def train():
    print(f"[load] {PARQUET}")
    df = pd.read_parquet(PARQUET)
    print(f"[load] {len(df):,} rows, {df['loan_id'].nunique():,} unique loans")

    elig = df[df["prepay_eligible"] == 1].copy()
    print(f"[filter] prepay_eligible=1: {len(elig):,} rows")

    # Drop rows where any of the core features are missing (rare —
    # mostly old vintage data with no PLC rate available).
    core = ["refi_incentive_bps", "loan_age_months",
            "prepay_penalty_points", "sato_bps", "upb"]
    before = len(elig)
    elig = elig.dropna(subset=core)
    print(f"[filter] non-null core features: {len(elig):,} "
          f"(dropped {before - len(elig):,})")

    X, feature_names = build_features(elig)
    y = elig["prepaid_voluntary"].astype(int).values
    w = np.log1p(elig["upb"].fillna(0).values)   # log-UPB weighting

    train_mask, test_mask = time_split(elig)
    print(f"[split] train: {train_mask.sum():,}  "
          f"test: {test_mask.sum():,}  "
          f"train events: {y[train_mask].sum():,}  "
          f"test events: {y[test_mask].sum():,}")

    # ── Logistic regression (the model that ships to Excel) ──────────
    # Standardize features so coefficients are well-scaled and the
    # solver converges quickly on a million rows.  We scale by the
    # weighted standard deviation in the train set, then divide the
    # learned coefficients back by those scales before exporting so the
    # Excel formulas can read raw inputs.
    Xtr = X.loc[train_mask].copy()
    wtr = w[train_mask]

    feature_means = np.average(Xtr.values, axis=0, weights=wtr)
    var = np.average((Xtr.values - feature_means) ** 2, axis=0, weights=wtr)
    feature_scales = np.sqrt(np.maximum(var, 1e-12))
    Xtr_z = (Xtr.values - feature_means) / feature_scales
    Xte_z = (X.loc[test_mask].values - feature_means) / feature_scales

    print("[fit ] logistic regression (saga, standardized) …", flush=True)
    clf = LogisticRegression(
        penalty="l2", C=4.0, solver="lbfgs",
        max_iter=200, tol=1e-4, fit_intercept=True, n_jobs=-1,
    )
    clf.fit(Xtr_z, y[train_mask], sample_weight=wtr)
    print(f"[fit ] iterations: {clf.n_iter_}", flush=True)

    # Un-standardize the coefficients so Excel can apply them directly
    # to raw feature values.
    raw_coef = clf.coef_[0] / feature_scales
    raw_intercept = clf.intercept_[0] - float(np.dot(raw_coef, feature_means))
    clf.coef_ = raw_coef.reshape(1, -1)
    clf.intercept_ = np.array([raw_intercept])

    # ── Eval ─────────────────────────────────────────────────────────
    p_train = clf.predict_proba(X.loc[train_mask])[:, 1]
    p_test  = clf.predict_proba(X.loc[test_mask])[:, 1]

    auc_tr = roc_auc_score(y[train_mask], p_train,
                           sample_weight=w[train_mask])
    auc_te = roc_auc_score(y[test_mask], p_test,
                           sample_weight=w[test_mask])
    ll_tr  = log_loss(y[train_mask], p_train,
                      sample_weight=w[train_mask])
    ll_te  = log_loss(y[test_mask],  p_test,
                      sample_weight=w[test_mask])
    cpr_pred_tr  = smm_to_cpr(p_train.mean()) * 100
    cpr_pred_te  = smm_to_cpr(p_test.mean())  * 100
    cpr_actual_tr = smm_to_cpr(y[train_mask].mean()) * 100
    cpr_actual_te = smm_to_cpr(y[test_mask].mean())  * 100

    print(f"[eval] TRAIN  AUC {auc_tr:.4f}  LL {ll_tr:.5f}  "
          f"pred CPR {cpr_pred_tr:.2f}%  actual CPR {cpr_actual_tr:.2f}%")
    print(f"[eval] TEST   AUC {auc_te:.4f}  LL {ll_te:.5f}  "
          f"pred CPR {cpr_pred_te:.2f}%  actual CPR {cpr_actual_te:.2f}%")

    # ── Persist coefficients ─────────────────────────────────────────
    coef_df = pd.DataFrame({
        "feature": feature_names,
        "coefficient": clf.coef_[0],
    })
    coef_df.loc[len(coef_df)] = ["__intercept__", float(clf.intercept_[0])]
    coef_path = os.path.join(OUT_DIR, "coefficients.csv")
    coef_df.to_csv(coef_path, index=False)
    print(f"[save] {coef_path}")

    # ── Calibration by predicted decile ──────────────────────────────
    test_df = elig.loc[test_mask].copy()
    test_df["p_smm"] = p_test
    test_df["upb_w"] = test_df["upb"].fillna(0)
    test_df["decile"] = pd.qcut(test_df["p_smm"], 10,
                                labels=False, duplicates="drop")
    cal = test_df.groupby("decile").apply(
        lambda g: pd.Series({
            "n":            len(g),
            "upb_mn":       g["upb_w"].sum() / 1e6,
            "pred_smm":     np.average(g["p_smm"], weights=g["upb_w"]),
            "actual_smm":   np.average(g["prepaid_voluntary"],
                                       weights=g["upb_w"]),
        })
    )
    cal["pred_cpr"]   = smm_to_cpr(cal["pred_smm"])   * 100
    cal["actual_cpr"] = smm_to_cpr(cal["actual_smm"]) * 100
    cal_path = os.path.join(OUT_DIR, "calibration.csv")
    cal.round(4).to_csv(cal_path)
    print(f"[save] {cal_path}")
    print(cal.round(3))

    # ── Segment validation ──────────────────────────────────────────
    seg_rows = []
    for col, label in [
        ("loan_purpose", "loan_purpose"),
        ("fha_category", "fha_category"),
        ("affordable_status", "affordable_status"),
    ]:
        for k, g in test_df.groupby(col):
            seg_rows.append({
                "segment_field":   col,
                "segment_value":   k,
                "n":               len(g),
                "upb_mn":          g["upb_w"].sum() / 1e6,
                "pred_cpr":        smm_to_cpr(np.average(g["p_smm"],
                                                          weights=g["upb_w"])) * 100,
                "actual_cpr":      smm_to_cpr(np.average(g["prepaid_voluntary"],
                                                          weights=g["upb_w"])) * 100,
            })
    seg_df = pd.DataFrame(seg_rows)
    seg_path = os.path.join(OUT_DIR, "segment_validation.csv")
    seg_df.round(4).to_csv(seg_path, index=False)
    print(f"[save] {seg_path}")
    print(seg_df.round(2))

    # ── Feature metadata for the Excel implementation ───────────────
    metadata = {
        "intercept":             float(clf.intercept_[0]),
        "feature_names":         feature_names,
        "knots": {
            "refi": REFI_KNOTS,
            "age":  AGE_KNOTS,
            "pen":  PEN_KNOTS,
            "sato": SATO_KNOTS,
            "size": SIZE_KNOTS,
            "m2m":  M2M_KNOTS,
            "mpl":  MPL_KNOTS,
        },
        "train_period_min":      str(elig.loc[train_mask, "period"].min()),
        "train_period_max":      str(elig.loc[train_mask, "period"].max()),
        "test_period_min":       str(elig.loc[test_mask,  "period"].min()),
        "test_period_max":       str(elig.loc[test_mask,  "period"].max()),
        "train_n":               int(train_mask.sum()),
        "test_n":                int(test_mask.sum()),
        "train_events":          int(y[train_mask].sum()),
        "test_events":           int(y[test_mask].sum()),
        "train_auc":             float(auc_tr),
        "test_auc":              float(auc_te),
        "train_pred_cpr_pct":    float(cpr_pred_tr),
        "test_pred_cpr_pct":     float(cpr_pred_te),
        "train_actual_cpr_pct":  float(cpr_actual_tr),
        "test_actual_cpr_pct":   float(cpr_actual_te),
    }
    meta_path = os.path.join(OUT_DIR, "feature_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[save] {meta_path}")

    # Save the test predictions so the Excel builder can sanity-check.
    pred_df = test_df[["loan_id", "period", "pool_cusip",
                       "issuer_name", "fha_category", "loan_purpose",
                       "loan_age_months", "refi_incentive_bps",
                       "prepay_penalty_points", "sato_bps", "upb",
                       "p_smm", "prepaid_voluntary"]].copy()
    pred_df["pred_cpr_pct"] = smm_to_cpr(pred_df["p_smm"]) * 100
    pred_path = os.path.join(OUT_DIR, "test_predictions.parquet")
    pred_df.to_parquet(pred_path, index=False)
    print(f"[save] {pred_path}")

    return clf, coef_df, metadata


if __name__ == "__main__":
    train()
