"""
Harvest data for the webapp .jsx and inject it into the MODEL_DATA
constant inside webapp/PrepayExplorer.jsx.

Run after retraining the model (or whenever any of the artefacts under
model/ change):

    python3 webapp/build_data.py

The script:
  1. Reads the model artefacts and the full panel.
  2. Computes monthly fit, outlier samples, feature distributions,
     reference-loan defaults, and the self-test fixture.
  3. Writes /tmp/webapp_data.json (kept for inspection) and
     in-place updates the MODEL_DATA literal inside
     webapp/PrepayExplorer.jsx.
"""
import json
import os
import re
import sys

import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(f"{ROOT}/model/feature_metadata.json") as f:
    META = json.load(f)
COEF = pd.read_csv(f"{ROOT}/model/coefficients.csv")
COEFS = dict(zip(COEF["feature"], COEF["coefficient"]))
INTERCEPT = COEFS["__intercept__"]
PLC_HIST = pd.read_csv(f"{ROOT}/model/plc_rates_history.csv")
VINTAGE  = pd.read_csv(f"{ROOT}/model/vintage_median_rates.csv")
CALIB    = pd.read_csv(f"{ROOT}/model/calibration.csv")
SEGS     = pd.read_csv(f"{ROOT}/model/segment_validation.csv")
SAMPLE   = pd.read_csv(f"{ROOT}/model/sample_loans.csv")

# ─── Vectorised prediction on the full panel ─────────────────────────
print("[load] full panel ...")
df = pd.read_parquet(f"{ROOT}/gnma_mf_raw_data.parquet")
df = df[df["prepay_eligible"] == 1].copy()
df["period"] = pd.to_numeric(df["period"], errors="coerce").astype("Int64")
print(f"  eligible rows: {len(df):,}")

def hinge(x, k):
    return np.maximum(x - k, 0)

def piecewise(values, knots, lin_param, knot_prefix):
    s = COEFS[lin_param] * values
    for k in knots:
        kname = f"{knot_prefix}{int(k) if k == int(k) else k}"
        s = s + COEFS[kname] * hinge(values, k)
    return s

def yyyymm_to_int(s):
    return pd.to_numeric(s, errors="coerce")

def to_yyyymm_arr(series):
    # Accepts ints/floats either as YYYYMM (6 digits) or YYYYMMDD (8 digits)
    v = pd.to_numeric(series, errors="coerce").astype("Float64").astype(float).values
    big = v >= 1_000_000  # 8-digit YYYYMMDD
    out = np.where(big, np.floor(v / 100), v)
    return out

period_int = to_yyyymm_arr(df["period"])
mat_int    = to_yyyymm_arr(df["loan_maturity_date"])
lo_int     = to_yyyymm_arr(df["lockout_end_date"])

def months_diff(a, b):
    ay, am = a // 100, a % 100
    by, bm = b // 100, b % 100
    return (ay - by) * 12 + (am - bm)

m2m_raw = months_diff(mat_int, period_int)
m2m = np.clip(np.where(np.isnan(m2m_raw), 120, m2m_raw), 0, 600)
mpl_raw = months_diff(period_int, lo_int)
mpl = np.clip(np.where(np.isnan(mpl_raw), 0, mpl_raw), 0, 60)

refi  = df["refi_incentive_bps"].astype(float).values
age   = df["loan_age_months"].astype(float).values
pen   = df["prepay_penalty_points"].astype(float).values
sato  = df["sato_bps"].astype(float).values
upb_m = np.minimum(df["upb"].astype(float).values / 1e6, 100)

