/* Completado del grupo G5_DOS de ataques-finales-r10 (la batería se colgó en
   los casos DoS). Cada caso corre en su propio proceso con timeout de 20 s:
   los casos que no terminan se clasifican TIMEOUT (congelación = N15r). */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const N = 20;
const TIMEOUT_MS = 20000;

const RUNNER = `
const G = require(${JSON.stringify(path.join(__dirname, "../../../assets/js/grader.js"))});
const spec = JSON.parse(process.argv[1]);
const resp = process.argv[2];
const n = parseInt(process.argv[3], 10);
let acepta = 0, err = 0;
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  let r;
  try { r = G.check(spec, resp); } catch (e) { r = { ok: false }; err++; }
  if (r.ok === true) acepta++;
}
process.stdout.write(JSON.stringify({ acepta, n, err, ms: Date.now() - t0 }));
`;

const E = (expected) => ({ type: "expr", expected });
const ACEPTAR = true, RECHAZAR = false;

const v3999 = Array.from({ length: 3999 }, (_, i) => "x" + (i + 1));
const v4001 = Array.from({ length: 4001 }, (_, i) => "y" + (i + 1));

const CASES = [
  ["M1 suma 3999 monomios vs reordenada — VERDADERA",
    E(v3999.slice().reverse().join("+")), v3999.join("+"), ACEPTAR],
  ["M2 suma 4001 monomios vs reordenada — VERDADERA",
    E(v4001.slice().reverse().join("+")), v4001.join("+"), ACEPTAR],
  ["M3 '(a+b+c+d+e)^15' vs '^14*(a+b+c+d+e)' — VERDADERA (3876 monomios ≤4000)",
    E("(a+b+c+d+e)^14*(a+b+c+d+e)"), "(a+b+c+d+e)^15", ACEPTAR],
  ["M4 '(a+b+c+d+e)^16' vs '^15*(a+b+c+d+e)' — VERDADERA (4845 monomios >4000)",
    E("(a+b+c+d+e)^15*(a+b+c+d+e)"), "(a+b+c+d+e)^16", ACEPTAR],
  ["M5 '(a+b+c+d+e)^16' vs '^15*(a+b+c+d+e)+1' — FALSA",
    E("(a+b+c+d+e)^15*(a+b+c+d+e)+1"), "(a+b+c+d+e)^16", RECHAZAR],
  ["M6 '(a+b+c+d+e)^4096' vs '^4095*(a+b+c+d+e)' — DoS VERDADERA",
    E("(a+b+c+d+e)^4095*(a+b+c+d+e)"), "(a+b+c+d+e)^4096", ACEPTAR],
  ["M7 '(a+b+c+d+e)^4096' vs '^4096+1' — DoS FALSA",
    E("(a+b+c+d+e)^4096+1"), "(a+b+c+d+e)^4096", RECHAZAR],
  ["M8 '(a+b+c+d+e)^4096' vs 0 — DoS FALSA",
    E("0"), "(a+b+c+d+e)^4096", RECHAZAR],
  ["M9 '(a+b+c+d+e)^4096' idénticas — fast-path",
    E("(a+b+c+d+e)^4096"), "(a+b+c+d+e)^4096", ACEPTAR],
  ["M10 '((x+y+z)^64+x)^64' vs '^63*((x+y+z)^64+x)' — DoS anidada VERDADERA",
    E("((x+y+z)^64+x)^63*((x+y+z)^64+x)"), "((x+y+z)^64+x)^64", ACEPTAR],
  ["M11 '(a+b+c+d+e)^15' vs '^15+1' — FALSA (ventana relativa)",
    E("(a+b+c+d+e)^15+1"), "(a+b+c+d+e)^15", RECHAZAR],
  ["M12 '(a+b+c+d+e)^16' vs '^16+1000' — FALSA (ventana relativa)",
    E("(a+b+c+d+e)^16+1000"), "(a+b+c+d+e)^16", RECHAZAR],
  ["M13 'x^100' vs 'x^100+1' — control FALSA (vía estructural, seguro)",
    E("x^100+1"), "x^100", RECHAZAR],
];

const out = {};
let fp = 0, fn = 0, timeouts = 0, crashes = 0;
console.log("--- G5_DOS (" + CASES.length + " casos) completado con timeout " + TIMEOUT_MS + " ms, N=" + N + " ---");
for (const [nombre, spec, resp, esperaAcepta] of CASES) {
  const r = spawnSync(process.execPath, ["-e", RUNNER, JSON.stringify(spec), resp, String(N)],
    { timeout: TIMEOUT_MS + 5000, encoding: "utf8" });
  let info = null;
  if (r.signal) {
    timeouts++;
    out[nombre] = { esperaAcepta, timeout: true };
    console.log("TIMEOUT |    ?/" + N + " | >" + TIMEOUT_MS + " ms | " + nombre);
    continue;
  }
  if (r.status !== 0 && !r.stdout) {
    crashes++;
    out[nombre] = { esperaAcepta, crash: true, stderr: (r.stderr || "").slice(0, 200) };
    console.log("CRASH! |    ?/" + N + " |        | " + nombre + " :: " + (r.stderr || "").split("\n")[0]);
    continue;
  }
  try { info = JSON.parse(r.stdout); } catch (e) {
    timeouts++;
    out[nombre] = { esperaAcepta, timeout: true, raw: (r.stdout || "").slice(0, 100) };
    console.log("TIMEOUT |    ?/" + N + " |        | " + nombre);
    continue;
  }
  const { acepta, n, ms } = info;
  const esFP = !esperaAcepta && acepta > 0;
  const esFN = esperaAcepta && acepta < n;
  if (esFP) fp++;
  if (esFN) fn++;
  out[nombre] = { esperaAcepta, acepta, n, ms, falsoPositivo: esFP, falsoNegativo: esFN };
  console.log((esFP ? "FP!!" : esFN ? "FN!!" : "OK  ") + " | " +
    String(acepta).padStart(4) + "/" + n + " | " + String(ms).padStart(6) + " ms | " + nombre);
}
fs.writeFileSync(path.join(__dirname, "g5-completado.json"),
  JSON.stringify({ N, timeoutMs: TIMEOUT_MS, casos: out }, null, 1));
console.log("\nRESUMEN G5: FP=" + fp + " FN=" + fn + " TIMEOUT=" + timeouts + " CRASH=" + crashes + " de " + CASES.length);
process.exit(0);
