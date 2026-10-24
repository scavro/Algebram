/* ÁRBITRO R9 · ataques NUEVOS finales contra las defensas R8→R9 (protocolo R9.2).
   N=200 runs/caso. Formato: [nombre, spec, respuesta, esperaAcepta].
     D_NULL   denominadores nulos más elaborados (deben RECHAZAR)
     D_SKEL   esqueletos que coinciden / casi, con ramas falsas (RECHAZAR)
     D_TRUE   identidades VERDADERAS nuevas (ACEPTAR; si no → FN)
     D_POW    potencias en los límites |k| = 64, 65, -64, -65
     D_N16R   residual de N16: |k|>64 escapado al fallback numérico
     D_COMA   coma decimal con min/max (regresión N13)
   Salida: ataques-nuevos-r9-math.json + stdout. */
const G = require("../../../assets/js/grader.js");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const N = 200;
const ROOT = path.join(__dirname, "..", "..", "..");
function load(file) {
  const src = fs.readFileSync(path.join(ROOT, "assets", "data", file + ".js"), "utf8");
  const sb = { window: {} };
  vm.createContext(sb);
  vm.runInContext(src, sb);
  const obj = sb.window.CURSO_DATA[Object.keys(sb.window.CURSO_DATA)[0]];
  const items = obj.drills || (obj.exam && obj.exam.questions) || [];
  const map = {};
  for (const q of items) map[q.id] = q.answer;
  return map;
}
const t1 = load("tema-1"), t4 = load("tema-4"), t5 = load("tema-5");

const spec5 = { type: "expr", expected: "5" };
const RECHAZAR = false, ACEPTAR = true;