refi_lo = piecewise(refi,  META["knots"]["refi"], "refi_lin", "refi_k")
age_lo  = piecewise(age,   META["knots"]["age"],  "age_lin",  "age_k")
pen_lo  = piecewise(pen,   META["knots"]["pen"],  "pen_lin",  "pen_k")
sato_lo = piecewise(sato,  META["knots"]["sato"], "sato_lin", "sato_k")
size_lo = piecewise(upb_m, META["knots"]["size"], "size_lin", "size_k")
m2m_lo  = piecewise(m2m,   META["knots"]["m2m"],  "m2m_lin",  "m2m_k")
mpl_lo  = piecewise(mpl,   META["knots"]["mpl"],  "mpl_lin",  "mpl_k")
inter_lo = COEFS["refi_x_pen"] * (np.maximum(refi, 0) * np.minimum(np.maximum(pen, 0), 10)) / 100
phase_lo = COEFS["in_penalty"] * df["in_prepay_penalty"].astype(float).values

fha_cat = df["fha_category"].astype(str).values
purp    = df["loan_purpose"].astype(str).values
aff     = df["affordable_status"].astype(str).str.upper().str.strip().values

fha_lo = (
    COEFS["fha_221d4"] * (fha_cat == "221d4")
    + COEFS["fha_223a7"] * (fha_cat == "223a7")
    + COEFS["fha_232"]   * (fha_cat == "232")
    + COEFS["fha_538"]   * (fha_cat == "538")
    + COEFS["fha_241"]   * (fha_cat == "241")
    + COEFS["fha_220"]   * (fha_cat == "220")
    + COEFS["fha_other"] * (fha_cat == "OTHER")
)
purp_lo = COEFS["is_nc"] * (purp == "NC")
aff_lo  = (COEFS["aff_aff"] * (aff == "AFF")
           + COEFS["aff_baf"] * (aff == "BAF")
           + COEFS["aff_mkt"] * (aff == "MKT"))

total_lo = INTERCEPT + refi_lo + age_lo + pen_lo + sato_lo + size_lo + m2m_lo + mpl_lo \
           + inter_lo + phase_lo + fha_lo + purp_lo + aff_lo

in_lockout = df["in_lockout"].astype(int).values
smm = np.where(in_lockout == 1, 0.0, 1.0 / (1.0 + np.exp(-total_lo)))
pred_cpr = (1 - (1 - smm) ** 12) * 100.0

df["pred_cpr_pct"] = pred_cpr
df["actual_cpr_pct"] = df["prepaid_voluntary"].astype(float).values * 100.0
df["upb_w"] = df["upb"].clip(lower=0).fillna(0)

# ─── Monthly fit (overall + by fha_category) ─────────────────────────
def wavg(group, col):
    w = group["upb_w"].values
    if w.sum() <= 0:
        return np.nan
    return np.average(group[col].values, weights=w)

print("[agg] monthly fit ...")
def monthly_table(g):
    return pd.Series({
        "n":           int(len(g)),
        "upb_mn":      g["upb_w"].sum() / 1e6,
        "pred_cpr":    wavg(g, "pred_cpr_pct"),
        "actual_cpr": (g["prepaid_voluntary"].sum() / max(len(g), 1)) * 1200.0,  # SMM→CPR-ish using count rate
    })

# Use UPB-weighted SMM → CPR for actual monthly aggregate (matches train/test_actual_cpr_pct in metadata)
def upb_weighted_smm_to_cpr(g, col):
    w = g["upb_w"].values
    if w.sum() <= 0:
        return np.nan
    smm_val = np.average(g[col].values, weights=w)
    return (1 - (1 - smm_val) ** 12) * 100.0

print("  computing UPB-weighted monthly tables ...")

monthly_overall = []
for period, g in df.groupby("period", sort=True):
    smm_actual = (g["prepaid_voluntary"].astype(float) * g["upb_w"]).sum() / max(g["upb_w"].sum(), 1)
    smm_pred   = ((pred_cpr_to_smm := 1 - (1 - g["pred_cpr_pct"]/100) ** (1/12)) * g["upb_w"]).sum() / max(g["upb_w"].sum(), 1)
    monthly_overall.append({
        "period":     int(period),
        "n":          int(len(g)),
        "upb_mn":     round(g["upb_w"].sum() / 1e6, 2),
        "pred_cpr":   round((1 - (1 - smm_pred) ** 12) * 100, 4),
        "actual_cpr": round((1 - (1 - smm_actual) ** 12) * 100, 4),
    })

