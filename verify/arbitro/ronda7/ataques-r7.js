/* ÁRBITRO R7 · ataques frescos contra el mecanismo de puntos-sonda (N=300/caso).
   Motivo: los PROBES de grader.js son FIJOS, públicos y asignan el MISMO valor
   a todas las variables. Se prueba la familia N9r (reglas de producto de rama y
   log(exp)) con variantes DESPLAZADAS u = f(x)+c que esquivan los 5 sondas:
   - la diferencia de rama puede seguir estando DENTRO de la caja de muestreo
     (re∈[-4.57,4.57]) → falso positivo OCASIONAL grindable;
   - o quedar FUERA de la caja → falso positivo DETERMINISTA.
   Cada caso lleva un testigo explícito de NO-equivalencia (punto donde las
   expresiones difieren, calculado con G.evaluate) para descartar falsos
   positivos de esta auditoría. */
const G = require("../../../assets/js/grader.js");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const N = 300;
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
const t4 = load("tema-4"), t5 = load("tema-5");

const spec5 = { type: "expr", expected: "5" };
const grind = (E) => E + "+log(u)+log(v)-log(u*v)";

/* --- testigos de no-equivalencia: evalúa A y B en un punto y compara --- */
function testigo(label, exprA, exprB, env) {
  let a, b;
  try {
    a = G.evaluate(exprA, env);
    b = G.evaluate(exprB, env);
  } catch (e) {
    console.log("TESTIGO-ERROR | " + label + ": " + e.message);
    return false;
  }
  const d = Math.hypot(a.re - b.re, a.im - b.im);
  const ok = Number.isFinite(d) && d > 1e-6;
  console.log((ok ? "TESTIGO-OK  " : "TESTIGO-FALLO") + " | " + label +
    " | A=" + a.re + (a.im >= 0 ? "+" : "") + a.im + "i" +
    " B=" + b.re + (b.im >= 0 ? "+" : "") + b.im + "i" +
    " | |A-B|=" + d.toExponential(3));
  return ok;
}

