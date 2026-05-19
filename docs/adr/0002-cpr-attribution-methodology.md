# ADR-0002: CPR Attribution Methodology (workbook)

Date: 2026-05-19
Status: Draft

## Context

The workbook's `Deal_Comparison` tab presents per-driver CPR
attribution for the headline `Weighted predicted CPR (%)` (row 4). The
current implementation, baked into `Loan_Input` formulas (cols BX:CJ)
and aggregated in `Deal_Summary` (cols O:AA), is:

1. **Per-loan leave-one-out (LOO)** marginal CPR for each of the 13
   log-odds components:

       CPR_attr_C = predicted_CPR − CPR(total_logodds − C_logodds)

   gated to 0 when `in_lockout = 1`.

2. **UPB-weighted** across loans in the deal:
   `wtd_attr_C = Σ(CPR_attr_C,ᵢ · UPBᵢ) / Σ(UPBᵢ)`.

3. Surfaced as `CPR attr: …` rows 15:27 on `Deal_Comparison`, with a
   constant intercept-only `Weighted baseline CPR (%)` on row 5.

See `CONTEXT.md` § "CPR Attribution Methodology" for the full
vocabulary (13 components, the residual ε, the row-27 label drift).

### What's broken / unclear

- **The attribution rows do not sum to the predicted CPR.** Because
  SMM is produced by a sigmoid and CPR by a non-linear survival
  transform, the LOO deltas don't partition the total. The honest
  identity is:

      predicted CPR  =  baseline CPR  +  Σ(CPR attr 15:27)  +  ε

  Demo-data tie-out residuals (shipped `model/python_predictions.csv`,
  UPB-weighted to each deal — the **"before" state** we'd want to
  improve):

  | Deal               | predicted | baseline | Σ(13 attr) | base + Σ |    ε     |
  |--------------------|----------:|---------:|-----------:|---------:|---------:|
  | GNR_2024_NEW       |     6.529 |    1.645 |      4.922 |    6.567 |  −0.038  |
  | GNR_2014_SEASONED  |     7.612 |    1.645 |      4.261 |    5.906 |  +1.706  |
  | GNR_HC_2020        |     4.703 |    1.645 |     −2.294 |   −0.649 |  +5.352  |
  | GNR_AFF_2018       |     3.389 |    1.645 |     −2.188 |   −0.543 |  +3.932  |
  | GNR_DIVERSE        |     5.356 |    1.645 |     −1.960 |   −0.315 |  +5.671  |
  | GNR_USDA_538       |     2.770 |    1.645 |     −1.196 |    0.450 |  +2.320  |

  Note GNR_HC_2020: `Σ(attr)` is **negative** while the deal is well
  above baseline. The raw LOO sum disagrees with the predicted CPR on
  sign, not just magnitude — so a naive multiplicative renormalization
  would flip every component's sign.

- **Row 27 is mislabeled.** `Deal_Comparison!A27` says "CPR attr: MOD"
  but pulls `Loan_Input!CJ` = `CPR_attr_POOL`. The shipped model has a
  POOL component, not a modified/non-level/mature one.

- **Baseline is not lockout-gated.** A locked loan has predicted CPR 0
  but baseline 1.645, contributing a small additional component to ε
  on deals with locked loans.

## Decision

Document the current methodology and the improvement directions under
consideration. **No methodology change is being committed in this
ADR** — this is a stub to capture the design space so a follow-up can
pick a direction.

## Improvement directions under consideration

1. **Difference-waterfall.** Decompose the *difference* between two
   deals directly (the question the `Deal_Comparison` tab actually
   exists to answer), walking from one deal's profile to the other one
   feature group at a time. Each step's ΔCPR is that driver's
   contribution to the gap; the steps sum exactly to row 4's
   `Difference` column. Reframes attribution around what the tab is
   for, instead of around each deal's vs-intercept level.

2. **Sequential build-up vs Shapley.** Replace per-deal LOO with an
   exact-additive scheme: either a **sequential build-up** (start at
   baseline, add components one at a time; telescopes to
   `predicted − baseline` exactly; order-dependent), or **Shapley
   values** (average marginal contributions over all orderings;
   order-free; 2¹³ = 8,192 coalition evaluations, tractable in Python
   but not in Excel formulas). The build-up keeps every bar as a real
   CPR increment with no rescaling; Shapley adds rigor at the cost of
   moving the computation to the Python engine.

3. **On-screen reconciliation.** Whatever attribution scheme is used,
   surface a `baseline → +drivers → predicted` check block on the tab
   so the tie (or the residual ε line) is visible, instead of
   implied. Even with today's raw LOO, this would make the gap
   honest. Cheap clarity wins to bundle: fix the row-27 label,
   lockout-gate `baseline_CPR_pct`, rename "CPR attr:" →
   "CPR contribution (pp)", sort rows by magnitude, and consider
   collapsing the 13 components into ~5 buckets (refi, seasoning,
   call protection, collateral, program).

## Relationship to ADR-0001

[ADR-0001](0001-driver-attribution-normalization.md) addresses the
same nonlinear-additivity problem for the **Python lifetime CPR
engine** (`model/lifetime_engine/driver_attribution.py`). Its decision
— apply a single multiplicative normalization factor so the LOO
deltas sum exactly to `headline − baseline` — is a fourth candidate
direction for the workbook. The workbook does **not** currently apply
this normalization.

How the two ADRs should relate is **TBD**:

- Should the workbook adopt the ADR-0001 normalization to stay aligned
  with the Python engine? Risk: the sign-flip pathology visible in
  GNR_HC_2020 above is more pronounced at the workbook's
  single-period level than at the lifetime engine's multi-month
  aggregation.
- Or should both implementations move to one of the alternatives above
  (difference-waterfall / build-up / Shapley) and ADR-0001 be
  superseded?
- Or are the two contexts different enough that they justifiably use
  different schemes?

Defer until the workbook direction is chosen.

## Consequences

- The current LOO + UPB-weighting methodology is documented as the
  baseline against which alternatives will be evaluated.
- The "before" residuals above pin the magnitude of the gap on the
  shipped demo data; any replacement methodology can be evaluated
  against the same six deals.
- No code or workbook change is implied by this ADR. Picking a
  direction is a follow-up.
