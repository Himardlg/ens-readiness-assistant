"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../logic.js");
const { CONTROLS } = require("../data/controls.js");

const mk = (answers = {}, evidence = {}, ctx = {}) => ({
  answers, evidence, actions: {},
  context: { availability: "bajo", confidentiality: "bajo", integrity: "bajo", info: [], ...ctx }
});
const all = (status, evidence) => {
  const a = {}, e = {};
  CONTROLS.forEach((c) => { a[c.id] = status; e[c.id] = evidence; });
  return mk(a, e);
};

test("catálogo: ids únicos y campos obligatorios", () => {
  const ids = CONTROLS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  CONTROLS.forEach((c) => {
    assert.ok(["alta", "media", "baja"].includes(c.priority), c.id);
    assert.ok(["basica", "media", "alta"].includes(c.minCategory), c.id);
    assert.ok(c.ref && c.question && c.action && c.evidence.length, c.id);
  });
});

test("score: todo Sí = 100, todo No = 0, No sé = 0", () => {
  assert.equal(L.score(CONTROLS, all("si", "suficiente")), 100);
  assert.equal(L.score(CONTROLS, all("no", "suficiente")), 0);
  assert.equal(L.score(CONTROLS, all("no_sabe", "suficiente")), 0);
});

test("score: Parcialmente puntúa 50 y N/A se excluye del denominador", () => {
  assert.equal(L.score(CONTROLS, all("parcial", "ninguna")), 50);
  const s = all("si", "ninguna");
  s.answers[CONTROLS[0].id] = "na";
  assert.equal(L.score(CONTROLS, s), 100);
  assert.equal(L.score(CONTROLS, all("na", "ninguna")), 0);
});

test("score: pondera por prioridad", () => {
  const ctrls = [
    { id: "A", priority: "alta", minCategory: "basica" },
    { id: "B", priority: "baja", minCategory: "basica" }
  ];
  const s = mk({ A: "si", B: "no" });
  assert.equal(L.score(ctrls, s), 75); // 3 / (3+1)
});

test("evidence readiness y readiness verificable", () => {
  assert.equal(L.evidenceScore(CONTROLS, all("si", "suficiente")), 100);
  assert.equal(L.evidenceScore(CONTROLS, all("si", "ninguna")), 0);
  // «Sí» sin evidencia no cuenta como verificable
  assert.equal(L.verifiedScore(CONTROLS, all("si", "ninguna")), 0);
  assert.equal(L.verifiedScore(CONTROLS, all("si", "parcial")), 50);
  assert.equal(L.verifiedScore(CONTROLS, all("parcial", "suficiente")), 50);
  assert.equal(L.verifiedScore(CONTROLS, all("si", "suficiente")), 100);
});

test("excluir controles exigibles solo en categorías superiores", () => {
  const s = all("no", "ninguna");
  const withAll = L.classify(CONTROLS, s, { excludeAboveCategory: false });
  const basic = L.classify(CONTROLS, s, { excludeAboveCategory: true });
  assert.equal(withAll.gaps.length, CONTROLS.length);
  assert.ok(basic.gaps.length < CONTROLS.length);
  assert.equal(basic.gaps.length + basic.outOfCategory.length, CONTROLS.length);
  const high = Object.assign(all("no", "ninguna"), { context: { availability: "alto", confidentiality: "bajo", integrity: "bajo", info: [] } });
  assert.equal(L.classify(CONTROLS, high, { excludeAboveCategory: true }).gaps.length, CONTROLS.length);
});

test("classify separa gaps, incertidumbre y sin evidencia", () => {
  const a = {}, e = {};
  const [c1, c2, c3, c4] = CONTROLS;
  a[c1.id] = "no"; a[c2.id] = "no_sabe"; a[c3.id] = "si"; e[c3.id] = "ninguna"; a[c4.id] = "si"; e[c4.id] = "suficiente";
  const g = L.classify(CONTROLS.slice(0, 4), mk(a, e), {});
  assert.deepEqual(g.gaps.map((c) => c.id), [c1.id]);
  assert.deepEqual(g.uncertain.map((c) => c.id), [c2.id]);
  assert.deepEqual(g.noEvidence.map((c) => c.id), [c3.id]);
});

test("categoría preliminar = máximo de las dimensiones", () => {
  assert.equal(L.categoryKey({ availability: "bajo", confidentiality: "bajo", integrity: "bajo" }), "basica");
  assert.equal(L.categoryKey({ availability: "bajo", confidentiality: "medio", integrity: "bajo" }), "media");
  assert.equal(L.categoryKey({ availability: "medio", confidentiality: "bajo", integrity: "alto" }), "alta");
});