const CASES = {
  D_NULL: [
    ["N1 '1/((x-x)*(x-x))' vs 5 — denominador (x-x)² nulo", spec5, "1/((x-x)*(x-x))", RECHAZAR],
    ["N2 '1/(0*(x-x))' vs 5 — denominador 0·(x-x)", spec5, "1/(0*(x-x))", RECHAZAR],
    ["N3 '1/(0*x)' vs 5 — denominador 0·x", spec5, "1/(0*x)", RECHAZAR],
    ["N4 '(x+1)/((x-x)*(x-x))' vs 5", spec5, "(x+1)/((x-x)*(x-x))", RECHAZAR],
    ["N5 '1/((x-x)*(y-y))' vs 5 — dos factores nulos", spec5, "1/((x-x)*(y-y))", RECHAZAR],
    ["N6 '1/((x-x)*(x+1))' vs 5 — un factor nulo", spec5, "1/((x-x)*(x+1))", RECHAZAR],
    ["N7 '(x-x)/((x-x)*(x-x))' vs 5 — 0/0 elaborado", spec5, "(x-x)/((x-x)*(x-x))", RECHAZAR],
    ["N8 '1/((x+y)-(x+y))' vs 5 — denominador suma-cancelada", spec5, "1/((x+y)-(x+y))", RECHAZAR],
    ["N9 '1/(x^2-x*x)' vs 5 — denominador x²−x·x", spec5, "1/(x^2-x*x)", RECHAZAR],
    ["N10 '1/((x+1)^2-(x+1)^2)' vs 5", spec5, "1/((x+1)^2-(x+1)^2)", RECHAZAR],
    ["N11 '1/(x-x)^0' vs 1 — control: (x-x)^0=1, sí es 1", { type: "expr", expected: "1" },
      "1/(x-x)^0", ACEPTAR],
    ["N12 '2/(x-x)' vs '1/(x-x)' — fracciones cruzadas ambas nulas",
      { type: "expr", expected: "1/(x-x)" }, "2/(x-x)", RECHAZAR],
    ["N13 '(x-x)/(2*(x-x))' vs 5 — 0/0 con escala", spec5, "(x-x)/(2*(x-x))", RECHAZAR],
    ["N14 '1/(x-x)+1/(y-y)' vs 5 — dos nulos sumados", spec5, "1/(x-x)+1/(y-y)", RECHAZAR],
    ["N15 '((x-x)*log(x))/((x-x)*exp(x))' vs 5 — 0/0 con átomos", spec5,
      "((x-x)*log(x))/((x-x)*exp(x))", RECHAZAR],
    ["N16 '1/(-(x-x))' vs 5 — denominador −(x−x)", spec5, "1/(-(x-x))", RECHAZAR],
    ["N17 '1/((x-x)+(x-x))' vs 5", spec5, "1/((x-x)+(x-x))", RECHAZAR],
    ["N18 '(x-x)/(x-x)' vs 5 en celda matriz", { type: "matrix", rows: 1, cols: 1, expected: [["5"]] },
      [["(x-x)/(x-x)"]], RECHAZAR],
    ["N19 '1/((x-x)*(x-x));1/((x-x)*(x-x))' exprset T4-M5", t4["T4-M5"],
      "1/((x-x)*(x-x));1/((x-x)*(x-x))", RECHAZAR],
    ["N20 '5+1/((x-x)*(x-x))' vs 5 (intenta quedarse con el término bueno)", spec5,
      "5+1/((x-x)*(x-x))", RECHAZAR],
  ],
  D_SKEL: [
    ["S1 'log(x*x)' vs '2*log(x)' — rama falsa, debe rechazar",
      { type: "expr", expected: "2*log(x)" }, "log(x*x)", RECHAZAR],
    ["S2 '2*log(x)' vs 'log(x*x)' — inverso", { type: "expr", expected: "log(x*x)" },
      "2*log(x)", RECHAZAR],
    ["S3 'log(x^2)' vs '2*log(x)' — rama falsa clásica",
      { type: "expr", expected: "2*log(x)" }, "log(x^2)", RECHAZAR],
    ["S4 'log(x)+log(y)' vs 'log(x*y)' — rama falsa",
      { type: "expr", expected: "log(x*y)" }, "log(x)+log(y)", RECHAZAR],
    ["S5 'sqrt(x*x)' vs 'x' — rama falsa (√(x²)=|x|-ish)",
      { type: "expr", expected: "x" }, "sqrt(x*x)", RECHAZAR],
    ["S6 'sqrt(x^2)' vs 'x' — rama falsa", { type: "expr", expected: "x" }, "sqrt(x^2)", RECHAZAR],
    ["S7 'log(x*x)+x^(3/2)-x^(3/2)' vs '2*log(x)' — rama falsa + forzado de fallback",
      { type: "expr", expected: "2*log(x)" }, "log(x*x)+x^(3/2)-x^(3/2)", RECHAZAR],
    ["S8 'log(x)+log(y)+x^z-x^z' vs 'log(x*y)' — forzado simbólico",
      { type: "expr", expected: "log(x*y)" }, "log(x)+log(y)+x^z-x^z", RECHAZAR],
    ["S9 '5+log(x*x)-2*log(x)+x^(3/2)-x^(3/2)' vs 5 — exploit rama+forzado",
      spec5, "5+log(x*x)-2*log(x)+x^(3/2)-x^(3/2)", RECHAZAR],
    ["S10 'log(x)*log(y)' vs 'log(x)+log(y)' — MISMOS átomos, estructura distinta (falsa)",
      { type: "expr", expected: "log(x)+log(y)" }, "log(x)*log(y)", RECHAZAR],
    ["S11 'sin(x)/sin(y)' vs 'sin(x)-sin(y)' — mismos átomos, falsa",
      { type: "expr", expected: "sin(x)-sin(y)" }, "sin(x)/sin(y)", RECHAZAR],
    ["S12 'asin(sin(x))' vs 'x' — rama falsa", { type: "expr", expected: "x" }, "asin(sin(x))", RECHAZAR],
    ["S13 'sqrt(x^2*y)' vs 'x*sqrt(y)' — falsa", { type: "expr", expected: "x*sqrt(y)" },
      "sqrt(x^2*y)", RECHAZAR],
    ["S14 'log(x*x)' vs 'log(x)+log(x)' — falsa (2log x ≠ log x² en C)",
      { type: "expr", expected: "log(x)+log(x)" }, "log(x*x)", RECHAZAR],
  ],
  D_TRUE: [
    ["T1 'tan(x)' vs 'sin(x)/cos(x)' — VERDADERA (cTan = cSin/cCos en el propio motor)",
      { type: "expr", expected: "sin(x)/cos(x)" }, "tan(x)", ACEPTAR],
    ["T2 'sen(x)/cos(x)' vs 'tg(x)' — VERDADERA (inverso)",
      { type: "expr", expected: "tg(x)" }, "sen(x)/cos(x)", ACEPTAR],
    ["T3 'abs(x)^2' vs 'x*conj(x)' — VERDADERA en C",
      { type: "expr", expected: "x*conj(x)" }, "abs(x)^2", ACEPTAR],
    ["T4 'x*conj(x)' vs 'abs(x)^2' — inverso", { type: "expr", expected: "abs(x)^2" },
      "x*conj(x)", ACEPTAR],
    ["T5 'conj(x-y)' vs 'conj(x)-conj(y)' — VERDADERA (resta)",
      { type: "expr", expected: "conj(x)-conj(y)" }, "conj(x-y)", ACEPTAR],
    ["T6 'conj(-x)' vs '-conj(x)' — VERDADERA", { type: "expr", expected: "-conj(x)" },
      "conj(-x)", ACEPTAR],
    ["T7 'conj(x)+x' vs '2*re(x)' — VERDADERA (2Re z = z+conj z)",
      { type: "expr", expected: "2*re(x)" }, "conj(x)+x", ACEPTAR],
    ["T8 'abs(x*y)' vs 'abs(x)*abs(y)' — VERDADERA en C",
      { type: "expr", expected: "abs(x)*abs(y)" }, "abs(x*y)", ACEPTAR],
    ["T9 'conj(x^2)' vs 'conj(x)^2' — VERDADERA",
      { type: "expr", expected: "conj(x)^2" }, "conj(x^2)", ACEPTAR],
    ["T10 'im(x)' vs '(x-conj(x))/(2*i)' — VERDADERA",
      { type: "expr", expected: "(x-conj(x))/(2*i)" }, "im(x)", ACEPTAR],
    ["T11 'log(x^2)' vs '2*log(x)' con x>0 no aplica en C — control FALSA",
      { type: "expr", expected: "2*log(x)" }, "log(x^2)", RECHAZAR],
  ],
  D_POW: [
    ["L1 'x^64' vs 'x^64' idénticas — fast-path", { type: "expr", expected: "x^64" }, "x^64", ACEPTAR],
    ["L2 'x^65' vs 'x^65' idénticas — fast-path", { type: "expr", expected: "x^65" }, "x^65", ACEPTAR],
    ["L3 'x^65' vs 'x^64*x' — VERDADERA (65>64, vía numérica)",
      { type: "expr", expected: "x^64*x" }, "x^65", ACEPTAR],
    ["L4 'x^(-64)' vs '1/(x^64)' — VERDADERA (estructural)",
      { type: "expr", expected: "1/(x^64)" }, "x^(-64)", ACEPTAR],
    ["L5 'x^(-65)' vs '1/(x^65)' — VERDADERA (numérica)",
      { type: "expr", expected: "1/(x^65)" }, "x^(-65)", ACEPTAR],
    ["L6 'x^(-64)' vs 'x^64' — FALSA (signo)", { type: "expr", expected: "x^64" }, "x^(-64)", RECHAZAR],
    ["L7 'x^65' vs 'x^66' — FALSA", { type: "expr", expected: "x^66" }, "x^65", RECHAZAR],
    ["L8 'x^(-65)' vs 'x^(-64)' — FALSA", { type: "expr", expected: "x^(-64)" }, "x^(-65)", RECHAZAR],
    ["L9 '(x+y)^64' vs '(x+y)^64' idénticas", { type: "expr", expected: "(x+y)^64" },
      "(x+y)^64", ACEPTAR],
    ["L10 '(x+y)^65' vs '(x+y)^64*(x+y)' — VERDADERA (numérica)",
      { type: "expr", expected: "(x+y)^64*(x+y)" }, "(x+y)^65", ACEPTAR],
    ["L11 'x^65' vs '5' — FALSA (control)", spec5, "x^65", RECHAZAR],
    ["L12 '(x*y)^64' vs 'x^64*y^64' — VERDADERA (entero)",
      { type: "expr", expected: "x^64*y^64" }, "(x*y)^64", ACEPTAR],
  ],
  D_N16R: [
    ["R1 'x^(-65)' vs 0 — residual N16 (65>64 → fallback numérico)",
      { type: "expr", expected: "0" }, "x^(-65)", RECHAZAR],
    ["R2 'x^(-300)' vs 0 — residual N16", { type: "expr", expected: "0" }, "x^(-300)", RECHAZAR],
    ["R3 '5+x^(-300)' vs 5 — residual N16 sobre E conocido", spec5, "5+x^(-300)", RECHAZAR],
    ["R4 '5+x^(-65)' vs 5", spec5, "5+x^(-65)", RECHAZAR],
    ["R5 '4-s-t+x^(-300)' vs T4-N3 real", t4["T4-N3"], "4-s-t+x^(-300)", RECHAZAR],
    ["R6 '(x+y)^(-300)' vs 0", { type: "expr", expected: "0" }, "(x+y)^(-300)", RECHAZAR],
    ["R7 '5+x^(-2000)' vs 5", spec5, "5+x^(-2000)", RECHAZAR],
    ["R8 exprset T4-M5 'i+x^(-300);-i'", t4["T4-M5"], "i+x^(-300);-i", RECHAZAR],
    ["R9 matriz T5-N5 celdas +x^(-300)", t5["T5-N5"],
      t5["T5-N5"].expected.map((row) => row.map((c) => c + "+x^(-300)")), RECHAZAR],
    ["R10 'x^(-20)' vs 0 — control estructural (20≤64)", { type: "expr", expected: "0" },
      "x^(-20)", RECHAZAR],
    ["R11 '5+x^(-20)' vs 5 — control estructural", spec5, "5+x^(-20)", RECHAZAR],
    ["R12 'x^(-300)' vs 5 — control: NO universal", spec5, "x^(-300)", RECHAZAR],
  ],
  D_COMA: [
    ["C1 'min(2,3)' vs 2 — VERDADERA (N13 fijado)",
      { type: "expr", expected: "2" }, "min(2,3)", ACEPTAR],
    ["C2 'min(2,3)' vs 2.3 — FALSA (FP R8 cerrado)",
      { type: "expr", expected: "2.3" }, "min(2,3)", RECHAZAR],
    ["C3 'max(1,2)' vs 1.2 — FALSA (FP R8 cerrado)",
      { type: "expr", expected: "1.2" }, "max(1,2)", RECHAZAR],
    ["C4 'min(2,3)' vs 3 — FALSA", { type: "expr", expected: "3" }, "min(2,3)", RECHAZAR],
    ["C5 'min(x,y)' vs 'min(y,x)' — VERDADERA", { type: "expr", expected: "min(y,x)" },
      "min(x,y)", ACEPTAR],
  ],
};

