# US-CRS 2.0 Calculator

A free, open, client-side calculator for the **US Candidate Risk Score 2.0**, the 50-point medical urgency score for adult heart transplant candidates proposed by Lyden et al. (*JAMA* 2026;336:1621–1629, [doi:10.1001/jama.2026.17403](https://doi.org/10.1001/jama.2026.17403)).

Built for transplant coordinators, attendings and fellows in the UAB Advanced Heart Failure & Transplant Cardiology program as a teaching and research aid.

> **Not current policy.** US-CRS 2.0 is a proposed score. It is not part of OPTN heart allocation policy and does not determine a candidate's status. For education and research only.

## What it does

- Computes the US-CRS 2.0 linear predictor, the 1–50 score and the 6-Status US-CRS tier from five labs (albumin, bilirubin, eGFR, BNP or NT-proBNP, sodium) and four devices (durable LVAD, advanced MCS, IABP, microaxial flow pump).
- Calculates eGFR with the race-free CKD-EPI 2021 creatinine equation, or accepts eGFR directly.
- Applies the paper's trimming bounds and median imputation, and flags every capped or imputed value.
- Shows an approximate 6-week mortality without transplant, the lab-only score, points contributed by each input, and device what-ifs.
- Optional comparison with current OPTN status flags discordance (for example, an exception candidate with a low score).
- Social context panel (ZIP, drive time, adverse SDOH checklist) is recorded on screen only and **not scored**; it is the hook for v2.
- Copy-to-clipboard summary for a note. No data is stored or sent anywhere.

## Two versions

| File | For | Layout |
|---|---|---|
| `index.html` | Desktop, laptop, tablet | Two columns: inputs left, live results right; Method and About pages |
| `mobile.html` | Phones | Phone-first: live score strip at top, grouped input lists with switches, bottom tab bar (Inputs, Results, Info) |

Phones (narrow touch screens) that open `index.html` are sent to `mobile.html` automatically. Each version links to the other ("Mobile version" in the desktop top bar; "Open desktop version" in the mobile Info tab), and the choice is remembered on that device. `index.html?desktop` and `mobile.html?mobile` force a version.

Both pages load the same `model.js`, so the formula, caps, imputation, tiers and worked examples live in one place.

## Files

```
index.html          desktop version (no build step)
mobile.html         mobile version (no build step)
model.js            shared US-CRS 2.0 model: coefficients, trimming, imputation, mapping, examples
manifest.json       PWA manifest
sw.js               service worker (offline support)
icons/              app icons (192, 512, maskable 512, Apple 180)
LICENSE             MIT, with attribution to the source publication
```

## Deploy on GitHub Pages

1. Create a repository (for example `torsades-de-pointes/us-crs`) and push these files to the `main` branch root.
2. Settings → Pages → Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)`.
3. The app will be live at `https://torsades-de-pointes.github.io/us-crs/`.

On each update, bump `CACHE` in `sw.js` (currently `uscrs-v2`; next `uscrs-v3`) so installed copies refresh.

## Install on a phone

- **iPhone (Safari):** Share → *Add to Home Screen*.
- **Android (Chrome):** ⋮ menu → *Install app* / *Add to Home screen*.

The installed app works offline.

## Model reference

```
LP = 7.45 − 0.837·albumin + 0.911·ln(bilirubin+1) − 0.00862·eGFR
     + 0.178·ln(NP+1) − 1.449·NT + 0.139·ln(NP+1)·NT − 0.07954·sodium
     − 0.43·LVAD + 0.757·IABP + 0.75·MFP + 1.676·aMCS
```

- NT = 1 when NP is NT-proBNP. LVAD and advanced MCS = any use since listing; IABP and MFP = current use.
- Score: LP > −3.545692 → 50; LP ≤ −9.441660 → 1; otherwise equal-width bins of 0.1228327 (eTable 16).
- Tiers: 1 = 50; 2 = 45–49; 3 = 40–44; 4 = 30–39; 5 = 20–29; 6 = 1–19.
- 6-week mortality ≈ 1 − (1 − h)^6, with h = logistic(LP). The model over-predicts at the highest risk.

## Validation cases

Checked in both versions against an independent Python implementation of the published coefficients:

| Case | Inputs | LP | Score | Tier |
|---|---|---|---|---|
| 1 | Alb 3.3, bili 1.6, eGFR 45, NT-proBNP 2,900, Na 131, no device | −4.171 | 44 | 3 |
| 2 | Alb 4.1, bili 0.6, eGFR 85, NT-proBNP 1,800, Na 138, IABP | −5.578 | 33 | 4 |
| 3 | Alb 4.2, bili 0.7, eGFR 72, NT-proBNP 900, Na 138, durable LVAD | −6.901 | 22 | 5 |
| 4 | Alb 2.9, bili 2.4, eGFR 38, BNP missing (237), Na 130, advanced MCS | −1.880 | 50 | 1 |

## Roadmap

- **v2:** ZIP-linked area context (ADI, SVI, rurality) and an adverse-SDOH count displayed beside the score, for research on effect modification.
- **v3:** serial scores (trajectory) aligned to status-form dates.

## Citation

Lyden GR, White M, Ahn DJ, et al. Development and validation of an adult medical urgency score for US donor heart allocation. *JAMA*. 2026;336(18):1621–1629.

## License

MIT. See `LICENSE`.