test("aplicabilidad", () => {
  assert.equal(L.applicability({ type: "aapp" }, { publicContract: "no" }).label, "Probablemente aplica");
  assert.equal(L.applicability({ type: "proveedor" }, { publicContract: "si" }).confidence, "alta");
  assert.equal(L.applicability({ type: "privada" }, { publicContract: "si" }).label, "Probablemente aplica al alcance");
  assert.equal(L.applicability({ type: "privada" }, { publicContract: "no_sabe" }).label, "Requiere revisión");
  assert.equal(L.applicability({ type: "otro", sector: "Salud" }, { publicContract: "no" }).label, "Requiere revisión");
  assert.equal(L.applicability({ type: "privada", sector: "Industria" }, { publicContract: "no" }).label, "No identificada en esta evaluación");
});

test("avisos de coherencia categoría/información", () => {
  assert.equal(L.categoryWarnings({ availability: "bajo", confidentiality: "bajo", integrity: "bajo", info: ["critica"] }).length, 1);
  assert.equal(L.categoryWarnings({ availability: "alto", confidentiality: "bajo", integrity: "bajo", info: ["critica"] }).length, 0);
});

test("sortPlan: prioridad, luego fecha (sin fecha al final)", () => {
  const list = [
    { id: "B", priority: "media" }, { id: "A", priority: "alta" },
    { id: "C", priority: "media" }, { id: "D", priority: "media" }
  ];
  const s = mk();
  s.actions = { B: { date: "" }, A: { date: "" }, C: { date: "2026-01-01" }, D: { date: "2026-06-01" } };
  assert.deepEqual(L.sortPlan(list, s).map((c) => c.id), ["A", "C", "D", "B"]);
});

test("isOverdue", () => {
  assert.equal(L.isOverdue({ date: "2020-01-01", status: "pendiente" }, "2026-01-01"), true);
  assert.equal(L.isOverdue({ date: "2020-01-01", status: "hecho" }, "2026-01-01"), false);
  assert.equal(L.isOverdue({ date: "", status: "pendiente" }, "2026-01-01"), false);
});

test("importPayload valida, ignora desconocidos y normaliza", () => {
  const id = CONTROLS[0].id;
  const { state, summary } = L.importPayload({
    organization: { name: "X".repeat(1000), type: "aapp" },
    context: { publicContract: "quizas", availability: "alto", info: ["personal", 5] },
    assessment: [
      { id, status: "si", evidence: "suficiente", action: { owner: "TI", date: "no-fecha", status: "hecho", effort: "Z" } },
      { id: "NOPE", status: "si" },
      { id: CONTROLS[1].id, status: "xx", evidence: "yy" },
      null
    ]
  }, CONTROLS);
  assert.equal(state.org.name.length, 200);
  assert.equal(state.context.publicContract, "no_sabe");
  assert.equal(state.context.availability, "alto");
  assert.deepEqual(state.context.info, ["personal"]);
  assert.equal(state.answers[id], "si");
  assert.equal(state.actions[id].date, "");
  assert.equal(state.actions[id].effort, "");
  assert.equal(state.actions[id].status, "hecho");
  assert.equal(state.answers[CONTROLS[1].id], "no_sabe");
  assert.equal(summary.imported, 2);
  assert.equal(summary.unknown, 2);
  assert.equal(summary.invalid, 2);
});

test("importPayload rechaza entradas que no son objetos", () => {
  assert.throws(() => L.importPayload(null, CONTROLS));
  assert.throws(() => L.importPayload("texto", CONTROLS));
});

test("areaBreakdown ordena de menor a mayor", () => {
  const s = all("si", "suficiente");
  s.answers[CONTROLS[0].id] = "no";
  const r = L.areaBreakdown(CONTROLS, s, {});
  assert.equal(r[0].area, CONTROLS[0].area);
  assert.ok(r[0].score < 100);
});

test("caso de ejemplo: cubre todos los controles con valores válidos", () => {
  const { EXAMPLE_CASE } = require("../data/example.js");
  CONTROLS.forEach((c) => {
    const e = EXAMPLE_CASE.controls[c.id];
    assert.ok(e, "falta " + c.id);
    assert.ok(L.STATUSES.includes(e[0]), c.id + " estado");
    assert.ok(L.EVIDENCES.includes(e[1]), c.id + " evidencia");
    assert.ok(e[3] === "" || /^\d{4}-\d{2}-\d{2}$/.test(e[3]), c.id + " fecha");
    assert.ok(L.ACTION_STATES.includes(e[5]) && L.EFFORTS.includes(e[6]), c.id + " acción");
  });
  assert.deepEqual(Object.keys(EXAMPLE_CASE.controls).sort(), CONTROLS.map((c) => c.id).sort());
});
