"""
Reference Python implementation of the same prepayment formula chain
that lives in the Excel workbook.

Use this script to:
  •  Sanity-check Excel results — compare a row's CPR from the Excel
     sheet to this script's CPR for the same loan.
  •  Score a CSV of loans without opening Excel.

Inputs:
  Either the sample_loans.csv that ships with the repo, or any CSV /
  parquet with the same column layout (deal_id, period, loan_rate, upb,
  origination_date, loan_maturity_date, lockout_end_date,
  prepay_end_date, prepay_premium_period_yrs, fha_program_code,
  affordable_status, modified_ind, non_level_ind, mature_loan_flag,
  optional pre-computed feature columns).

Output:
  python_predictions.csv — one row per input loan with predicted_SMM,
  predicted_CPR_pct, all log-odds component contributions, and per-
  component CPR attribution.
"""

from __future__ import annotations

import argparse
import json
import os
import sys

import numpy as np
import pandas as pd

ROOT      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(ROOT, "model")

with open(os.path.join(MODEL_DIR, "feature_metadata.json")) as f:
    META = json.load(f)
COEF = pd.read_csv(os.path.join(MODEL_DIR, "coefficients.csv"))
PLC_HIST = pd.read_csv(os.path.join(MODEL_DIR, "plc_rates_history.csv"))
VINTAGE  = pd.read_csv(os.path.join(MODEL_DIR, "vintage_median_rates.csv"))

INTERCEPT = float(COEF.loc[COEF["feature"] == "__intercept__",
                           "coefficient"].iloc[0])
COEFS = dict(zip(COEF["feature"], COEF["coefficient"]))

PLC_BY_PERIOD     = dict(zip(PLC_HIST["period"].astype(int),
                             PLC_HIST["plc_rate_bps"].astype(float)))
VINTAGE_MEDIAN    = dict(zip(VINTAGE["vintage_year"].astype(int),
                             VINTAGE["median_rate"].astype(float)))


def _yyyymm(s):
    s = str(s).strip() if s is not None else ""
    if s in ("", "nan", "None"):
        return ""
    if s.replace(".", "").isdigit():
        s = str(int(float(s)))
    return s[:6] if len(s) >= 6 else ""


def months_diff(a_yyyymm: str, b_yyyymm: str) -> float | None:
    """Return months elapsed from b → a (positive when a > b)."""
    if not a_yyyymm or not b_yyyymm:
        return None
    try:
        ay, am = int(a_yyyymm[:4]), int(a_yyyymm[4:6])
        by, bm = int(b_yyyymm[:4]), int(b_yyyymm[4:6])
        return (ay - by) * 12 + (am - bm)
    except ValueError:
        return None


def fha_classify(code: str | float) -> tuple[str, str]:
    c = str(code or "").strip().upper().replace(" ", "")
    if not c:
        return "OTHER", "OTHER"
    rules = [
        ("538",    "538",    "538"),
        ("232",    "232",    "NC"),    # may be overridden by 223 below
        ("223(F)", "223f",   "RP"),
        ("223F",   "223f",   "RP"),
        ("223(A)", "223a7",  "RP"),
        ("223A",   "223a7",  "RP"),
        ("221(D)", "221d4",  "NC"),
        ("221D",   "221d4",  "NC"),
        ("220",    "220",    "NC"),
        ("241",    "241",    "NC"),
    ]
    for s, cat, purp in rules:
        if s in c:
            return cat, purp
    return "OTHER", "OTHER"


def piecewise_logodds(value: float, knots: list[float],
                      lin_param: str, knot_prefix: str) -> float:
    s = COEFS[lin_param] * value
    for k in knots:
        kname = f"{knot_prefix}{int(k) if k == int(k) else k}"
        s += COEFS[kname] * max(value - k, 0)
    return s


