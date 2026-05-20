# CONTEXT.md

Project glossary and shared vocabulary for the GNPL Prepayment Model.

## CPR Attribution Methodology

The workbook predicts a loan-level annualized CPR from a logistic
regression on monthly SMM, then aggregates loans up to the deal level
and presents per-driver attribution on `Deal_Comparison`. The
vocabulary below names each piece.

**The 13 log-odds components.** Each loan's `total_logodds` is the
sum of the `Parameters!B2` intercept and 13 component contributions
computed in `Loan_Input` columns BF:BR:

- `REFI` — refi-incentive S-curve (penalty-adjusted loan rate vs current PLC)
- `AGE` — seasoning + burnout (piecewise spline on loan age)
- `PEN` — prepay-penalty-point S-curve
- `SATO` — spread at origination (borrower-quality proxy)
- `SIZE` — loan-size effect (UPB in $mn)
- `M2M` — months-to-maturity (balloon refi pull)
- `MPL` — months-post-lockout (pent-up demand)
- `INTERACT` — refi × penalty interaction
- `PHASE` — in-prepay-penalty-window indicator
- `FHA` — FHA program dummies (221d4, 223a7, 232, 538, 241, 220, OTHER vs 223f reference)
- `PURPOSE` — new construction vs refi/purchase reference
- `AFF` — affordable-status dummies (AFF/BAF/MKT vs unknown reference)
- `POOL` — pool-type dummies (LM/PN/LS/RX vs reference)

Each component is a piecewise-linear hinge spline
`f(x) = β_lin·x + Σ β_k·MAX(x − knot_k, 0)`; coefficients live on
`Parameters`.

**Per-loan leave-one-out (LOO) attribution.** For each component `C`,
`CPR_attr_C` (Loan_Input cols BX:CJ) is the marginal CPR the loan
loses if that component's log-odds contribution is zeroed:

    CPR_attr_C = predicted_CPR − CPR(total_logodds − C_logodds)

with `predicted_CPR = 0` (and all `CPR_attr_*` = 0) when
`in_lockout = 1`.

**UPB-weighted deal aggregation.** `Deal_Summary` UPB-weights each
loan-level field across the deal: `wtd_X = Σ(Xᵢ·UPBᵢ)/Σ(UPBᵢ)`.
`Deal_Comparison` rows 15:27 are then VLOOKUPs of the 13
`wtd_attr_*` columns for the two chosen deals.

**Nonlinearity residual ε.** Because SMM is a sigmoid of summed
log-odds and CPR is a non-linear `1 − (1 − SMM)¹²` transform, the LOO
attributions do **not** sum to (predicted − baseline). The true
identity is:

    weighted predicted CPR  =  weighted baseline CPR  +  Σ(CPR attr 15:27)  +  ε

where ε is the nonlinearity / interaction residual. ε varies by deal
and can be a meaningful fraction of the predicted CPR (see ADR-0002
for tie-out residuals on the shipped demo data).

**Baseline CPR.** `baseline_CPR_pct` (Loan_Input col BW) is the
intercept-only annualized CPR — `(1 − (1 − logistic(intercept))¹²)·100`
≈ 1.645%. It is lockout-gated the same way `predicted_SMM` and every
`CPR_attr_*` is — `in_lockout = 1 → 0` — so locked loans contribute
zero to both the weighted baseline and the weighted predicted CPR,
keeping the per-loan reconciliation on `Deal_Comparison` symmetric.

**Row-27 label drift.** `Deal_Comparison!A27` reads "CPR attr: MOD"
("Modified / non-level / mature"), but it pulls `Deal_Summary!AA` =
`wtd_attr_MOD`, which in turn VLOOKUPs `Loan_Input!CJ` =
`CPR_attr_POOL`. The shipped model has a POOL component (pool-type
LM/PN/LS/RX dummies), not a separate modified/non-level/mature
component as the README architecture text suggests. The 13 rows cover
all 13 components; only the last label is stale.
