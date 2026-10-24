/* ÁRBITRO R5 · ataque al muestreo aleatorio — estabilidad ≥200 por caso.
   Protocolo R5.2: cada check hostil se ejecuta N=200 veces; el resultado
   debe ser SIEMPRE estable en la dirección matemáticamente correcta:
     - hostiles  → 200/200 RECHAZA (cualquier ACEPTA = falso positivo)
     - equivalentes → 200/200 ACEPTA (cualquier RECHAZA = falso negativo)
   Sets:
     H_FIJO    exploits clásicos de puntos fijos (R1/R2): A*, O*
     H_REGION  anuladores de REGIÓN log(exp(v))-v  (N9, ataque fresco)
     H_BRANCH  alias de rama (log/sqrt): miden falsos positivos OCASIONALES
     EQUIV     formas equivalentes: estabilidad de aceptación */
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

/* exploits de los 8 puntos FIJOS de la R2 (ya no deben funcionar) */
const P = [
  "0.371+0.217i", "-1.283+0.619i", "2.117-0.733i", "-0.519-1.341i",
  "1.618+1.173i", "-2.271+0.451i", "0.829-2.137i", "3.041-0.617i",
];
const vanish = P.map((p) => "(x-(" + p + "))").join("*");

const CASES = {
  H_FIJO: [
    ["A1 'x-y' vs 0", { type: "expr", expected: "0" }, "x-y"],
    ["A2 'x^2-y^2' vs 0", { type: "expr", expected: "0" }, "x^2-y^2"],
    ["A4 '4-2*t' vs 4-s-t (T4-N3)", t4["T4-N3"], "4-2*t"],
    ["A5 '4-s-t+(s-t)' vs 4-s-t", t4["T4-N3"], "4-s-t+(s-t)"],
    ["A6 '1/(x-x)' vs 5", { type: "expr", expected: "5" }, "1/(x-x)"],
    ["A8 '1/(x-y)' vs 2/(x-y)", { type: "expr", expected: "2/(x-y)" }, "1/(x-y)"],
    ["A9 'y^2' vs x^2", { type: "expr", expected: "x^2" }, "y^2"],
    ["A10 celda matriz 'x-y' vs 0", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] }, [["x-y"]]],
    ["O1 polinomio anulador 8-ptos vs 5", { type: "expr", expected: "5" }, "5+" + vanish],
    ["O2 polinomio anulador 8-ptos vs 0", { type: "expr", expected: "0" }, vanish],
    ["O3 alias wrap-around 9 vars vs 4-s-t", t4["T4-N3"], "4-s-t+0*(v1+v2+v3+v4+v5+v6)+(s-v7)"],
    ["O4 celda matriz + anulador vs 0", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] }, [[vanish]]],
    ["O5 exprset T4-M5 'i+anulador'", t4["T4-M5"], "i+(" + vanish + ");-i"],
    ["O3b wrap 20 vars 'v0-v8' vs 0", { type: "expr", expected: "0" }, "v0-v8"],
    ["J8 'x*inf' vs x", { type: "expr", expected: "x" }, "x*inf"],
    ["J9 '1/(x-x)+5' vs 5", { type: "expr", expected: "5" }, "1/(x-x)+5"],
    ["J10 '5+0*(x-x)/(x-x)' vs 5", { type: "expr", expected: "5" }, "5+0*(x-x)/(x-x)"],
    ["P30 anulador a ciegas prod(x-k) vs 0",
      { type: "expr", expected: "0" },
      Array.from({ length: 30 }, (_, k) => "(x-" + (k + 1) + ")").join("*")],
  ],
  H_REGION: [
    ["E1 '5+log(exp(x))-x' vs 5", { type: "expr", expected: "5" }, "5+log(exp(x))-x"],
    ["E1b '5+3*(log(exp(x))-x)' vs 5", { type: "expr", expected: "5" }, "5+3*(log(exp(x))-x)"],
    ["E3 T4-N3 '4-s-t+log(exp(s))-s'", t4["T4-N3"], "4-s-t+log(exp(s))-s"],
    ["E4 celda matriz 'log(exp(x))-x' vs 0", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] }, [["log(exp(x))-x"]]],
    ["E5 exprset T4-M5 'i+log(exp(x))-x'", t4["T4-M5"], "i+log(exp(x))-x;-i"],
    ["E6 'log(exp(x))' vs x", { type: "expr", expected: "x" }, "log(exp(x))"],
    ["E8 'log(exp(x))-x' vs 0 (anulador puro)", { type: "expr", expected: "0" }, "log(exp(x))-x"],
  ],
  H_BRANCH: [
    ["L1 'log(exp(4-s-t))' vs 4-s-t (T4-N3)", t4["T4-N3"], "log(exp(4-s-t))"],
    ["L2 'sqrt(x^2)' vs x", { type: "expr", expected: "x" }, "sqrt(x^2)"],
    ["L3 'log(x^2)' vs 2*log(x)", { type: "expr", expected: "2*log(x)" }, "log(x^2)"],
    ["L4 'log(x)+log(y)' vs log(x*y)", { type: "expr", expected: "log(x*y)" }, "log(x)+log(y)"],
  ],
  EQUIV: [
    ["B1 '1/2' vs 0.5", { type: "expr", expected: "0.5" }, "1/2"],
    ["B2 '2i' vs 2*i", { type: "expr", expected: "2*i" }, "2i"],
    ["B3 '0,5' vs 1/2", { type: "expr", expected: "1/2" }, "0,5"],
    ["B4 '(2+11i)/5' vs 2/5+11/5*i", { type: "expr", expected: "2/5+11/5*i" }, "(2+11i)/5"],
    ["B5 'sqrt(3)/2' vs 3^0.5/2", { type: "expr", expected: "3^0.5/2" }, "sqrt(3)/2"],
    ["B6 'π/3' vs pi/3", { type: "expr", expected: "pi/3" }, "\u03c0/3"],
    ["B8 matriz '1/2' vs 0.5", { type: "matrix", rows: 1, cols: 1, expected: [["0.5"]] }, [["1/2"]]],
    ["B10 exprset orden '-2;4' vs ['4','-2']", { type: "exprset", expected: ["4", "-2"] }, "-2;4"],
    ["B11 '1e3' vs 1000", { type: "expr", expected: "1000" }, "1e3"],
    ["B12 '5!' vs 120", { type: "expr", expected: "120" }, "5!"],
    ["B13 '-2^2' vs -4", { type: "expr", expected: "-4" }, "-2^2"],
    ["B14 '2sqrt(3)' vs 2*sqrt(3)", { type: "expr", expected: "2*sqrt(3)" }, "2sqrt(3)"],
    ["B17 '3,14' vs 3.14", { type: "expr", expected: "3.14" }, "3,14"],
    ["D1 'sqrt(2)/2' vs 1/sqrt(2)", { type: "expr", expected: "1/sqrt(2)" }, "sqrt(2)/2"],
    ["D3 'i^2' vs -1", { type: "expr", expected: "-1" }, "i^2"],
    ["D4 '(1+i)^2' vs 2i", { type: "expr", expected: "2i" }, "(1+i)^2"],
    ["D5 '5*pi/6' vs pi*5/6", { type: "expr", expected: "pi*5/6" }, "5*pi/6"],
    ["N2 T4-N3 '4-t-s' reordenado", t4["T4-N3"], "4-t-s"],
    ["N2b T4-N3 '4-(s+t)'", t4["T4-N3"], "4-(s+t)"],
    ["N3 T4-N3 correcto literal", t4["T4-N3"], "4-s-t"],
    ["V1 'exp(log(x))' vs x (identidad en C\\{0})", { type: "expr", expected: "x" }, "exp(log(x))"],
    ["V2 '(x^2-1)/(x-1)' vs x+1", { type: "expr", expected: "x+1" }, "(x^2-1)/(x-1)"],
    ["V3 'conj(x*y)' vs conj(x)*conj(y)", { type: "expr", expected: "conj(x)*conj(y)" }, "conj(x*y)"],
    ["V4 '(x+y)^2' vs x^2+2*x*y+y^2", { type: "expr", expected: "x^2+2*x*y+y^2" }, "(x+y)^2"],
    ["V5 '1/(1/x)' vs x", { type: "expr", expected: "x" }, "1/(1/x)"],
    ["V6 'sqrt(x)^2' vs x", { type: "expr", expected: "x" }, "sqrt(x)^2"],
    ["V7 '(-x)^2' vs x^2", { type: "expr", expected: "x^2" }, "(-x)^2"],
    ["V8 'cos(x)^2+sen(x)^2' vs 1", { type: "expr", expected: "1" }, "cos(x)^2+sen(x)^2"],
    ["V9 'cosh(x)^2-sinh(x)^2' vs 1", { type: "expr", expected: "1" }, "cosh(x)^2-sinh(x)^2"],
    ["V10 '2*(x+y)' vs 2*x+2*y", { type: "expr", expected: "2*x+2*y" }, "2*(x+y)"],
    ["V11 'sen(pi/6)' vs 1/2 (alias)", { type: "expr", expected: "1/2" }, "sen(pi/6)"],
    ["V12 'tg(pi/4)' vs 1 (alias)", { type: "expr", expected: "1" }, "tg(pi/4)"],
    ["V13 matriz 'sqrt(4)' vs 2", { type: "matrix", rows: 1, cols: 1, expected: [["2"]] }, [["sqrt(4)"]]],
    ["V14 T5-E3 celda '3/10' exacta", { type: "expr", expected: "3/10" }, "3/10"],
    ["V15 T1-M2 mod correcto (multi)", t1["T1-M2"], { mod: "2", arg: "5*pi/6" }],
    ["V16 T1-N5 '2.34' redondeo", t1["T1-N5"], "2.34"],
  ],
};

