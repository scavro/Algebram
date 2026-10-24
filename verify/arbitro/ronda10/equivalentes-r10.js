/* ÁRBITRO R10 · batería de formas EQUIVALENTES (N=100 runs/caso).
   Protocolo R10.2: TODO caso equivalente debe dar 100/100 aceptaciones
   (cero falsos negativos). Contenido:
     - 39 casos históricos EQUIV (batería R5/R6 de n9-estabilidad.js)
     - casos del claim R10 (desarrollos, factorizaciones, orden de términos,
       fracciones/decimales, senx=sin(x), x*x^(-1))
     - identidades trascendentes VERDADERAS nuevas (para auditar la capa
       estructural): exp(log x)≡x, conj(xy)≡conj x·conj y, cos²+sin²≡1,
       sqrt(4x)≡2√x, log(4x)≡log4+logx, orden dentro de átomos, min/max,
       factorial, exponentes fraccionarios verdaderos.
   Salida: equivalentes-r9-math.json + stdout. */
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

const E = (expected) => ({ type: "expr", expected });
const CASES = [
  /* ---- 39 históricos EQUIV (R5/R6) ---- */
  ["HIST-B1 '1/2' vs 0.5", E("0.5"), "1/2"],
  ["HIST-B2 '2i' vs 2*i", E("2*i"), "2i"],
  ["HIST-B3 '0,5' vs 1/2", E("1/2"), "0,5"],
  ["HIST-B4 '(2+11i)/5' vs 2/5+11/5*i", E("2/5+11/5*i"), "(2+11i)/5"],
  ["HIST-B5 'sqrt(3)/2' vs 3^0.5/2", E("sqrt(3)/2"), "3^0.5/2"],
  ["HIST-B6 'π/3' vs pi/3", E("pi/3"), "\u03c0/3"],
  ["HIST-B8 matriz '1/2' vs 0.5", { type: "matrix", rows: 1, cols: 1, expected: [["0.5"]] }, [["1/2"]]],
  ["HIST-B10 exprset '-2;4' vs ['4','-2']", { type: "exprset", expected: ["4", "-2"] }, "-2;4"],
  ["HIST-B11 '1e3' vs 1000", { type: "number", expected: "1000", exact: true }, "1e3"],
  ["HIST-B12 '5!' vs 120", { type: "number", expected: "120", exact: true }, "5!"],
  ["HIST-B13 '-2^2' vs -4", E("-4"), "-2^2"],
  ["HIST-B14 '2sqrt(3)' vs 2*sqrt(3)", E("2*sqrt(3)"), "2sqrt(3)"],
  ["HIST-B17 '3,14' vs 3.14", { type: "number", expected: "3.14" }, "3,14"],
  ["HIST-D1 'sqrt(2)/2' vs 1/sqrt(2)", E("1/sqrt(2)"), "sqrt(2)/2"],
  ["HIST-D3 'i^2' vs -1", E("-1"), "i^2"],
  ["HIST-D4 '(1+i)^2' vs 2i", E("2*i"), "(1+i)^2"],
  ["HIST-D5 '5*pi/6' vs pi*5/6", E("pi*5/6"), "5*pi/6"],
  ["HIST-N2 T4-N3 '4-t-s' reordenado", t4["T4-N3"], "4-t-s"],
  ["HIST-N2b T4-N3 '4-(s+t)'", t4["T4-N3"], "4-(s+t)"],
  ["HIST-N3 T4-N3 literal", t4["T4-N3"], "4-s-t"],
  ["HIST-V1 'exp(log(x))' vs x (identidad en C\\{0})", E("x"), "exp(log(x))"],
  ["HIST-V2 '(x^2-1)/(x-1)' vs x+1", E("x+1"), "(x^2-1)/(x-1)"],
  ["HIST-V3 'conj(x*y)' vs conj(x)*conj(y)", E("conj(x)*conj(y)"), "conj(x*y)"],
  ["HIST-V4 '(x+y)^2' vs x^2+2xy+y^2", E("x^2+2*x*y+y^2"), "(x+y)^2"],
  ["HIST-V5 '1/(1/x)' vs x", E("x"), "1/(1/x)"],
  ["HIST-V6 'sqrt(x)^2' vs x", E("x"), "sqrt(x)^2"],
  ["HIST-V7 '(-x)^2' vs x^2", E("x^2"), "(-x)^2"],
  ["HIST-V8 'cos(x)^2+sen(x)^2' vs 1", E("1"), "cos(x)^2+sen(x)^2"],
  ["HIST-V9 'cosh(x)^2-sinh(x)^2' vs 1", E("1"), "cosh(x)^2-sinh(x)^2"],
  ["HIST-V10 '2*(x+y)' vs 2*x+2*y", E("2*x+2*y"), "2*(x+y)"],
  ["HIST-V11 'sen(pi/6)' vs 1/2", E("1/2"), "sen(pi/6)"],
  ["HIST-V12 'tg(pi/4)' vs 1", E("1"), "tg(pi/4)"],
  ["HIST-V13 matriz 'sqrt(4)' vs 2", { type: "matrix", rows: 1, cols: 1, expected: [["2"]] }, [["sqrt(4)"]]],
  ["HIST-V14 '3/10' vs 3/10", E("3/10"), "3/10"],
  ["HIST-V15 T1-M2 mod/arg correctos", t1["T1-M2"], { mod: "2", arg: "5*pi/6" }],
  ["HIST-V16 T1-N5 '2.34' redondeo", t1["T1-N5"], "2.34"],
  ["HIST-V17 'senx' vs sin(x)", E("sin(x)"), "senx"],
  ["HIST-V18 'log2' vs log(2)", E("log(2)"), "log2"],
  ["HIST-V19 'sqrt4' vs 2", E("2"), "sqrt4"],

  /* ---- claim R10: formas algebraicas ---- */
  ["R10-C1 '(x+1)^2' vs x^2+2*x+1", E("x^2+2*x+1"), "(x+1)^2"],
  ["R10-C2 'x*x^(-1)' vs 1", E("1"), "x*x^(-1)"],
  ["R10-C3 'x^(-2)' vs 1/(x^2)", E("1/(x^2)"), "x^(-2)"],
  ["R10-C4 'x+y+z' vs 'z+y+x' (orden)", E("z+y+x"), "x+y+z"],
  ["R10-C5 '0.5*x' vs x/2 (fracción/decimal)", E("x/2"), "0.5*x"],
  ["R10-C6 '(x-1)*(x+1)' vs x^2-1", E("x^2-1"), "(x-1)*(x+1)"],
  ["R10-C7 'x^3-x' vs 'x*(x-1)*(x+1)'", E("x*(x-1)*(x+1)"), "x^3-x"],
  ["R10-C8 '1/(x*x)' vs x^(-2)", E("x^(-2)"), "1/(x*x)"],

  /* ---- NUEVAS: identidades trascendentes VERDADERAS ---- */
  ["NEW-T1 'sqrt(4*x)' vs 2*sqrt(x) (4>0)", E("2*sqrt(x)"), "sqrt(4*x)"],
  ["NEW-T2 'log(4*x)' vs log(4)+log(x) (4>0)", E("log(4)+log(x)"), "log(4*x)"],
  ["NEW-T3 'log(sqrt(x))' vs log(x)/2", E("log(x)/2"), "log(sqrt(x))"],
  ["NEW-T4 'sqrt(9*x)' vs 3*sqrt(x)", E("3*sqrt(x)"), "sqrt(9*x)"],
  ["NEW-T5 'exp(log(x))' vs x con x sustituida (log(exp(0))=0)", E("2"), "exp(log(2))"],

  /* ---- NUEVAS: orden/serialización DENTRO de átomos (misma expresión) ---- */
  ["NEW-A1 'log(x+y)' vs 'log(y+x)'", E("log(y+x)"), "log(x+y)"],
  ["NEW-A2 'log(2*x)' vs 'log(x*2)'", E("log(x*2)"), "log(2*x)"],
  ["NEW-A3 'sin(x+y)' vs 'sin(y+x)'", E("sin(y+x)"), "sin(x+y)"],
  ["NEW-A4 'log(x/2)' vs 'log(x*0.5)'", E("log(x*0.5)"), "log(x/2)"],
  ["NEW-A5 'log(x*(y+z))' vs 'log((y+z)*x)'", E("log((y+z)*x)"), "log(x*(y+z))"],
  ["NEW-A6 'sin(2*x)' vs 'sin(x*2)'", E("sin(x*2)"), "sin(2*x)"],
  ["NEW-A7 'exp(x+y)' vs 'exp(y+x)'", E("exp(y+x)"), "exp(x+y)"],
  ["NEW-A8 'sqrt(x+y)' vs 'sqrt(y+x)'", E("sqrt(y+x)"), "sqrt(x+y)"],
  ["NEW-A9 'abs(x*y)' vs 'abs(y*x)'", E("abs(y*x)"), "abs(x*y)"],
  ["NEW-A10 'log(0.1*x)' vs 'log(x/10)' (10>0)", E("log(x/10)"), "log(0.1*x)"],

  /* ---- NUEVAS: min/max/fact ---- */
  ["NEW-F1 'min(x,y)' vs 'min(y,x)'", E("min(y,x)"), "min(x,y)"],
  ["NEW-F2 'max(x,y,z)' vs 'max(z,y,x)'", E("max(z,y,x)"), "max(x,y,z)"],
  ["NEW-F3 '5!' vs 120 (expr)", E("120"), "5!"],
  ["NEW-F4 'x!' vs 'fact(x)'", E("fact(x)"), "x!"],
  ["NEW-F5 'min(2,3)' vs 2", E("2"), "min(2,3)"],

  /* ---- NUEVAS: exponentes fraccionarios VERDADEROS ---- */
  ["NEW-P1 'x^(3/2)' vs 'x*sqrt(x)'", E("x*sqrt(x)"), "x^(3/2)"],
  ["NEW-P2 'x^(2/3)' vs '(x^(1/3))^2'", E("(x^(1/3))^2"), "x^(2/3)"],
  ["NEW-P3 'x^(-1/2)' vs '1/sqrt(x)'", E("1/sqrt(x)"), "x^(-1/2)"],
  ["NEW-P4 'x^(0.5)' vs 'sqrt(x)'", E("sqrt(x)"), "x^0.5"],
  ["NEW-P5 '(sqrt(x))^4' vs 'x^2'", E("x^2"), "(sqrt(x))^4"],
  ["NEW-P6 'x^(4/2)' vs 'x^2'", E("x^2"), "x^(4/2)"],

  /* ---- NUEVAS: i/alias de constantes ---- */
  ["NEW-I1 'x*j' vs 'x*i' (alias)", E("x*i"), "x*j"],
  ["NEW-I2 'x*I' vs 'x*i' (alias)", E("x*i"), "x*I"],
  ["NEW-I3 'i*2' vs '2*i'", E("2*i"), "i*2"],
  ["NEW-I4 'ii' vs '-1' (i*i)", E("-1"), "ii"],
  ["NEW-I5 'e' vs 'exp(1)'", E("exp(1)"), "e"],
];

const out = {};
let fnTotal = 0;
for (const [nombre, spec, resp] of CASES) {
  let acepta = 0;
  for (let i = 0; i < N; i++) {
    let r;
    try { r = G.check(spec, resp); } catch (e) { r = { ok: false }; }
    if (r.ok === true) acepta++;
  }
  const esFN = acepta < N;
  if (esFN) fnTotal++;
  out[nombre] = { acepta, n: N, falsoNegativo: esFN };
  console.log((esFN ? "FN!!" : "OK  ") + " | " + String(acepta).padStart(4) + "/" + N +
    " | " + nombre);
}
fs.writeFileSync(path.join(__dirname, "equivalentes-r9-math.json"),
  JSON.stringify({ N, casos: out }, null, 1));
console.log("\nRESUMEN: " + fnTotal + " casos con falsos negativos de " + CASES.length +
  " (N=" + N + " runs/caso).");
process.exit(0);