monthly_by_cat = {}
for cat, g_cat in df.groupby("fha_category", sort=True):
    rows = []
    for period, g in g_cat.groupby("period", sort=True):
        if g["upb_w"].sum() <= 0:
            continue
        smm_actual = (g["prepaid_voluntary"].astype(float) * g["upb_w"]).sum() / g["upb_w"].sum()
        smm_pred = ((1 - (1 - g["pred_cpr_pct"] / 100) ** (1/12)) * g["upb_w"]).sum() / g["upb_w"].sum()
        rows.append({
            "period":     int(period),
            "pred_cpr":   round((1 - (1 - smm_pred) ** 12) * 100, 4),
            "actual_cpr": round((1 - (1 - smm_actual) ** 12) * 100, 4),
            "n":          int(len(g)),
        })
    monthly_by_cat[str(cat)] = rows

# ─── Outlier samples (test-period only, since that's the held-out test) ──
print("[sample] outliers ...")
test_df = df[df["period"] >= 202407].copy()
test_df["residual"] = test_df["pred_cpr_pct"] - test_df["actual_cpr_pct"]

over_pred  = test_df.nlargest(50, "residual")
under_pred = test_df.nsmallest(50, "residual")
high_pred  = test_df.nlargest(50, "pred_cpr_pct")
low_pred   = test_df.nsmallest(50, "pred_cpr_pct")

OUTLIER_COLS = [
    "loan_id", "period", "pool_cusip", "issuer_name", "fha_category",
    "loan_purpose", "affordable_status", "loan_age_months",
    "refi_incentive_bps", "prepay_penalty_points", "sato_bps",
    "upb", "pred_cpr_pct", "actual_cpr_pct", "residual",
]

def df_to_records(d):
    out = []
    for _, r in d[OUTLIER_COLS].iterrows():
        rec = {}
        for c in OUTLIER_COLS:
            v = r[c]
            if isinstance(v, float):
                if np.isnan(v):
                    v = None
                else:
                    v = round(float(v), 4)
            elif hasattr(v, "item"):
                v = v.item()
            rec[c] = v
        out.append(rec)
    return out

outliers = {
    "over_pred":  df_to_records(over_pred),
    "under_pred": df_to_records(under_pred),
    "high_pred":  df_to_records(high_pred),
    "low_pred":   df_to_records(low_pred),
}

# ─── Feature distributions (histograms) ─────────────────────────────
print("[hist] feature distributions ...")
def hist(values, nbins, lo=None, hi=None):
    v = np.asarray(values, dtype=float)
    v = v[~np.isnan(v)]
    if lo is None:
        lo = float(np.quantile(v, 0.005))
    if hi is None:
        hi = float(np.quantile(v, 0.995))
    edges = np.linspace(lo, hi, nbins + 1)
    counts, _ = np.histogram(v, bins=edges)
    return {
        "edges":  [round(float(e), 3) for e in edges],
        "counts": [int(c) for c in counts],
        "min":    round(float(np.min(v)), 2),
        "max":    round(float(np.max(v)), 2),
        "mean":   round(float(np.mean(v)), 2),
    }

dist = {
    "refi_incentive_bps":   hist(df["refi_incentive_bps"].dropna(), 30, -300, 400),
    "loan_age_months":      hist(df["loan_age_months"].dropna(), 30, 0, 360),
    "prepay_penalty_points":hist(df["prepay_penalty_points"].dropna(), 11, 0, 10),
    "sato_bps":             hist(df["sato_bps"].dropna(), 30, -200, 200),
    "upb_millions":         hist((df["upb"] / 1e6).dropna(), 30, 0, 80),
    "months_to_maturity":   hist(np.clip(months_diff(mat_int, period_int), 0, 600), 30, 0, 480),
    "months_post_lockout":  hist(mpl, 30, 0, 60),
}

cat_counts = {
    "fha_category":      df["fha_category"].value_counts().to_dict(),
    "loan_purpose":      df["loan_purpose"].value_counts().to_dict(),
    "affordable_status": df["affordable_status"].fillna("").value_counts().to_dict(),
}
cat_counts = {k: {str(kk): int(vv) for kk, vv in v.items()} for k, v in cat_counts.items()}

