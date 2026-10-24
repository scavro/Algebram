/* ÁRBITRO R8 · medición de la explosión polinómica de la capa estructural
   (hallazgo nuevo desde la R5: `toRationalPoly` expande potencias de sumas).
   Cada caso corre en un proceso hijo con timeout: los que se pasan del timeout
   quedan como FREEZE (la UI real bloquearía el hilo principal en el click de
   «Comprobar»). */
const { spawnSync } = require("child_process");
const path = require("path");

const GRADER = path.join(__dirname, "..", "..", "..", "assets", "js", "grader.js");
const CASES = [
  ["(x+y)^200", 10],
  ["(x+y)^2000", 10],
  ["(x+y)^20000", 15],
  ["(x+y+z)^20", 10],
  ["(x+y+z)^50", 15],
  ["(x+y+z)^100", 30],
  ["(x+y+z)^150", 20],
  ["(x+y+z)^300", 20],
  ["(a+b+c+d)^10", 10],
  ["(a+b+c+d)^20", 15],
  ["(a+b+c+d)^30", 15],
  ["(a+b+c+d)^40", 20],
  ["(a+b+c+d+e+f+g+h)^10", 15],
  ["x^1000000", 10],
  ["(x*y*z)^5000", 10],
];

const script = (expr) => `
const G = require(${JSON.stringify(GRADER)});
const t0 = Date.now();
const r = G.check({ type: "expr", expected: "1" }, ${JSON.stringify(expr)});
console.log(JSON.stringify({ ok: r.ok, ms: Date.now() - t0 }));
`;

let freezes = 0;
console.log("expresión".padEnd(28), "resultado".padEnd(12), "tiempo");
for (const [expr, maxS] of CASES) {
  const res = spawnSync(process.execPath, ["-e", script(expr)], {
    timeout: maxS * 1000,
    encoding: "utf8",
    maxBuffer: 1 << 20,
  });
  if (res.status === 0 && res.stdout.trim()) {
    const out = JSON.parse(res.stdout.trim().split("\n").pop());
    console.log(expr.padEnd(28), (out.ok ? "ACEPTA" : "RECHAZA").padEnd(12), out.ms + "ms");
  } else {
    freezes++;
    console.log(expr.padEnd(28), "FREEZE".padEnd(12), "> " + maxS + "s (proceso matado por timeout)");
  }
}
console.log(`\nDOS-POLY R8: ${freezes}/${CASES.length} casos congelan el proceso (timeout)`);
process.exit(0);