def predict_one(row: pd.Series) -> dict:
    period = _yyyymm(row.get("period"))

    # ── Restriction phase ────────────────────────────────────────────
    lockout_end = _yyyymm(row.get("lockout_end_date"))
    prepay_end  = _yyyymm(row.get("prepay_end_date"))
    in_lockout  = 1 if (lockout_end and period < lockout_end) else 0
    in_penalty  = 1 if (prepay_end  and period < prepay_end)  else 0

    # ── Loan age (override > derive) ─────────────────────────────────
    age = row.get("loan_age_months")
    if pd.isna(age):
        age = row.get("loan_age_months_input")
    if pd.isna(age):
        orig = _yyyymm(row.get("origination_date"))
        d = months_diff(period, orig)
        age = max(0, d) if d is not None else 0
    age = float(age)

    # ── Months to maturity ──────────────────────────────────────────
    mat = _yyyymm(row.get("loan_maturity_date"))
    m2m_raw = months_diff(mat, period)
    m2m = max(0, min(600, m2m_raw)) if m2m_raw is not None else 120

    # ── Months post lockout (clamped 0..60) ─────────────────────────
    mpl_raw = months_diff(period, lockout_end) if lockout_end else None
    mpl = max(0, min(60, mpl_raw)) if mpl_raw is not None else 0

    # ── Vintage and SATO ────────────────────────────────────────────
    vintage = row.get("vintage_year")
    if pd.isna(vintage):
        vintage = row.get("vintage_year_input")
    if pd.isna(vintage):
        orig = _yyyymm(row.get("origination_date"))
        if len(orig) >= 4:
            try:
                vintage = int(orig[:4])
            except ValueError:
                vintage = None
        else:
            vintage = None
    vintage_int = int(vintage) if vintage is not None and not pd.isna(vintage) else None

    sato = row.get("sato_bps")
    if pd.isna(sato):
        sato = row.get("sato_bps_input")
    if pd.isna(sato):
        loan_rate = row.get("loan_rate") or row.get("loan_rate_pct")
        med = VINTAGE_MEDIAN.get(vintage_int)
        if pd.notna(loan_rate) and med is not None:
            sato = (float(loan_rate) - float(med)) * 100
        else:
            sato = 0
    sato = float(sato)

    # ── PLC rate ─────────────────────────────────────────────────────
    plc = row.get("plc_rate_bps")
    if pd.isna(plc):
        plc = row.get("plc_rate_bps_input")
    if pd.isna(plc):
        try:
            plc = PLC_BY_PERIOD.get(int(period))
        except (TypeError, ValueError):
            plc = None
    plc = float(plc) if plc is not None else 0.0

    # ── Penalty points (override > step-down rule) ──────────────────
    pen = row.get("prepay_penalty_points")
    if pd.isna(pen):
        pen = row.get("prepay_penalty_points_input")
    if pd.isna(pen):
        if in_penalty:
            mr = months_diff(prepay_end, period)
            pen = max(0, min(10, mr / 12.0)) if mr is not None else 0
        else:
            pen = 0
    pen = float(pen)

    # ── Refi incentive (override > derive) ──────────────────────────
    refi_inc = row.get("refi_incentive_bps")
    if pd.isna(refi_inc):
        loan_rate = row.get("loan_rate") or row.get("loan_rate_pct")
        if pd.notna(loan_rate):
            refi_inc = float(loan_rate) * 100 - (plc + (1 + pen) * 12.5)
        else:
            refi_inc = 0
    refi_inc = float(refi_inc)

    # ── UPB millions ────────────────────────────────────────────────
    upb = float(row.get("upb") or 0)
    upb_m = min(upb / 1_000_000, 100)

    # ── FHA / purpose / dummies ─────────────────────────────────────
    fha_code = row.get("fha_program_code")
    if not fha_code or (isinstance(fha_code, float) and pd.isna(fha_code)):
        fha_cat = row.get("fha_category", "OTHER")
        purpose = row.get("loan_purpose", "OTHER")
    else:
        fha_cat, purpose = fha_classify(fha_code)

    is_nc = 1 if purpose == "NC" else 0
    fha_221d4 = 1 if fha_cat == "221d4" else 0
    fha_223a7 = 1 if fha_cat == "223a7" else 0
    fha_232   = 1 if fha_cat == "232"   else 0
    fha_538   = 1 if fha_cat == "538"   else 0
    fha_241   = 1 if fha_cat == "241"   else 0
    fha_220   = 1 if fha_cat == "220"   else 0
    fha_other = 1 if fha_cat == "OTHER" else 0

    aff = str(row.get("affordable_status") or "").upper().strip()
    aff_aff = 1 if aff == "AFF" else 0
    aff_baf = 1 if aff == "BAF" else 0
    aff_mkt = 1 if aff == "MKT" else 0

    # Pool-type-derived flags. The legacy modified_ind/non_level_ind/
    # mature_loan_flag fields are blank in the modern panel; pool_type
    # carries the live signal (LM=Mature/Modified, PN=Non-Level, LS=
    # Small-Balance, RX=Mark-to-Market). See SanCap primer.
    pool_type = str(row.get("pool_type") or "").upper().strip()
    is_lm_pool = 1 if pool_type == "LM" else 0
    is_pn_pool = 1 if pool_type == "PN" else 0
    is_ls_pool = 1 if pool_type == "LS" else 0
    is_rx_pool = 1 if pool_type == "RX" else 0

    # ── Component log-odds contributions ────────────────────────────
    refi_lo = piecewise_logodds(refi_inc, META["knots"]["refi"], "refi_lin", "refi_k")
    age_lo  = piecewise_logodds(age,      META["knots"]["age"],  "age_lin",  "age_k")
    pen_lo  = piecewise_logodds(pen,      META["knots"]["pen"],  "pen_lin",  "pen_k")
    sato_lo = piecewise_logodds(sato,     META["knots"]["sato"], "sato_lin", "sato_k")
    size_lo = piecewise_logodds(upb_m,    META["knots"]["size"], "size_lin", "size_k")
    m2m_lo  = piecewise_logodds(m2m,      META["knots"]["m2m"],  "m2m_lin",  "m2m_k")
    mpl_lo  = piecewise_logodds(mpl,      META["knots"]["mpl"],  "mpl_lin",  "mpl_k")
    inter_lo = COEFS["refi_x_pen"] * (max(refi_inc, 0) * min(max(pen, 0), 10)) / 100
    phase_lo = COEFS["in_penalty"] * in_penalty
    fha_lo  = (COEFS["fha_221d4"] * fha_221d4 + COEFS["fha_223a7"] * fha_223a7 +
               COEFS["fha_232"]  * fha_232   + COEFS["fha_538"]   * fha_538   +
               COEFS["fha_241"]  * fha_241   + COEFS["fha_220"]   * fha_220   +
               COEFS["fha_other"] * fha_other)
    purp_lo = COEFS["is_nc"] * is_nc
    aff_lo  = (COEFS["aff_aff"] * aff_aff + COEFS["aff_baf"] * aff_baf +
               COEFS["aff_mkt"] * aff_mkt)
    pool_lo = (COEFS["is_lm_pool"] * is_lm_pool +
               COEFS["is_pn_pool"] * is_pn_pool +
               COEFS["is_ls_pool"] * is_ls_pool +
               COEFS["is_rx_pool"] * is_rx_pool)

    components = {
        "REFI":     refi_lo,
        "AGE":      age_lo,
        "PEN":      pen_lo,
        "SATO":     sato_lo,
        "SIZE":     size_lo,
        "M2M":      m2m_lo,
        "MPL":      mpl_lo,
        "INTERACT": inter_lo,
        "PHASE":    phase_lo,
        "FHA":      fha_lo,
        "PURPOSE":  purp_lo,
        "AFF":      aff_lo,
        "POOL":     pool_lo,
    }
    total_lo = INTERCEPT + sum(components.values())

    if in_lockout:
        smm = 0.0
    else:
        smm = 1.0 / (1.0 + np.exp(-total_lo))
    cpr = (1 - (1 - smm) ** 12) * 100

    # Per-component CPR attribution
    attr = {}
    for k, v in components.items():
        if in_lockout:
            attr[k] = 0.0
        else:
            smm_wo = 1.0 / (1.0 + np.exp(-(total_lo - v)))
            cpr_wo = (1 - (1 - smm_wo) ** 12) * 100
            attr[k] = cpr - cpr_wo

    # Baseline CPR (intercept only), lockout-gated to match predicted CPR.
    if in_lockout:
        baseline_cpr = 0.0
    else:
        baseline_smm = 1.0 / (1.0 + np.exp(-INTERCEPT))
        baseline_cpr = (1 - (1 - baseline_smm) ** 12) * 100

    out = {
        "in_lockout":       in_lockout,
        "in_prepay_penalty": in_penalty,
        "loan_age_months":  age,
        "months_to_maturity": m2m,
        "months_post_lockout": mpl,
        "vintage_year":     vintage_int,
        "sato_bps":         sato,
        "plc_rate_bps":     plc,
        "prepay_penalty_points": pen,
        "refi_incentive_bps": refi_inc,
        "upb_millions":     upb_m,
        "fha_category":     fha_cat,
        "loan_purpose":     purpose,
        "intercept_logodds":      INTERCEPT,
        "total_logodds":          total_lo,
        "predicted_SMM":          smm,
        "predicted_CPR_pct":      cpr,
        "baseline_CPR_pct":       baseline_cpr,
    }
    for k, v in components.items():
        out[f"{k}_logodds"] = v
        out[f"CPR_attr_{k}"] = attr[k]
    return out