# ─── Reference loan (UPB-weighted means / modes from training period) ──
print("[ref] reference loan ...")
train = df[df["period"] < 202407]
def wmean(col):
    w = train["upb_w"].values
    v = train[col].astype(float).values
    mask = ~np.isnan(v) & ~np.isnan(w) & (w > 0)
    if not mask.any():
        return float(np.nanmean(v))
    return float(np.average(v[mask], weights=w[mask]))

reference_loan = {
    "loan_age_months":       round(wmean("loan_age_months"), 1),
    "refi_incentive_bps":    round(wmean("refi_incentive_bps"), 1),
    "prepay_penalty_points": round(wmean("prepay_penalty_points"), 2),
    "sato_bps":              round(wmean("sato_bps"), 1),
    "upb":                   round(float(train["upb"].astype(float).mean()), 0),
    "months_to_maturity":    round(float(np.nanmean(np.clip(months_diff(
        to_yyyymm_arr(train["loan_maturity_date"]),
        to_yyyymm_arr(train["period"])), 0, 600))), 1),
    "months_post_lockout":   round(wmean("loan_age_months"), 1),  # rough proxy; refined below
    "fha_category":          str(train["fha_category"].mode().iloc[0]),
    "loan_purpose":          str(train["loan_purpose"].mode().iloc[0]),
    "affordable_status":     str(train["affordable_status"].fillna("MKT").mode().iloc[0] or "MKT"),
    "in_lockout":            0,
    "in_prepay_penalty":     int(train["in_prepay_penalty"].mean() > 0.5),
    # Pool-type feeds the live modification/non-level/small-balance
    # signal; the legacy *_ind columns are blank in modern data but
    # kept for input-row backwards compatibility.
    "pool_type":             str(train["pool_type"].mode().iloc[0]),
    "modified_ind":          "N",
    "non_level_ind":         "N",
    "mature_loan_flag":      "N",
}

# Better mpl from data
mpl_train_raw = months_diff(to_yyyymm_arr(train["period"]),
                            to_yyyymm_arr(train["lockout_end_date"]))
mpl_train = np.clip(mpl_train_raw, 0, 60)
reference_loan["months_post_lockout"] = round(float(np.nanmean(mpl_train)), 1)

# ─── Self-test fixture: 10 loans from python_predictions.csv ─────────
# We pass through every column predict_one() consults — including the
# pre-computed overrides (sato_bps, prepay_penalty_points, refi_incentive_bps,
# loan_age_months, vintage_year, plc_rate_bps) — so the JS port reproduces
# the exact CSV output. This isolates the JS logic from the unrelated
# question of whether derivation matches the panel's pre-computed values.
print("[fixture] self-test fixture ...")
ppred = pd.read_csv(f"{ROOT}/model/python_predictions.csv")
fixture_cols_in = [
    "deal_id", "period", "loan_rate", "upb", "origination_date",
    "loan_maturity_date", "lockout_end_date", "prepay_end_date",
    "prepay_premium_period_yrs", "fha_program_code", "affordable_status",
    "pool_type", "modified_ind", "non_level_ind", "mature_loan_flag",
    # overrides that take precedence in predict_python
    "loan_age_months", "vintage_year", "sato_bps",
    "prepay_penalty_points", "plc_rate_bps", "refi_incentive_bps",
    "fha_category", "loan_purpose",
]
fixture_cols_in = [c for c in fixture_cols_in if c in ppred.columns]
fixture_rows = []
for _, r in ppred.head(10).iterrows():
    rec = {c: (None if pd.isna(r[c]) else (r[c].item() if hasattr(r[c], "item") else r[c])) for c in fixture_cols_in}
    rec["expected_predicted_CPR_pct"] = round(float(r["predicted_CPR_pct"]), 4)
    rec["expected_total_logodds"]     = round(float(r["total_logodds"]), 6)
    fixture_rows.append(rec)

