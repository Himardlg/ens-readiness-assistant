/* Lógica pura del assessment (sin DOM) para poder testearla con `node --test`. */
(function (root) {
  "use strict";

  const STATUSES = ["si", "parcial", "no", "no_sabe", "na"];
  const EVIDENCES = ["ninguna", "parcial", "suficiente"];
  const ACTION_STATES = ["pendiente", "en_curso", "hecho"];
  const EFFORTS = ["", "S", "M", "L"];
  const LEVELS = ["bajo", "medio", "alto"];
  const STATUS_POINTS = { si: 1, parcial: 0.5, no: 0, no_sabe: 0 };
  const EVIDENCE_POINTS = { ninguna: 0, parcial: 0.5, suficiente: 1 };
  const PRIORITY_WEIGHT = { alta: 3, media: 2, baja: 1 };
  const PRIORITY_RANK = { alta: 0, media: 1, baja: 2 };
  const CAT_ORDER = { basica: 1, media: 2, alta: 3 };

  const pick = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);
  const str = (v, max) => String(v == null ? "" : v).slice(0, max || 500);
  const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));

  function emptyAction() {
    return { owner: "", date: "", notes: "", status: "pendiente", effort: "" };
  }
  function normalizeAction(a) {
    a = a && typeof a === "object" ? a : {};
    return {
      owner: str(a.owner, 200),
      date: isDate(a.date) ? a.date : "",
      notes: str(a.notes, 2000),
      status: pick(a.status, ACTION_STATES, "pendiente"),
      effort: pick(a.effort, EFFORTS, "")
    };
  }

  /* Categoría preliminar = nivel más alto de las tres dimensiones. */
  function categoryKey(ctx) {
    const vals = [ctx.availability, ctx.confidentiality, ctx.integrity];
    if (vals.includes("alto")) return "alta";
    if (vals.includes("medio")) return "media";
    return "basica";
  }
  const CATEGORY_LABEL = { basica: "Básica (preliminar)", media: "Media (preliminar)", alta: "Alta (preliminar)" };

  /* Avisos de coherencia entre tipos de información e impactos declarados. */
  function categoryWarnings(ctx) {
    const w = [];
    const info = ctx.info || [];
    const key = categoryKey(ctx);
    if (key === "basica" && (info.includes("critica") || info.includes("sensible"))) {
      w.push("Has indicado información sensible o crítica pero los impactos declarados son bajos: revisa la valoración.");
    }
    if (key === "basica" && info.includes("personal")) {
      w.push("Hay datos personales: valora el impacto en confidencialidad (y coordina con RGPD/LOPDGDD).");
    }
    return w;
  }

  const PUBLIC_SECTORS = ["Administración pública", "Educación", "Salud"];
  function applicability(org, ctx) {
    const t = org.type, pc = ctx.publicContract;
    if (t === "aapp" || t === "universidad") {
      return { label: "Probablemente aplica", confidence: "alta", reason: "La organización se ha identificado como parte del sector público. Debe confirmarse el ámbito y alcance concretos." };
    }
    if (pc === "si") {
      return { label: "Probablemente aplica al alcance", confidence: t === "proveedor" ? "alta" : "media", reason: "Se ha indicado una prestación/relación con el sector público. Debe concretarse el sistema y servicio afectado." };
    }
    if (pc === "no_sabe") {
      return { label: "Requiere revisión", confidence: "baja", reason: "No hay información suficiente para concluir aplicabilidad de forma fiable." };
    }
    if ((t === "otro" || t === "privada") && (PUBLIC_SECTORS.includes(org.sector) || str(org.publicRelation).trim())) {
      return { label: "Requiere revisión", confidence: "baja", reason: "Se ha indicado «No», pero el sector o la descripción de la relación con el sector público sugieren revisar si existe algún supuesto de aplicación." };
    }
    return { label: "No identificada en esta evaluación", confidence: "media", reason: "Con los datos introducidos no se ha identificado una aplicación directa; conviene verificar contrato, servicio y supuesto de aplicación." };
  }

  /* Un control está dentro del cálculo salvo que sea N/A, o (opcionalmente) exigible solo en categorías superiores. */
  function isInScope(control, state, opts) {
    if (state.answers[control.id] === "na") return false;
    if (opts && opts.excludeAboveCategory) {
      const cat = categoryKey(state.context || {});
      if ((CAT_ORDER[control.minCategory] || 1) > CAT_ORDER[cat]) return false;
    }
    return true;
  }

  function statusOf(state, id) { return pick(state.answers[id], STATUSES, "no_sabe"); }
  function evidenceOf(state, id) { return pick(state.evidence[id], EVIDENCES, "ninguna"); }

  function weighted(controls, state, opts, fn) {
    let earned = 0, possible = 0;
    controls.forEach((c) => {
      if (!isInScope(c, state, opts)) return;
      const w = PRIORITY_WEIGHT[c.priority] || 1;
      possible += w;
      earned += w * fn(c);
    });
    return possible ? Math.round((earned / possible) * 100) : 0;
  }

  /* Readiness declarado: estado del control, ponderado por prioridad. */
  const score = (controls, state, opts) =>
    weighted(controls, state, opts, (c) => STATUS_POINTS[statusOf(state, c.id)] || 0);

  /* Evidence readiness: disponibilidad de evidencia, ponderada por prioridad. */
  const evidenceScore = (controls, state, opts) =>
    weighted(controls, state, opts, (c) => EVIDENCE_POINTS[evidenceOf(state, c.id)] || 0);

  /* Readiness verificable: un control solo cuenta hasta donde lo respalda su evidencia. */
  const verifiedScore = (controls, state, opts) =>
    weighted(controls, state, opts, (c) =>
      Math.min(STATUS_POINTS[statusOf(state, c.id)] || 0, EVIDENCE_POINTS[evidenceOf(state, c.id)] || 0));

  /* Desglose por área (readiness declarado). */
  function areaBreakdown(controls, state, opts) {
    const map = {};
    controls.forEach((c) => {
      if (!isInScope(c, state, opts)) return;
      const a = (map[c.area] = map[c.area] || { area: c.area, earned: 0, possible: 0, count: 0 });
      const w = PRIORITY_WEIGHT[c.priority] || 1;
      a.possible += w; a.count++;
      a.earned += w * (STATUS_POINTS[statusOf(state, c.id)] || 0);
    });
    return Object.values(map)
      .map((a) => ({ area: a.area, count: a.count, score: Math.round((a.earned / a.possible) * 100) }))
      .sort((x, y) => x.score - y.score);
  }

  /* Clasifica los controles en gaps, incertidumbre y "declarado sin evidencia". */
  function classify(controls, state, opts) {
    const gaps = [], uncertain = [], noEvidence = [], outOfCategory = [];
    controls.forEach((c) => {
      const s = statusOf(state, c.id);
      if (s === "na") return;
      if (!isInScope(c, state, opts)) { outOfCategory.push(c); return; }
      if (s === "no" || s === "parcial") gaps.push(c);
      else if (s === "no_sabe") uncertain.push(c);
      else if (s === "si" && evidenceOf(state, c.id) === "ninguna") noEvidence.push(c);
    });
    return { gaps, uncertain, noEvidence, outOfCategory };
  }

  /* Orden del plan: prioridad, después fecha (sin fecha al final), después id. */
  function sortPlan(list, state) {
    return list.slice().sort((a, b) => {
      const pr = (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3);
      if (pr) return pr;
      const da = (state.actions[a.id] || {}).date || "9999-12-31";
      const db = (state.actions[b.id] || {}).date || "9999-12-31";
      if (da !== db) return da < db ? -1 : 1;
      return a.id < b.id ? -1 : 1;
    });
  }

  function isOverdue(action, today) {
    return !!(action && action.date && action.status !== "hecho" && action.date < today);
  }

  /* Valida y normaliza un fichero importado. Devuelve { state, summary }. */
  function importPayload(payload, controls) {
    const state = { answers: {}, evidence: {}, actions: {}, generated: false, org: {}, context: {} };
    const summary = { imported: 0, unknown: 0, invalid: 0 };
    if (!payload || typeof payload !== "object") throw new Error("Formato no válido");

    const o = payload.organization || {}, c = payload.context || {};
    state.org = {
      name: str(o.name, 200), type: str(o.type, 40), sector: str(o.sector, 80),
      size: str(o.size, 40), service: str(o.service, 1000), publicRelation: str(o.publicRelation, 1000)
    };
    state.context = {
      publicContract: pick(c.publicContract, ["si", "no", "no_sabe"], "no_sabe"),
      availability: pick(c.availability, LEVELS, "bajo"),
      confidentiality: pick(c.confidentiality, LEVELS, "bajo"),
      integrity: pick(c.integrity, LEVELS, "bajo"),
      info: Array.isArray(c.info) ? c.info.filter((x) => typeof x === "string").slice(0, 10) : []
    };

    const known = new Set(controls.map((x) => x.id));
    const items = Array.isArray(payload.assessment) ? payload.assessment : [];
    items.forEach((item) => {
      if (!item || typeof item !== "object" || !known.has(item.id)) { summary.unknown++; return; }
      if (item.status !== undefined && item.status !== null && !STATUSES.includes(item.status)) summary.invalid++;
      if (item.evidence !== undefined && !EVIDENCES.includes(item.evidence)) summary.invalid++;
      if (item.status !== undefined && item.status !== null) state.answers[item.id] = pick(item.status, STATUSES, "no_sabe");
      state.evidence[item.id] = pick(item.evidence, EVIDENCES, "ninguna");
      state.actions[item.id] = normalizeAction(item.action);
      summary.imported++;
    });
    return { state, summary };
  }

  const api = {
    STATUSES, EVIDENCES, ACTION_STATES, EFFORTS, PRIORITY_WEIGHT,
    emptyAction, normalizeAction, categoryKey, CATEGORY_LABEL, categoryWarnings,
    applicability, isInScope, score, evidenceScore, verifiedScore, areaBreakdown,
    classify, sortPlan, isOverdue, importPayload
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ENSLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