function run1(spec, resp) {
  try { return G.check(spec, resp).ok === true; } catch (e) { return false; }
}

const out = {};
let fallos = 0;
for (const [grupo, casos] of Object.entries(CASES)) {
  console.log("--- " + grupo + " (" + casos.length + " casos × " + N + " runs) ---");
  for (const [nombre, spec, resp] of casos) {
    let acepta = 0;
    for (let i = 0; i < N; i++) if (run1(spec, resp)) acepta++;
    const esperaAceptar = grupo === "EQUIV";
    let veredicto;
    if (esperaAceptar) {
      veredicto = acepta === N ? "OK (200/200 acepta)"
        : acepta === 0 ? "FALLO-FN-ESTABLE (0/200 acepta)"
        : "FALLO-FN-OCASIONAL (" + acepta + "/" + N + " acepta)";
    } else {
      veredicto = acepta === 0 ? "OK (0/200 acepta)"
        : acepta === N ? "FALLO-FP-ESTABLE (200/200 acepta)"
        : "FALLO-FP-OCASIONAL (" + acepta + "/" + N + " acepta)";
    }
    const bien = esperaAceptar ? acepta === N : acepta === 0;
    if (!bien) fallos++;
    out[grupo + " :: " + nombre] = { acepta, n: N, veredicto };
    console.log((bien ? "[OK ] " : "[FALLO] ") + nombre + " → " + veredicto);
  }
}
fs.writeFileSync(path.join(__dirname, "estabilidad-n1.json"), JSON.stringify(out, null, 1));
console.log("\nRESUMEN ESTABILIDAD: " + fallos + " casos inestables o en la dirección errónea (de " +
  Object.values(CASES).reduce((a, c) => a + c.length, 0) + ")");
process.exit(fallos ? 1 : 0);