const CASES = [
  /* familia N9r naive (materia de la R6) — debe morir con las sondas */
  ["M0 naive '5+log(u)+log(v)-log(u*v)' vs 5 (controles R6)", spec5, grind("5"), null],
  ["M0b naive 'log(x)+log(y)' vs log(x*y)", { type: "expr", expected: "log(x*y)" }, "log(x)+log(y)", null],

  /* familia N9r DESPLAZADA dentro de caja (grindable) */
  ["M1 c=3.5 '5+2log(x+3.5)-log((x+3.5)^2)' vs 5", spec5,
    "5+2*log(x+3.5)-log((x+3.5)^2)", { x: { re: -4.2, im: 0 } }],
  ["M2 c=3.5 T4-N3 '4-s-t+2log(s+3.5)-log((s+3.5)^2)'", t4["T4-N3"],
    "4-s-t+2*log(s+3.5)-log((s+3.5)^2)", { s: { re: -4.2, im: 0 }, t: { re: 0, im: 0 } }],
  ["M3 c=3.1 '5+2log(x+3.1)-log((x+3.1)^2)' vs 5", spec5,
    "5+2*log(x+3.1)-log((x+3.1)^2)", { x: { re: -4.2, im: 0 } }],
  ["M4 c=4.5 '5+2log(x+4.5)-log((x+4.5)^2)' vs 5", spec5,
    "5+2*log(x+4.5)-log((x+4.5)^2)", { x: { re: -4.55, im: 0 } }],

  /* familia N9r DESPLAZADA fuera de caja (determinista) */
  ["M5 c=5 '5+log(x+5)+log(y+5)-log((x+5)*(y+5))' vs 5", spec5,
    "5+log(x+5)+log(y+5)-log((x+5)*(y+5))", { x: { re: -6, im: 0 }, y: { re: -6, im: 0 } }],
  ["M6 c=5 '5+2log(x+5)-log((x+5)^2)' vs 5", spec5,
    "5+2*log(x+5)-log((x+5)^2)", { x: { re: -6, im: 0 } }],
  ["M7 c=5 sqrt '5+sqrt((x+5)*(y+5))-sqrt(x+5)*sqrt(y+5)' vs 5", spec5,
    "5+sqrt((x+5)*(y+5))-sqrt(x+5)*sqrt(y+5)", { x: { re: -6, im: 0 }, y: { re: -6, im: 0 } }],
  ["M8 c=5 arg '5+arg((x+5)*(y+5))-arg(x+5)-arg(y+5)' vs 5", spec5,
    "5+arg((x+5)*(y+5))-arg(x+5)-arg(y+5)", { x: { re: -6, im: 0 }, y: { re: -6, im: 0 } }],
  ["M9 c=5 T4-N3 universal '4-s-t+log(s+5)+log(t+5)-log((s+5)*(t+5))'", t4["T4-N3"],
    "4-s-t+log(s+5)+log(t+5)-log((s+5)*(t+5))", { s: { re: -6, im: 0 }, t: { re: -6, im: 0 } }],
  ["M10 c=5 T4-M5 exprset 'i+log(s+5)+log(t+5)-log(...);-i'", t4["T4-M5"],
    "i+log(s+5)+log(t+5)-log((s+5)*(t+5));-i", { s: { re: -6, im: 0 }, t: { re: -6, im: 0 } },
    ["i+log(s+5)+log(t+5)-log((s+5)*(t+5))", "i"]],
  ["M11 c=5 matriz T5-N5 celda + exploit log-product", t5["T5-N5"],
    t5["T5-N5"].expected.map((row) => row.map((c) =>
      c + "+log(s+5)+log(t+5)-log((s+5)*(t+5))")),
    { s: { re: -6, im: 0 }, t: { re: -6, im: 0 } },
    ["1/2+log(s+5)+log(t+5)-log((s+5)*(t+5))", "1/2"]],

  /* familia N9 log(exp) DESPLAZADA/escalada fuera de caja (determinista) */
  ["M12 escala '5+log(exp((x+5)/20))-(x+5)/20' vs 5", spec5,
    "5+log(exp((x+5)/20))-(x+5)/20", { x: { re: -5, im: 80 } }],
  ["M13 naive '5+log(exp(v))-v' vs 5 (control R6)", spec5,
    "5+log(exp(v))-v", null],
];

const out = {};
let fp = 0, tests = 0, testsOk = 0;
for (const [nombre, spec, resp, env, witPair] of CASES) {
  if (!spec) continue;
  let acepta = 0;
  for (let i = 0; i < N; i++) {
    let r;
    try { r = G.check(spec, resp); } catch (e) { r = { ok: false }; }
    if (r.ok === true) acepta++;
  }
  const fpRate = (acepta / N * 100).toFixed(1) + "%";
  const control = nombre.startsWith("M0") || nombre.startsWith("M13");
  let wit = null;
  if (!control && env) {
    const A = witPair ? witPair[0] : resp;
    const B = witPair ? witPair[1] : (typeof spec.expected === "string" ? spec.expected : null);
    if (B !== null) {
      tests++;
      if (testigo(nombre, A, B, env)) testsOk++;
    }
  }
  const esFP = !control && acepta > 0;
  if (esFP) fp++;
  out[nombre] = { acepta, n: N, tasa: fpRate, falsoPositivo: esFP, testigo: testsOk + "/" + tests };
  console.log((esFP ? "FP!!" : "OK  ") + " | " + String(acepta).padStart(4) + "/" + N +
    " (" + fpRate + ") | " + nombre);
}

fs.writeFileSync(path.join(__dirname, "ataques-r7.json"),
  JSON.stringify({ N, casos: out }, null, 1));
console.log("\nRESUMEN ataques frescos: " + fp + " casos con falsos positivos de " +
  Object.keys(out).length + " (N=" + N + " runs/caso).");
process.exit(0);
