/* ÁRBITRO R10 · batería hostil completa (R1–R7) contra el grader con capa
   estructural (toRationalPoly + structurallyEqual). N=200 runs/caso.
   Protocolo R10.1: TODO caso hostil debe dar 0 aceptaciones (cero falsos
   positivos). Sets:
     H_LOGEXP  anuladores log(exp(v))-v (N9) — 18 casos R6
     H_FIJO    O1–O5, A1–A10, J8–J10, P30, wrap-around (17 casos R6)
     H_BRANCH  alias de rama simples log/sqrt/arg (L1–L12)
     H_SHIFT   familia N9r DESPLAZADA R7 (M0–M13): u=f(x)+c
     H_NEGEXP  exponentes negativos y átomos compuestos (NUEVOS)
   Salida: bateria-hostil-r9-math.json + stdout. */
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
const P = [
  "0.371+0.217i", "-1.283+0.619i", "2.117-0.733i", "-0.519-1.341i",
  "1.618+1.173i", "-2.271+0.451i", "0.829-2.137i", "3.041-0.617i",
];
const vanish = P.map((p) => "(x-(" + p + "))").join("*");
const grindExpr = (E) => E + "+log(u)+log(v)-log(u*v)";
const grindSqrt = (E) => E + "+sqrt(u*v)-sqrt(u)*sqrt(v)";
const grind = (E) => E + "+log(u)+log(v)-log(u*v)";

