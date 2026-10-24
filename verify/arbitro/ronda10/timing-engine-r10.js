/* ÁRBITRO R10 · batería de tiempos de motor (anti-DoS, criterio del protocolo:
   ninguna respuesta puede tardar >2 s en comprobarse).
   Cada caso corre en proceso hijo con timeout externo; se registra ms o cap.
   Orquestación: node timing-engine-r10.js [--cap 30000] */
const { spawnSync } = require("child_process");
const path = require("path");

const CAP = Number((process.argv.find((a, i) => process.argv[i - 1] === "--cap") || 30000));
const EX0 = { type: "expr", expected: "0" };
const EX411 = { type: "expr", expected: "4/11" };
const EX4ST = { type: "expr", expected: "4-s-t" };
const EX64 = { type: "expr", expected: "(x+y+z)^64" };

const poly = (n) => Array.from({ length: n }, (_, i) => "x^" + (i + 1)).join("+");
const P2000 = poly(2000);
const P1000 = poly(1000);
const P500 = poly(500);

const casos = [
  /* M2-R8 documentada (R9: 7,6–13,6 s) — ahora con tope POLY_MAX_TERMS */
  ["M2-a (x+y+z)^64 vs 0", EX0, "(x+y+z)^64"],
  ["M2-b (x+y+z)^64 vs (x+y+z)^63*(x+y+z)", { type: "expr", expected: "(x+y+z)^63*(x+y+z)" }, "(x+y+z)^64"],
  ["M2-c (x+y+z)^65 vs 0", EX0, "(x+y+z)^65"],
  ["M2-d (x+y+z)^100 vs 0", EX0, "(x+y+z)^100"],
  ["M2-e (x+y+z)^64 idéntica (atajo na===nb)", EX64, "(x+y+z)^64"],

  /* Familia densa univariante: N·M productos con ≤4000 monomios distintos
     eluden el tope POLY_MAX_TERMS (solo limita el tamaño de SALIDA) */
  ["DOS-a (Σx^k k≤2000)^2 vs 0", EX0, "(" + P2000 + ")^2"],
  ["DOS-b (Σ1000)^4 vs 0", EX0, "(" + P1000 + ")^4"],
  ["DOS-c (Σ500)^8 vs 0", EX0, "(" + P500 + ")^8"],
  ["DOS-d (Σ2000)·(Σ2000) vs 0 (con paréntesis)", EX0, "(" + P2000 + ")*(" + P2000 + ")"],
  ["DOS-e (Σ2000)^2 vs (x+y+z)^64", EX64, "(" + P2000 + ")^2"],

  /* Frontera de exponente y formas racionales */
  ["EXP-a (x+y)^(-4096) vs 0", EX0, "(x+y)^(-4096)"],
  ["EXP-b 1/(x+y)^4096 vs 0", EX0, "1/(x+y)^4096"],
  ["EXP-c 4/11+x^(-65) (veneno R1)", EX411, "4/11+x^(-65)"],
  ["EXP-d x^999999999 vs 0", EX0, "x^999999999"],
  ["EXP-e 9^9^9^9 vs 0", EX0, "9^9^9^9"],

  /* Estructura / parseo */
  ["NIDO-a 2000 paréntesis anidados", EX0, "(".repeat(2000) + "x" + ")".repeat(2000)],
  ["NIDO-b sin anidado ×500", EX0, "sin(".repeat(500) + "x" + ")".repeat(500)],

  /* Controles normales (deben ser instantáneos) */
  ["OK-a 4/11 ≡ 8/22", EX411, "8/22"],
  ["OK-b 4-s-t ≡ -t-s+4", EX4ST, "-t-s+4"],
  ["OK-c 4/11+Δ·x^0.5 (veneno M1-R8)", EX411, "4/11+(log(x+5)+log(y+5)-log((x+5)*(y+5)))*x^0.5"],
  ["OK-d (x-x)/(x-x) (veneno C1-R8)", EX411, "(x-x)/(x-x)"],
  ["OK-e 0^x (veneno R1)", { type: "expr", expected: "1" }, "0^x"],
];

let rojos = 0;
const filas = [];
for (const [label, spec, ans] of casos) {
  const r = spawnSync(process.execPath, [path.join(__dirname, "timing-case-r10.js"), JSON.stringify({ spec, ans, label })], {
    timeout: CAP,
    encoding: "utf8",
  });
  let ms = null, ok = null, err = null;
  if (r.status === 0 && r.stdout) {
    try {
      ({ ms, ok, err } = JSON.parse(r.stdout.trim().split("\n").pop()));
    } catch (e) {
      err = "salida ilegible";
    }
  } else {
    ms = null; // cap agotado
  }
  const lento = ms === null || ms > 2000;
  if (lento) rojos++;
  filas.push({ label, ms, ok, err, lento });
  console.log(
    `${lento ? "✘" : "✔"} ${String(ms === null ? ">cap " + CAP : ms + " ms").padStart(12)} · ok=${ok}${err ? " · " + err : ""} · ${label}`
  );
}
console.log(`\nTIMING-ENGINE R10: ${rojos} casos por encima del presupuesto de 2 s (de ${casos.length})`);
process.exit(rojos ? 1 : 0);
