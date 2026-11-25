# US-CRS 2.0 · Heart Allocation Urgency Calculator

**A web and mobile calculator for the US Candidate Risk Score 2.0, the proposed 50-point medical urgency score for adult heart transplant candidates.**
No installation. Works in any browser, on any device, offline. Also installs as an app.

![License: MIT](https://img.shields.io/badge/License-MIT-a8465c) ![Research and education](https://img.shields.io/badge/Use-Research%20%26%20education-5f5449) ![Inputs](https://img.shields.io/badge/Inputs-5%20labs%20%2B%204%20devices-2f7a5c) ![FOAMed](https://img.shields.io/badge/FOAMed-Free%20for%20all-a9761b) ![Works offline](https://img.shields.io/badge/Works-Offline-41608f)

---

### ▶ [Launch the calculator](https://torsades-de-pointes.github.io/us-crs/)

| Version | Link | Best for |
|---|---|---|
| Desktop | [torsades-de-pointes.github.io/us-crs/?desktop](https://torsades-de-pointes.github.io/us-crs/?desktop) | Laptop, desktop, tablet, listing committee screens |
| Mobile | [torsades-de-pointes.github.io/us-crs/mobile.html](https://torsades-de-pointes.github.io/us-crs/mobile.html) | Phones, at the bedside or on call |

The main link opens the right version for the device. Phones go to the mobile version automatically.

---

**Install it as an app**

_iPhone (use Safari, not Chrome, for installation to work):_
- Open https://torsades-de-pointes.github.io/us-crs/ in Safari
- Tap the Share icon (square with arrow) → Add to Home Screen → Add
- The home-screen icon is an ivory tile with a coloured gauge, labelled "US-CRS 2.0"
- Open it from the home screen: it runs full screen with no address bar
- To check offline use: turn on Airplane Mode, close the app fully, reopen it

_Android (Chrome):_
- Open https://torsades-de-pointes.github.io/us-crs/ in Chrome
- Accept the "Install app" prompt, or tap ⋮ → Install app (or Add to Home screen)
- Open it from the home screen and repeat the Airplane Mode check

> **Not current policy.** US-CRS 2.0 is a proposed score. It is not part of OPTN heart allocation policy and does not set a candidate's status. Use this calculator for teaching, research and discussion only.

---

## Two builds

| File | For | Layout |
|---|---|---|
| `index.html` | Desktop and tablet | Inputs on the left, live result on the right; Calculator, Method and About pages; Day and Night themes |
| `mobile.html` | Phones | Live score pinned at the top; inputs as simple rows with switches; bottom tab bar (Inputs, Results, Info); Day and Night themes |

Each build links to the other ("Mobile version" in the desktop top bar, "Open desktop version" in the mobile Info tab), and the choice is remembered on that device. Adding `?desktop` or `?mobile` to the address forces one.

## What it gives you

| Output | What it means |
|---|---|
| **Score (1–50)** | The US-CRS 2.0 score, from the published model |
| **Tier** | The 6-Status US-CRS tier used in the paper's match-run analysis (1 = 50; 2 = 45–49; 3 = 40–44; 4 = 30–39; 5 = 20–29; 6 = 1–19) |
| **6-week risk** | Approximate risk of death or delisting for deterioration within 6 weeks without transplant |
| **Lab-only score** | The same patient with all devices removed, to separate physiology from device points |
| **What drives the score** | Points added or removed by each input, compared with a typical candidate |
| **Device what-if** | The score if one device were added or removed |
| **Status comparison** | Flags when the current OPTN status and the score tier disagree by two or more levels |
| **Flags** | Every value that was capped at the model's limits or filled in because it was missing |
| **Copy summary** | A short text summary to paste into a note (no identifiers) |

Four teaching cases from the UAB AHFTC journal club load with one tap. Everything runs in the browser. Nothing is saved or sent anywhere; do not enter names, MRNs or dates of birth.

## Quick start

1. Enter the most recent **albumin, bilirubin, sodium** and **BNP or NT-proBNP** (choose which one).
2. For kidney function, enter **creatinine with age and sex** (race-free CKD-EPI 2021) or enter **eGFR** directly.
3. Switch on any **devices**: durable LVAD or advanced MCS (VA-ECMO or temporary surgical VAD) at any time since listing; IABP or microaxial flow pump (Impella) if currently in place.
4. Optionally pick the candidate's **current OPTN status** to see whether it agrees with the score.
5. Read the score, the tier and the flags. Leave a lab blank if it is not available; the national median is used and flagged, as in the paper.

The **Social context** panel (ZIP code, drive time, nine adverse social factors) is marked *beta, not scored*. It does not change the result. It is there for the next version.

## The model

US-CRS 2.0 is a weighted pooled logistic model of death or delisting for deterioration within 6 weeks, fitted as a marginal structural model so that it estimates risk as if transplant were not available.

```
LP = 7.45 − 0.837·albumin + 0.911·ln(bilirubin+1) − 0.00862·eGFR
     + 0.178·ln(NP+1) − 1.449·NT + 0.139·ln(NP+1)·NT − 0.07954·sodium
     − 0.43·LVAD + 0.757·IABP + 0.75·MFP + 1.676·aMCS
```

- NP is the BNP or NT-proBNP value; NT = 1 when it is NT-proBNP.
- Score: LP above −3.545692 is 50; LP at or below −9.441660 is 1; equal bins of 0.1228327 in between.
- 6-week risk ≈ 1 − (1 − h)<sup>6</sup>, where h = 1 / (1 + e<sup>−LP</sup>).

| Variable | Scored range | Used if missing |
|---|---|---|
| Albumin (g/dL) | 2.5 – 5.1 | 4.1 |
| Bilirubin (mg/dL) | 0.2 – 2.8 | 0.6 |
| eGFR (mL/min/1.73 m²) | 5.38 – 129.95 | from creatinine 1.2 |
| Sodium (mEq/L) | 129 – 145 | 138 |
| BNP (pg/mL) | 14 – 3,845 | 237 |
| NT-proBNP (pg/mL) | 41 – 34,163 | 912 |

Coefficients, caps, missing-value rules and score bins are taken directly from the paper's supplement (eTables 2, 3, 15 and 16). In the paper's test data, the score's mean time-dependent AUC was 0.807, against 0.693 for the current 6-status system.

### Validation cases

Both builds give the results below, which match an independent Python implementation of the published coefficients.

| Case | Inputs | LP | Score | Tier |
|---|---|---|---|---|
| 1 | Albumin 3.3, bilirubin 1.6, eGFR 45, NT-proBNP 2,900, sodium 131, no device | −4.171 | 44 | 3 |
| 2 | Albumin 4.1, bilirubin 0.6, eGFR 85, NT-proBNP 1,800, sodium 138, IABP | −5.578 | 33 | 4 |
| 3 | Albumin 4.2, bilirubin 0.7, eGFR 72, NT-proBNP 900, sodium 138, durable LVAD | −6.901 | 22 | 5 |
| 4 | Albumin 2.9, bilirubin 2.4, eGFR 38, BNP missing (237 used), sodium 130, advanced MCS | −1.880 | 50 | 1 |

### Model limits

- No haemodynamics, diagnosis, age or sex in the score. Restrictive, infiltrative and congenital heart disease are scored on the same five labs.
- The caps flatten the top of the scale: bilirubin above 2.8 mg/dL or sodium below 129 mEq/L add nothing more.
- The paper reports that the model over-estimates absolute risk in the sickest candidates. Read 6-week estimates above about 20% as relative.
- NT-proBNP runs lower with obesity and in Black adults, which can lower the score for some patients.
- Device points depend on access to devices. The score has not been validated across social-risk groups.
- The score measures urgency only. It says nothing about expected benefit after transplant.

---

## How to cite

Please cite both the original score and this calculator.

**The score**

```
Lyden GR, White M, Ahn DJ, Menteer J, Daly RC, Narang N, Khush KK, Jasseron C, Dorent R,
Masotti M, Wood NL, Colvin MM, Gentry SE, Parker WF. Development and validation of an adult
medical urgency score for US donor heart allocation. JAMA. 2026;336(18):1621-1629.
doi:10.1001/jama.2026.17403
```

**This calculator**

```
Parcha V. US-CRS 2.0 Calculator: a web and mobile calculator for the US Candidate Risk Score 2.0
for adult heart transplant candidates [software]. Version 1.2. 2026.
Available at: https://torsades-de-pointes.github.io/us-crs/
```

BibTeX:

```bibtex
@software{parcha_uscrs_calculator_2026,
  title   = {US-CRS 2.0 Calculator: a web and mobile calculator for the US Candidate Risk Score 2.0},
  author  = {Parcha, Vibhu},
  year    = {2026},
  version = {1.2},
  url     = {https://torsades-de-pointes.github.io/us-crs/},
  note    = {Implements the model of Lyden et al., JAMA 2026;336(18):1621-1629}
}

@article{lyden_uscrs2_2026,
  title   = {Development and Validation of an Adult Medical Urgency Score for US Donor Heart Allocation},
  author  = {Lyden, Grace R. and White, Molly and Ahn, Daniel J. and Menteer, JonDavid and Daly, Richard C.
             and Narang, Nikhil and Khush, Kiran K. and Jasseron, Carine and Dorent, Richard and Masotti, Maria
             and Wood, Nicholas L. and Colvin, Monica M. and Gentry, Sommer E. and Parker, William F.},
  journal = {JAMA},
  year    = {2026},
  volume  = {336},
  number  = {18},
  pages   = {1621--1629},
  doi     = {10.1001/jama.2026.17403}
}
```

---

## Files

```
index.html               desktop build
mobile.html              phone build
model.js                 shared model: coefficients, caps, missing values, score bins, tiers, examples
manifest.json            app name, icons, colours
sw.js                    offline cache
icon-192.png             app icon
icon-512.png             app icon
icon-maskable-512.png    Android adaptive icon
apple-touch-icon-180.png iPhone home-screen icon
LICENSE                  MIT, with attribution to the source publication
```

Both builds load the same `model.js`, so the formula lives in one place. There is no build step, no backend, no account and no analytics.

## Updating

Edit the files, then open `sw.js` and bump `CACHE` (for example `uscrs-v3` to `uscrs-v4`) before you push. Installed copies pick up the new version the next time they open online. Keep all files at the top level of the repository; the app expects the icons next to `index.html`.

## Roadmap

| Version | Planned |
|---|---|
| 2.0 | Area-level social context from ZIP code (Area Deprivation Index, Social Vulnerability Index, rurality) shown beside the score; adverse social factor count, for research on whether social risk changes how well the score works |
| 3.0 | Serial scores over time, aligned to status-form dates |

---

## ⚠️ Disclaimer

This calculator is for **research and education only**.

- **Do not** use it to assign or justify OPTN status
- **Do not** use it as the only basis for clinical decisions
- **Do** use it for teaching, journal clubs, listing-committee discussion and research
- **Do** check every input against the source record

---

## Feedback and contact

Errors, suggestions and ideas for the next version are welcome.

- Email: vibhuparcha@gmail.com
- GitHub Issues: open an issue

---

## Acknowledgements

| Source | Contribution |
|---|---|
| Lyden, Parker and colleagues (SRTR, University of Chicago, OPTN Heart Committee) | The US-CRS 2.0 model and its published supplement; code at [github.com/mollywhite19/US-CRS-2.0](https://github.com/mollywhite19/US-CRS-2.0) |
| Zhang, Parker and colleagues | US-CRS 1.0 (*JAMA* 2024;331:500) |
| UAB Advanced Heart Failure & Transplant Cardiology | Journal club teaching cases and clinical review |

---

## Changelog

| Version | Changes |
|---|---|
| **1.2** | Icons moved to the top level so they load on GitHub Pages; offline cache made resilient to a missing file; How to cite added to the app and README |
| 1.1 | Separate desktop and mobile builds with automatic routing; shared `model.js` |
| 1.0 | First release: score, tier, 6-week risk, contributions, device what-ifs, status comparison, teaching cases, Day and Night themes, offline install |

## Licence

MIT. See [LICENSE](LICENSE). Model coefficients and rules are from Lyden et al., *JAMA* 2026; cite the original publication when you use the score.

---

[torsades-de-pointes.github.io/us-crs](https://torsades-de-pointes.github.io/us-crs/) · Research and education only · MIT License · 2026