const out = {};
let fpTotal = 0, fnTotal = 0, casosTotal = 0;
for (const [grupo, casos] of Object.entries(CASES)) {
  console.log("--- " + grupo + " (" + casos.length + " casos × " + N + " runs) ---");
  for (const [nombre, spec, resp, esperaAcepta] of casos) {
    let acepta = 0;
    for (let i = 0; i < N; i++) {
      let r;
      try { r = G.check(spec, resp); } catch (e) { r = { ok: false }; }
      if (r.ok === true) acepta++;
    }
    const esFP = !esperaAcepta && acepta > 0;
    const esFN = esperaAcepta && acepta < N;
    if (esFP) fpTotal++;
    if (esFN) fnTotal++;
    casosTotal++;
    out[nombre] = { grupo, acepta, n: N, esperaAcepta, falsoPositivo: esFP, falsoNegativo: esFN };
    console.log((esFP ? "FP!!" : esFN ? "FN!!" : "OK  ") + " | " +
      String(acepta).padStart(4) + "/" + N + " | " + nombre);
  }
}
fs.writeFileSync(path.join(__dirname, "ataques-nuevos-r9-math.json"),
  JSON.stringify({ N, casos: out }, null, 1));
console.log("\nRESUMEN: FP=" + fpTotal + " FN=" + fnTotal + " de " + casosTotal +
  " (N=" + N + " runs/caso).");
process.exit(0);
