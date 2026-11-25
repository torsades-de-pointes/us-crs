/* US-CRS 2.0 model — single source of truth for desktop (index.html) and mobile (mobile.html).
   Lyden GR, et al. JAMA 2026;336(18):1621-1629. doi:10.1001/jama.2026.17403
   Coefficients: eTable 15. Trimming: eTable 3. Imputation: eTable 2. Score mapping: eTable 16. */
(function (g) {
  'use strict';
  const COEF = {b0: 7.45, alb: -0.837, lbili: 0.911, egfr: -0.00862, lnp: 0.178, nt: -1.449, lnpXnt: 0.139, na: -0.07954, lvad: -0.43, iabp: 0.757, mfp: 0.75, amcs: 1.676};
  const TRIM = {alb: [2.5, 5.1], bili: [0.2, 2.8], egfr: [5.38, 129.95], na: [129, 145], bnp: [14, 3845], nt: [41, 34163]};
  const IMPUTE = {alb: 4.1, bili: 0.6, cr: 1.2, na: 138, bnp: 237, nt: 912};
  const LP_MIN = -9.441660, LP_50 = -3.545692, W = (LP_50 - LP_MIN) / 48;
  const TIERS = [
    {t: 1, lo: 50, hi: 50, name: 'Tier 1', col: '--t1'},
    {t: 2, lo: 45, hi: 49, name: 'Tier 2', col: '--t2'},
    {t: 3, lo: 40, hi: 44, name: 'Tier 3', col: '--t3'},
    {t: 4, lo: 30, hi: 39, name: 'Tier 4', col: '--t4'},
    {t: 5, lo: 20, hi: 29, name: 'Tier 5', col: '--t5'},
    {t: 6, lo: 1, hi: 19, name: 'Tier 6', col: '--t6'}];
  const REF = {alb: 4.1, bili: 0.6, egfr: 67.4, na: 138, np: 912, isNT: true}; // typical candidate for contribution bars
  const NODEV = {lvad: false, iabp: false, mfp: false, amcs: false};

  const clamp = (x, r) => Math.min(r[1], Math.max(r[0], x));
  function ckdEpi2021(cr, age, female) {
    const k = female ? 0.7 : 0.9, a = female ? -0.241 : -0.302;
    return 142 * Math.pow(Math.min(cr / k, 1), a) * Math.pow(Math.max(cr / k, 1), -1.2) * Math.pow(0.9938, age) * (female ? 1.012 : 1);
  }
  function toScore(lp) {
    if (lp > LP_50) return 50;
    if (lp <= LP_MIN) return 1;
    return Math.min(49, Math.max(2, Math.ceil((lp - LP_MIN) / W) + 1));
  }
  const tierOf = s => TIERS.find(t => s >= t.lo && s <= t.hi);
  const mort6 = lp => { const h = 1 / (1 + Math.exp(-lp)); return 1 - Math.pow(1 - h, 6); };
  function linpred(x, dev) {
    dev = dev || NODEV;
    const lnp = Math.log(x.np + 1), NT = x.isNT ? 1 : 0;
    return COEF.b0 + COEF.alb * x.alb + COEF.lbili * Math.log(x.bili + 1) + COEF.egfr * x.egfr
      + COEF.lnp * lnp + COEF.nt * NT + COEF.lnpXnt * lnp * NT + COEF.na * x.na
      + COEF.lvad * (dev.lvad ? 1 : 0) + COEF.iabp * (dev.iabp ? 1 : 0) + COEF.mfp * (dev.mfp ? 1 : 0) + COEF.amcs * (dev.amcs ? 1 : 0);
  }

  /* raw: {alb, bili, na, np (null = missing), isNT, kid:'cr'|'egfr', egfr, cr, age, female}
     returns {x (as scored), flags[], hints{alb,bili,na,np,egfr}} */
  function prepare(raw) {
    const flags = [], hints = {};
    const one = (v, key, label, unit, hk) => {
      if (v === null || v === undefined) { v = IMPUTE[key]; flags.push(label + ' missing: national median ' + v + ' ' + unit + ' used'); hints[hk] = 'Missing: imputed ' + v; return v; }
      const c = clamp(v, TRIM[key]);
      if (c !== v) { flags.push(label + ' ' + v + ' outside model range: scored as ' + c); hints[hk] = 'Scored as ' + c + ' (model cap)'; }
      return c;
    };
    const alb = one(raw.alb, 'alb', 'Albumin', 'g/dL', 'alb');
    const bili = one(raw.bili, 'bili', 'Bilirubin', 'mg/dL', 'bili');
    const na = one(raw.na, 'na', 'Sodium', 'mEq/L', 'na');
    const np = one(raw.np, raw.isNT ? 'nt' : 'bnp', raw.isNT ? 'NT-proBNP' : 'BNP', 'pg/mL', 'np');
    let egfr, note = '';
    if (raw.kid === 'egfr') {
      if (raw.egfr === null || raw.egfr === undefined) { egfr = ckdEpi2021(IMPUTE.cr, 55, false); flags.push('eGFR missing: imputed from creatinine 1.2 (age 55, male)'); note = 'Missing: imputed ' + egfr.toFixed(0); }
      else egfr = raw.egfr;
    } else {
      let cr = raw.cr; const age = raw.age == null ? 55 : raw.age;
      if (raw.age == null) note = 'Age not entered: 55 assumed. ';
      if (cr == null) { cr = IMPUTE.cr; flags.push('Creatinine missing: 1.2 mg/dL used'); note += 'Creatinine missing: 1.2 used. '; }
      egfr = ckdEpi2021(cr, age, !!raw.female);
      note += 'eGFR ' + egfr.toFixed(0) + ' mL/min/1.73 m²';
    }
    const ec = clamp(egfr, TRIM.egfr);
    if (Math.abs(ec - egfr) > 1e-9) { flags.push('eGFR ' + egfr.toFixed(0) + ' outside model range: scored as ' + ec.toFixed(1)); note += ' (scored as ' + ec.toFixed(1) + ')'; }
    hints.egfr = note;
    return {x: {alb, bili, na, np, egfr: ec, isNT: !!raw.isNT}, flags, hints};
  }

  function evaluate(x, dev) {
    const lp = linpred(x, dev), s = toScore(lp), lpLab = linpred(x, NODEV), sLab = toScore(lpLab);
    return {lp, s, t: tierOf(s), m: mort6(lp), sLab, tLab: tierOf(sLab)};
  }

  function contributions(x, dev) {
    const lnp = v => Math.log(v + 1);
    const npTerm = (v, nt) => COEF.lnp * lnp(v) + (nt ? COEF.nt + COEF.lnpXnt * lnp(v) : 0);
    return [
      ['Albumin', COEF.alb * (x.alb - REF.alb)],
      ['Bilirubin', COEF.lbili * (lnp(x.bili) - lnp(REF.bili))],
      ['eGFR', COEF.egfr * (x.egfr - REF.egfr)],
      ['Sodium', COEF.na * (x.na - REF.na)],
      [x.isNT ? 'NT-proBNP' : 'BNP', npTerm(x.np, x.isNT) - npTerm(REF.np, true)],
      ['Durable LVAD', COEF.lvad * (dev.lvad ? 1 : 0)],
      ['Advanced MCS', COEF.amcs * (dev.amcs ? 1 : 0)],
      ['IABP', COEF.iabp * (dev.iabp ? 1 : 0)],
      ['Microaxial pump', COEF.mfp * (dev.mfp ? 1 : 0)]].map(r => [r[0], r[1] / W]);
  }

  function whatIf(x, dev) {
    const base = toScore(linpred(x, dev));
    return [['Remove all devices', NODEV],
      [dev.iabp ? 'Without IABP' : 'Add IABP', Object.assign({}, dev, {iabp: !dev.iabp})],
      [dev.mfp ? 'Without microaxial pump' : 'Add microaxial pump', Object.assign({}, dev, {mfp: !dev.mfp})],
      [dev.amcs ? 'Without advanced MCS' : 'Add advanced MCS (ECMO)', Object.assign({}, dev, {amcs: !dev.amcs})],
      [dev.lvad ? 'Without durable LVAD' : 'With durable LVAD', Object.assign({}, dev, {lvad: !dev.lvad})]]
      .map(([k, d]) => { const s = toScore(linpred(x, d)); return {label: k, s, t: tierOf(s), d: s - base}; });
  }

  /* discordance between current OPTN status and score tier */
  function discordance(status, exc, t) {
    if (!status) return null;
    const d = Number(status) - t.t;
    if (d >= 2) return {cls: 'alert', html: '<b>Score more urgent than status.</b> Status ' + status + ' today, but the score falls in ' + t.name + '. Consider whether urgency is under-recognized.'};
    if (d <= -2) return {cls: 'alert', html: '<b>Status more urgent than score.</b> Status ' + status + (exc ? ' by exception' : '') + ' today, but the score falls in ' + t.name + '. Under a score-based system this candidate would rank lower.'};
    return {cls: '', html: 'Current status ' + status + ' and score ' + t.name + ' are broadly concordant.'};
  }

  function summary(o) { // o: {x, dev, ev, flags, status, exc, zip, sdohCount}
    const dev = [['durable LVAD', o.dev.lvad], ['advanced MCS', o.dev.amcs], ['IABP', o.dev.iabp], ['microaxial pump', o.dev.mfp]].filter(e => e[1]).map(e => e[0]).join(', ') || 'none';
    const L = [
      'US-CRS 2.0 score ' + o.ev.s + '/50 (6-Status US-CRS ' + o.ev.t.name + '); est. 6-week mortality without transplant ' + (o.ev.m * 100).toFixed(1) + '%; lab-only score ' + o.ev.sLab + '.',
      'Inputs as scored: albumin ' + o.x.alb + ' g/dL, bilirubin ' + o.x.bili + ' mg/dL, eGFR ' + o.x.egfr.toFixed(0) + ', sodium ' + o.x.na + ', ' + (o.x.isNT ? 'NT-proBNP' : 'BNP') + ' ' + o.x.np + ' pg/mL. Devices: ' + dev + '.'];
    if (o.status) L.push('Current OPTN status ' + o.status + (o.exc ? ' (exception)' : '') + '.');
    if (o.flags.length) L.push('Flags: ' + o.flags.join('; ') + '.');
    if (o.sdohCount || o.zip) L.push('Social context (not scored): ZIP ' + (o.zip || 'n/a') + '; adverse SDOH ' + o.sdohCount + '/9.');
    L.push('Source: Lyden et al., JAMA 2026;336:1621. Research/education tool; not current OPTN policy.');
    return L.join('\n');
  }

  const EXAMPLES = {
    1: {title: 'Late rural transfer on milrinone', alb: 3.3, bili: 1.6, na: 131, np: 2900, isNT: true, kid: 'egfr', egfr: 45, dev: {}, status: '3', exc: false},
    2: {title: 'IABP, near-normal labs', alb: 4.1, bili: 0.6, na: 138, np: 1800, isNT: true, kid: 'egfr', egfr: 85, dev: {iabp: true}, status: '2', exc: false},
    3: {title: 'Stable HeartMate 3', alb: 4.2, bili: 0.7, na: 138, np: 900, isNT: true, kid: 'egfr', egfr: 72, dev: {lvad: true}, status: '4', exc: false},
    4: {title: 'VA-ECMO, BNP missing', alb: 2.9, bili: 2.4, na: 130, np: null, isNT: false, kid: 'egfr', egfr: 38, dev: {amcs: true}, status: '1', exc: false}};

  const SDOH = [['food', 'Food insecurity'], ['housing', 'Housing instability'], ['transport', 'Transportation barrier'], ['caregiver', 'No reliable caregiver'], ['insurance', 'Medicaid or uninsured'], ['rural', 'Rural residence'], ['literacy', 'Limited health literacy'], ['financial', 'Financial strain'], ['employment', 'Unemployed or unable to work']];

  g.USCRS = {COEF, TRIM, IMPUTE, TIERS, REF, NODEV, W, ckdEpi2021, toScore, tierOf, mort6, linpred, prepare, evaluate, contributions, whatIf, discordance, summary, EXAMPLES, SDOH, VERSION: '1.1'};
})(typeof window !== 'undefined' ? window : globalThis);