def predict_df(df: pd.DataFrame) -> pd.DataFrame:
    rows = [predict_one(r) for _, r in df.iterrows()]
    return pd.DataFrame(rows, index=df.index)


# ─── CLI ────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", default=os.path.join(MODEL_DIR, "sample_loans.csv"),
                    help="CSV or parquet of input loans")
    ap.add_argument("--output", default=os.path.join(MODEL_DIR, "python_predictions.csv"),
                    help="Output CSV")
    args = ap.parse_args()

    if args.input.endswith(".parquet"):
        df = pd.read_parquet(args.input)
    else:
        df = pd.read_csv(args.input)
    print(f"[load] {len(df)} loans from {args.input}")

    pred = predict_df(df)
    out = pd.concat([df.reset_index(drop=True), pred.reset_index(drop=True)], axis=1)
    out.to_csv(args.output, index=False)
    print(f"[save] {args.output}")

    # Quick deal-level summary
    if "deal_id" in out.columns:
        gp = out.groupby("deal_id").apply(
            lambda g: pd.Series({
                "n":            len(g),
                "upb_mn":       g["upb"].sum() / 1e6 if "upb" in g.columns else 0,
                "wtd_pred_cpr": np.average(g["predicted_CPR_pct"],
                                           weights=g["upb"].fillna(0).clip(lower=1))
                                  if "upb" in g.columns else g["predicted_CPR_pct"].mean(),
            })
        ).round(3)
        print("\nDeal summary:")
        print(gp.to_string())


if __name__ == "__main__":
    main()