const CASES = {
  H_LOGEXP: [
    ["E1 '5+log(exp(x))-x' vs 5", spec5, "5+log(exp(x))-x"],
    ["E1b '5+3*(log(exp(x))-x)' vs 5", spec5, "5+3*(log(exp(x))-x)"],
    ["E8 'log(exp(x))-x' vs 0", { type: "expr", expected: "0" }, "log(exp(x))-x"],
    ["E9 '0+log(exp(x))-x' vs 0", { type: "expr", expected: "0" }, "0+log(exp(x))-x"],
    ["E10 'log(exp(x))' vs x", { type: "expr", expected: "x" }, "log(exp(x))"],
    ["E11 '5+(log(exp(x))-x)^2' vs 5", spec5, "5+(log(exp(x))-x)^2"],
    ["E12 'log(exp(x))-x' vs 0", { type: "expr", expected: "0" }, "log(exp(x))-x"],
    ["E3 T4-N3 '4-s-t+log(exp(s))-s'", t4["T4-N3"], "4-s-t+log(exp(s))-s"],
    ["F1 T4-N3 '4-s-t+log(exp(v))-v'", t4["T4-N3"], "4-s-t+log(exp(v))-v"],
    ["F2 T4-N3 '+log(exp(v))-v+log(exp(w))-w'", t4["T4-N3"],
      "4-s-t+log(exp(v))-v+log(exp(w))-w"],
    ["F3 T5-N5 celdas +log(exp(v))-v", t5["T5-N5"],
      t5["T5-N5"].expected.map((row) => row.map((c) => c + "+log(exp(v))-v"))],
    ["F4 T4-M5 'i+log(exp(v))-v;-i'", t4["T4-M5"], "i+log(exp(v))-v;-i"],
    ["F5 spec5 '5+log(exp(v))-v'", spec5, "5+log(exp(v))-v"],
    ["F6 multi T1-M2 mod +log(exp(v))-v", t1["T1-M2"],
      { mod: "2+log(exp(v))-v", arg: "5*pi/6" }],
    ["E4 celda 'log(exp(x))-x' vs 0", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] },
      [["log(exp(x))-x"]]],
    ["E5 exprset 'i+log(exp(x))-x;-i'", t4["T4-M5"], "i+log(exp(x))-x;-i"],
    ["E6 'log(exp(x))' vs x", { type: "expr", expected: "x" }, "log(exp(x))"],
    ["G1 'log(exp(log(exp(x))))' vs x", { type: "expr", expected: "x" }, "log(exp(log(exp(x))))"],
  ],
  H_FIJO: [
    ["O1 anulador 8-ptos vs 5", spec5, "5+" + vanish],
    ["O2 anulador 8-ptos vs 0", { type: "expr", expected: "0" }, vanish],
    ["O3 alias wrap 9 vars vs 4-s-t", t4["T4-N3"],
      "4-s-t+0*(v1+v2+v3+v4+v5+v6)+(s-v7)"],
    ["O4 celda + anulador vs 0", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] },
      [[vanish]]],
    ["O5 exprset 'i+anulador;-i'", t4["T4-M5"], "i+(" + vanish + ");-i"],
    ["A1 'x-y' vs 0", { type: "expr", expected: "0" }, "x-y"],
    ["A10 celda 'x-y' vs 0", { type: "matrix", rows: 1, cols: 1, expected: [["0"]] }, [["x-y"]]],
    ["O3b wrap 20 vars 'v0-v8' vs 0", { type: "expr", expected: "0" }, "v0-v8"],
    ["A4 '4-2*t' vs 4-s-t", t4["T4-N3"], "4-2*t"],
    ["A5 '4-s-t+(s-t)' vs 4-s-t", t4["T4-N3"], "4-s-t+(s-t)"],
    ["A6 '1/(x-x)' vs 5", spec5, "1/(x-x)"],
    ["A8 '1/(x-y)' vs 2/(x-y)", { type: "expr", expected: "2/(x-y)" }, "1/(x-y)"],
    ["A9 'y^2' vs x^2", { type: "expr", expected: "x^2" }, "y^2"],
    ["J8 'x*inf' vs x", { type: "expr", expected: "x" }, "x*inf"],
    ["J9 '1/(x-x)+5' vs 5", spec5, "1/(x-x)+5"],
    ["J10 '5+0*(x-x)/(x-x)' vs 5", spec5, "5+0*(x-x)/(x-x)"],
    ["P30 anulador ciego prod(x-k) vs 0", { type: "expr", expected: "0" },
      Array.from({ length: 30 }, (_, k) => "(x-" + (k + 1) + ")").join("*")],
  ],
  H_BRANCH: [
    ["L1 'log(exp(4-s-t))' vs 4-s-t", t4["T4-N3"], "log(exp(4-s-t))"],
    ["L2 'sqrt(x^2)' vs x", { type: "expr", expected: "x" }, "sqrt(x^2)"],
    ["L3 'log(x^2)' vs 2*log(x)", { type: "expr", expected: "2*log(x)" }, "log(x^2)"],
    ["L4 'log(x)+log(y)' vs log(x*y)", { type: "expr", expected: "log(x*y)" }, "log(x)+log(y)"],
    ["L5 'log(exp(2*x))/2' vs x", { type: "expr", expected: "x" }, "log(exp(2*x))/2"],
    ["L6 'acos(cos(x))' vs x", { type: "expr", expected: "x" }, "acos(cos(x))"],
    ["L7 'sqrt(x*y)' vs sqrt(x)*sqrt(y)", { type: "expr", expected: "sqrt(x)*sqrt(y)" }, "sqrt(x*y)"],
    ["L8 'arg(x*y)' vs arg(x)+arg(y)", { type: "expr", expected: "arg(x)+arg(y)" }, "arg(x*y)"],
    ["L9 T4-N3 grind log-product", t4["T4-N3"], grindExpr("4-s-t")],
    ["L10 T5-N5 grind sqrt celdas", t5["T5-N5"],
      t5["T5-N5"].expected.map((row) => row.map((c) => grindSqrt(c)))],
    ["L11 T4-M5 grind log exprset", t4["T4-M5"], "i+" + grindExpr("0") + ";-i"],
    ["L12 spec5 grind log-product", spec5, grindExpr("5")],
  ],
  H_SHIFT: [
    ["M0 naive '5+log(u)+log(v)-log(u*v)' vs 5", spec5, grind("5")],
    ["M0b naive 'log(x)+log(y)' vs log(x*y)", { type: "expr", expected: "log(x*y)" },
      "log(x)+log(y)"],
    ["M1 c=3.5 '5+2log(x+3.5)-log((x+3.5)^2)' vs 5", spec5,
      "5+2*log(x+3.5)-log((x+3.5)^2)"],
    ["M2 c=3.5 T4-N3 '4-s-t+2log(s+3.5)-log((s+3.5)^2)'", t4["T4-N3"],
      "4-s-t+2*log(s+3.5)-log((s+3.5)^2)"],
    ["M3 c=3.1 '5+2log(x+3.1)-log((x+3.1)^2)' vs 5", spec5,
      "5+2*log(x+3.1)-log((x+3.1)^2)"],
    ["M4 c=4.5 '5+2log(x+4.5)-log((x+4.5)^2)' vs 5", spec5,
      "5+2*log(x+4.5)-log((x+4.5)^2)"],
    ["M5 c=5 '5+log(x+5)+log(y+5)-log((x+5)(y+5))' vs 5", spec5,
      "5+log(x+5)+log(y+5)-log((x+5)*(y+5))"],
    ["M6 c=5 '5+2log(x+5)-log((x+5)^2)' vs 5", spec5,
      "5+2*log(x+5)-log((x+5)^2)"],
    ["M7 c=5 sqrt '5+sqrt((x+5)(y+5))-sqrt(x+5)sqrt(y+5)' vs 5", spec5,
      "5+sqrt((x+5)*(y+5))-sqrt(x+5)*sqrt(y+5)"],
    ["M8 c=5 arg '5+arg((x+5)(y+5))-arg(x+5)-arg(y+5)' vs 5", spec5,
      "5+arg((x+5)*(y+5))-arg(x+5)-arg(y+5)"],
    ["M9 c=5 T4-N3 universal", t4["T4-N3"],
      "4-s-t+log(s+5)+log(t+5)-log((s+5)*(t+5))"],
    ["M10 c=5 T4-M5 exprset", t4["T4-M5"],
      "i+log(s+5)+log(t+5)-log((s+5)*(t+5));-i"],
    ["M11 c=5 T5-N5 matriz", t5["T5-N5"],
      t5["T5-N5"].expected.map((row) => row.map((c) =>
        c + "+log(s+5)+log(t+5)-log((s+5)*(t+5))"))],
    ["M12 escala '5+log(exp((x+5)/20))-(x+5)/20' vs 5", spec5,
      "5+log(exp((x+5)/20))-(x+5)/20"],
    ["M13 naive '5+log(exp(v))-v' vs 5", spec5, "5+log(exp(v))-v"],
  ],
  H_NEGEXP: [
    ["X1 'log(x^(-1))' vs -log(x) (falsa)", { type: "expr", expected: "-log(x)" },
      "log(x^(-1))"],
    ["X2 'x^(-1)+y^(-1)' vs (x*y)^(-1) (falsa)", { type: "expr", expected: "(x*y)^(-1)" },
      "x^(-1)+y^(-1)"],
    ["X3 'log(x*y*z)' vs log(x)+log(y)+log(z) (compuesto)", { type: "expr", expected: "log(x)+log(y)+log(z)" },
      "log(x*y*z)"],
    ["X4 'sqrt(x)sqrt(y)sqrt(z)' vs sqrt(x*y*z) (compuesto)", { type: "expr", expected: "sqrt(x*y*z)" },
      "sqrt(x)*sqrt(y)*sqrt(z)"],
    ["X5 'log(x+log(y))' vs log(x)+log(y) (átomos compuestos)", { type: "expr", expected: "log(x)+log(y)" },
      "log(x+log(y))"],
    ["X6 'x^(1/2)*y^(1/2)' vs (x*y)^(1/2) (fraccionario)", { type: "expr", expected: "(x*y)^(1/2)" },
      "x^(1/2)*y^(1/2)"],
    ["X7 'log(x^3)' vs 3*log(x)", { type: "expr", expected: "3*log(x)" }, "log(x^3)"],
    ["X8 'arg(x^2)' vs 2*arg(x)", { type: "expr", expected: "2*arg(x)" }, "arg(x^2)"],
    ["X9 'asin(sin(x))' vs x", { type: "expr", expected: "x" }, "asin(sin(x))"],
    ["X10 'x^(-2)' vs x^2 (signo de exponente)", { type: "expr", expected: "x^2" }, "x^(-2)"],
    ["X11 '(x*y)^(-1)*x' vs y", { type: "expr", expected: "y" }, "(x*y)^(-1)*x"],
    ["X12 'log(x^(-2))' vs -2*log(x) (falsa, compuesta)", { type: "expr", expected: "-2*log(x)" },
      "log(x^(-2))"],
    ["X13 'sqrt(x^2*y)' vs x*sqrt(y) (falsa)", { type: "expr", expected: "x*sqrt(y)" },
      "sqrt(x^2*y)"],
    ["X14 'exp(log(x)*2)' vs x^2 (falsa por rama)", { type: "expr", expected: "x^2" },
      "exp(2*log(x))"],
  ],
};

const out = {};
let fpTotal = 0, casosTotal = 0;
for (const [grupo, casos] of Object.entries(CASES)) {
  console.log("--- " + grupo + " (" + casos.length + " casos × " + N + " runs) ---");
  for (const [nombre, spec, resp] of casos) {
    let acepta = 0;
    for (let i = 0; i < N; i++) {
      let r;
      try { r = G.check(spec, resp); } catch (e) { r = { ok: false }; }
      if (r.ok === true) acepta++;
    }
    const esFP = acepta > 0;
    if (esFP) fpTotal++;
    casosTotal++;
    out[nombre] = { grupo, acepta, n: N, falsoPositivo: esFP };
    console.log((esFP ? "FP!!" : "OK  ") + " | " + String(acepta).padStart(4) + "/" + N +
      " | " + nombre);
  }
}
fs.writeFileSync(path.join(__dirname, "bateria-hostil-r9-math.json"),
  JSON.stringify({ N, casos: out }, null, 1));
console.log("\nRESUMEN: " + fpTotal + " casos con falsos positivos de " + casosTotal +
  " (N=" + N + " runs/caso).");
process.exit(0);