# ─── Sample loans for the projector (50 demo loans) ──────────────────
print("[sample] projector seed loans ...")
proj_cols = [
    "deal_id", "period", "loan_rate", "upb", "origination_date",
    "loan_maturity_date", "lockout_end_date", "prepay_end_date",
    "prepay_premium_period_yrs", "fha_program_code", "affordable_status",
    "pool_type", "modified_ind", "non_level_ind", "mature_loan_flag",
]
proj_cols = [c for c in proj_cols if c in SAMPLE.columns]
seed = SAMPLE[proj_cols].head(8).copy()
seed_rows = []
for _, r in seed.iterrows():
    rec = {}
    for c in proj_cols:
        v = r[c]
        if pd.isna(v):
            v = None
        elif hasattr(v, "item"):
            v = v.item()
        rec[c] = v
    seed_rows.append(rec)

# ─── Lookups ────────────────────────────────────────────────────────
print("[lookup] PLC + vintage + calibration + segments ...")
plc = {int(p): float(r) for p, r in zip(PLC_HIST["period"], PLC_HIST["plc_rate_bps"])}
vintage = {int(y): float(r) for y, r in zip(VINTAGE["vintage_year"], VINTAGE["median_rate"])}

calib = []
for _, r in CALIB.iterrows():
    calib.append({k: (float(r[k]) if k != "decile" else int(r[k])) for k in CALIB.columns})

segs = []
for _, r in SEGS.iterrows():
    segs.append({
        "segment_field": str(r["segment_field"]),
        "segment_value": str(r["segment_value"]) if not pd.isna(r["segment_value"]) else "",
        "n":             int(r["n"]),
        "upb_mn":        float(r["upb_mn"]),
        "pred_cpr":      float(r["pred_cpr"]),
        "actual_cpr":    float(r["actual_cpr"]),
    })

# ─── Coefficients dict ──────────────────────────────────────────────
coef_dict = {k: float(v) for k, v in COEFS.items()}

# ─── Final bundle ───────────────────────────────────────────────────
bundle = {
    "meta":        META,
    "coefficients": coef_dict,
    "calibration": calib,
    "segments":    segs,
    "monthlyOverall": monthly_overall,
    "monthlyByCat":   monthly_by_cat,
    "outliers":    outliers,
    "featureDist": dist,
    "catCounts":   cat_counts,
    "referenceLoan": reference_loan,
    "plcHistory":  plc,
    "vintageMedians": vintage,
    "sampleLoans": seed_rows,
    "selfTestFixture": fixture_rows,
}

out_path = "/tmp/webapp_data.json"
with open(out_path, "w") as f:
    json.dump(bundle, f, separators=(",", ":"))
print(f"[done] wrote {out_path}  ({os.path.getsize(out_path)/1024:.1f} KB)")
print(f"  monthly rows: {len(monthly_overall)}")
print(f"  outliers: {sum(len(v) for v in outliers.values())}")
print(f"  fixture: {len(fixture_rows)}")

# ─── Inject into webapp/PrepayExplorer.jsx ──────────────────────────
jsx_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "PrepayExplorer.jsx")
if not os.path.exists(jsx_path):
    print(f"[skip] {jsx_path} not present — JSON-only output.")
    sys.exit(0)

with open(jsx_path) as f:
    jsx = f.read()

data_str = json.dumps(bundle, separators=(",", ":"))
# Match either the placeholder (first run) or the previous inlined literal (re-run).
new_jsx, n = re.subn(
    r"const\s+MODEL_DATA\s*=\s*(?:__MODEL_DATA__|\{.*?\});",
    f"const MODEL_DATA = {data_str};",
    jsx,
    count=1,
    flags=re.DOTALL,
)
if n != 1:
    print("[error] could not locate MODEL_DATA literal in PrepayExplorer.jsx")
    sys.exit(1)

with open(jsx_path, "w") as f:
    f.write(new_jsx)
print(f"[inject] updated {jsx_path}  ({os.path.getsize(jsx_path)/1024:.1f} KB)")
