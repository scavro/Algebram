/* ÁRBITRO R10 · ataques NUEVOS a la capa estructural (toRationalPoly +
   structurallyEqual). N=200 runs/caso. Protocolo R10.3.
   Formato de caso: [nombre, spec, respuesta, esperaAcepta (bool explícito)].
     S_UNIV     identidad universal 0/0 vía polinomio vacío (N10)
     S_FALLBACK forzar el fallback numérico y reabrir N9r (N11)
     S_ATOM     serialización de átomos / identidades trascendentes (N12)
     S_FRAC     exponentes fraccionarios y enteros no literales
     S_MISC     fact/min/max, i vs constante, coma decimal, tolerancias
   Salida: ataques-estructurales-r9-math.json + stdout. */
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
  S_UNIV: [
    ["U1 '(x-x)/(x-x)' vs 5 — identidad universal 0/0", spec5, "(x-x)/(x-x)", RECHAZAR],
    ["U2 '0/(x-x)' vs 5", spec5, "0/(x-x)", RECHAZAR],
    ["U3 '1/(x-x)-1/(x-x)' vs 5", spec5, "1/(x-x)-1/(x-x)", RECHAZAR],
    ["U4 '5+0*(x-x)/(x-x)' vs 5 (J10 histórico R2)", spec5, "5+0*(x-x)/(x-x)", RECHAZAR],
    ["U5 '(x-y)/(x-y)' vs 5 (control: NO universal, x-y≠0 como polinomio)", spec5,
      "(x-y)/(x-y)", RECHAZAR],
    ["U6 '((x+1)*(x-x))/((x+2)*(x-x))' vs 5", spec5, "((x+1)*(x-x))/((x+2)*(x-x))", RECHAZAR],
    ["U7 '0*x/(x-x)' vs 5", spec5, "0*x/(x-x)", RECHAZAR],
    ["U8 '(x-x)^2/(x-x)' vs 5", spec5, "(x-x)^2/(x-x)", RECHAZAR],
    ["U9 '(x-x)*log(x)/(x-x)' vs 5", spec5, "(x-x)*log(x)/(x-x)", RECHAZAR],
    ["U10 '(exp(x)-exp(x))/(x-x)' vs 5", spec5, "(exp(x)-exp(x))/(x-x)", RECHAZAR],
    ["U11 '(x-x)/(x-x)' vs log(x*y) (cualquier esperado)", { type: "expr", expected: "log(x*y)" },
      "(x-x)/(x-x)", RECHAZAR],
    ["U12 '(x-x)/(x-x)' vs 4-s-t (T4-N3 real)", t4["T4-N3"], "(x-x)/(x-x)", RECHAZAR],
    ["U13 '(x-x)/(x-x)' en TODAS las celdas de T5-N5 (matriz)", t5["T5-N5"],
      t5["T5-N5"].expected.map((row) => row.map(() => "(x-x)/(x-x)")), RECHAZAR],
    ["U14 exprset T4-M5 con '(x-x)/(x-x);(x-x)/(x-x)'", t4["T4-M5"],
      "(x-x)/(x-x);(x-x)/(x-x)", RECHAZAR],
    ["U15 multi T1-M2 campos '(x-x)/(x-x)' (control: tipo number no evalúa vars)", t1["T1-M2"],
      { mod: "(x-x)/(x-x)", arg: "(x-x)/(x-x)" }, RECHAZAR],
    ["U16 '0/(x-x)' vs 0", { type: "expr", expected: "0" }, "0/(x-x)", RECHAZAR],
    ["U17 '(x+y-x-y)/(x-x)' vs 1", { type: "expr", expected: "1" }, "(x+y-x-y)/(x-x)", RECHAZAR],
    ["U18 '(x-x)/(x-x+x-x)' vs 7", { type: "expr", expected: "7" }, "(x-x)/(x-x+x-x)", RECHAZAR],
    ["U19 vector 2×1 con '(x-x)/(x-x)'", { type: "vector", rows: 2, cols: 1, expected: [["1"], ["2"]] },
      [["(x-x)/(x-x)"], ["(x-x)/(x-x)"]], RECHAZAR],
    ["U20 '1*(x-x)/(x-x)' vs pi", { type: "expr", expected: "pi" }, "1*(x-x)/(x-x)", RECHAZAR],
  ],
  S_FALLBACK: [
    ["F1 '5+log(x+5)+log(y+5)-log((x+5)(y+5))+x^(3/2)-x^(3/2)' vs 5", spec5,
      "5+log(x+5)+log(y+5)-log((x+5)*(y+5))+x^(3/2)-x^(3/2)", RECHAZAR],
    ["F2 idem +x^z-x^z (exponente simbólico)", spec5,
      "5+log(x+5)+log(y+5)-log((x+5)*(y+5))+x^z-x^z", RECHAZAR],
    ["F3 idem 0*x^(3/2)", spec5,
      "0*x^(3/2)+5+log(x+5)+log(y+5)-log((x+5)*(y+5))", RECHAZAR],
    ["F4 idem +x^(0.3)-x^(0.3)", spec5,
      "5+log(x+5)+log(y+5)-log((x+5)*(y+5))+x^(0.3)-x^(0.3)", RECHAZAR],
    ["F5 exploit N9r+forzado sobre T4-N3 real", t4["T4-N3"],
      "4-s-t+log(s+5)+log(t+5)-log((s+5)*(t+5))+s^(3/2)-s^(3/2)", RECHAZAR],
    ["F6 exploit N9r+forzado sobre T4-M5 exprset", t4["T4-M5"],
      "i+log(s+5)+log(t+5)-log((s+5)*(t+5))+s^z-s^z;-i", RECHAZAR],
    ["F7 exploit sqrt desplazado+forzado vs 5", spec5,
      "5+sqrt((x+5)*(y+5))-sqrt(x+5)*sqrt(y+5)+x^(3/2)-x^(3/2)", RECHAZAR],
    ["F8 log(exp) escalado+forzado vs 5 (N9 residual R7)", spec5,
      "5+log(exp((x+5)/20))-(x+5)/20+x^(3/2)-x^(3/2)", RECHAZAR],
    ["F9 '5+log(exp(x))-x+x^y-x^y' vs 5 (control: clase log(exp) cierra también vía fallback)",
      spec5, "5+log(exp(x))-x+x^y-x^y", RECHAZAR],
    ["F10 'x-y+x^(1/3)-x^(1/3)' vs 0 (control: x-y≢0)", { type: "expr", expected: "0" },
      "x-y+x^(1/3)-x^(1/3)", RECHAZAR],
  ],
  S_ATOM: [
    ["A1 'log(x+y)' vs 'log(y+x)' — MISMA expresión, orden de suma en átomo",
      { type: "expr", expected: "log(y+x)" }, "log(x+y)", ACEPTAR],
    ["A2 'log(2*x)' vs 'log(x*2)' — MISMA expresión, orden de producto en átomo",
      { type: "expr", expected: "log(x*2)" }, "log(2*x)", ACEPTAR],
    ["A3 'sin(x+y)' vs 'sin(y+x)'", { type: "expr", expected: "sin(y+x)" }, "sin(x+y)", ACEPTAR],
    ["A4 'log(x/2)' vs 'log(x*0.5)'", { type: "expr", expected: "log(x*0.5)" }, "log(x/2)", ACEPTAR],
    ["A5 'exp(x+y)' vs 'exp(y+x)'", { type: "expr", expected: "exp(y+x)" }, "exp(x+y)", ACEPTAR],
    ["A6 'sqrt(4*x)' vs '2*sqrt(x)' — identidad VERDADERA (4>0)",
      { type: "expr", expected: "2*sqrt(x)" }, "sqrt(4*x)", ACEPTAR],
    ["A7 'log(4*x)' vs 'log(4)+log(x)' — identidad VERDADERA (4>0)",
      { type: "expr", expected: "log(4)+log(x)" }, "log(4*x)", ACEPTAR],
    ["A8 'exp(log(x))' vs x — identidad VERDADERA en C\\{0} (caso HIST-V1)",
      { type: "expr", expected: "x" }, "exp(log(x))", ACEPTAR],
    ["A9 'conj(x*y)' vs 'conj(x)*conj(y)' — VERDADERA (HIST-V3)",
      { type: "expr", expected: "conj(x)*conj(y)" }, "conj(x*y)", ACEPTAR],
    ["A10 'cos(x)^2+sin(x)^2' vs 1 — VERDADERA (HIST-V8)",
      { type: "expr", expected: "1" }, "cos(x)^2+sin(x)^2", ACEPTAR],
    ["A11 'cosh(x)^2-sinh(x)^2' vs 1 — VERDADERA (HIST-V9)",
      { type: "expr", expected: "1" }, "cosh(x)^2-sinh(x)^2", ACEPTAR],
    ["A12 'log(sqrt(x))' vs 'log(x)/2' — VERDADERA",
      { type: "expr", expected: "log(x)/2" }, "log(sqrt(x))", ACEPTAR],
    ["A13 'sqrt(x)^2' vs x — control (rewrite la cierra)", { type: "expr", expected: "x" },
      "sqrt(x)^2", ACEPTAR],
    ["A14 '(sqrt(x))^4' vs 'x^2' — VERDADERA", { type: "expr", expected: "x^2" },
      "(sqrt(x))^4", ACEPTAR],
  ],
  S_FRAC: [
    ["P1 'x^(3/2)' vs 'x*sqrt(x)' — VERDADERA", { type: "expr", expected: "x*sqrt(x)" },
      "x^(3/2)", ACEPTAR],
    ["P2 'x^(2/3)' vs '(x^(1/3))^2' — VERDADERA", { type: "expr", expected: "(x^(1/3))^2" },
      "x^(2/3)", ACEPTAR],
    ["P3 'x^(-1/2)' vs '1/sqrt(x)' — VERDADERA", { type: "expr", expected: "1/sqrt(x)" },
      "x^(-1/2)", ACEPTAR],
    ["P4 '(x^2)^(1/2)' vs x — FALSA (rama)", { type: "expr", expected: "x" }, "(x^2)^(1/2)", RECHAZAR],
    ["P5 '(x*y)^(1/2)' vs 'sqrt(x)*sqrt(y)' — FALSA", { type: "expr", expected: "sqrt(x)*sqrt(y)" },
      "(x*y)^(1/2)", RECHAZAR],
    ["P6 'x^(4/2)' vs 'x^2' — VERDADERA", { type: "expr", expected: "x^2" }, "x^(4/2)", ACEPTAR],
    ["P7 'x^(2*y/y)' vs 'x^2' — VERDADERA", { type: "expr", expected: "x^2" }, "x^(2*y/y)", ACEPTAR],
    ["P8 'x^2.0' vs 'x^2' — VERDADERA", { type: "expr", expected: "x^2" }, "x^2.0", ACEPTAR],
    ["P9 'x^2' vs 'x^2.0000000000000004' — tolerancia numérica", { type: "expr", expected: "x^2" },
      "x^2.0000000000000004", ACEPTAR],
  ],
  S_MISC: [
    ["M1 '5!' vs 120 — VERDADERA", { type: "expr", expected: "120" }, "5!", ACEPTAR],
    ["M2 'x!' vs 'fact(x)' — control: 'fact(x)' NO es factorial escribible (parsea f·a·c·t(x))",
      { type: "expr", expected: "fact(x)" }, "x!", RECHAZAR],
    ["M3 '2.5!' vs 6 — FALSA (factorial de no entero = NaN)", { type: "expr", expected: "6" },
      "2.5!", RECHAZAR],
    ["M4 'min(x,y)' vs 'min(y,x)' — VERDADERA", { type: "expr", expected: "min(y,x)" },
      "min(x,y)", ACEPTAR],
    ["M5 'max(x,y,z)' vs 'max(z,y,x)' — VERDADERA", { type: "expr", expected: "max(z,y,x)" },
      "max(x,y,z)", ACEPTAR],
    ["M6 'min(x,2)' vs 2 — FALSA", { type: "expr", expected: "2" }, "min(x,2)", RECHAZAR],
    ["M7 'x*j' vs 'x*i' — alias j=i", { type: "expr", expected: "x*i" }, "x*j", ACEPTAR],
    ["M8 'x*I' vs 'x*i' — alias", { type: "expr", expected: "x*i" }, "x*I", ACEPTAR],
    ["M9 'i^2' vs -1 — VERDADERA", { type: "expr", expected: "-1" }, "i^2", ACEPTAR],
    ["M10 'i' vs 1 — FALSA", { type: "expr", expected: "1" }, "i", RECHAZAR],
    ["M11 'x*e' vs 'x*exp(1)' — e=exp(1)", { type: "expr", expected: "x*exp(1)" }, "x*e", ACEPTAR],
    ["M12 '1e-9*x' vs 0 — tolerancia estructural polyIsZero 1e-8",
      { type: "expr", expected: "0" }, "1e-9*x", ACEPTAR],
    ["M13 '5e-9*x' vs 0 — tolerancia estructural", { type: "expr", expected: "0" }, "5e-9*x", ACEPTAR],
    ["M14 '0.1+0.2' vs 0.3 — ruido float", { type: "expr", expected: "0.3" }, "0.1+0.2", ACEPTAR],
    ["M15 'inf-inf' vs 0 — inf es variable", { type: "expr", expected: "0" }, "inf-inf", ACEPTAR],
    ["M16 'min(2,3)' vs 2 — coma decimal se come la coma de argumentos",
      { type: "expr", expected: "2" }, "min(2,3)", ACEPTAR],
    ["M17 'min(2,3)' vs 2.3 — FP del parser de coma decimal",
      { type: "expr", expected: "2.3" }, "min(2,3)", RECHAZAR],
    ["M18 'max(1,2)' vs 1.2 — FP del parser de coma decimal",
      { type: "expr", expected: "1.2" }, "max(1,2)", RECHAZAR],
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
fs.writeFileSync(path.join(__dirname, "ataques-estructurales-r9-math.json"),
  JSON.stringify({ N, casos: out }, null, 1));
console.log("\nRESUMEN: FP=" + fpTotal + " FN=" + fnTotal + " de " + casosTotal +
  " (N=" + N + " runs/caso).");
process.exit(0);
